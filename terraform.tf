variable "profile" {
  type = string
  default = "default"
}

variable "region" {
  type = string
  default = "eu-west-2"
}

variable "name" {
  type = string
  default = "ift"
}

variable "domain" {
  type = string
}

variable "cert_domain" {
  type = string
}

variable "zone" {
  type = string
}

variable "notification_sns_queue_name" {
  type = string
  description = "The name of the SNS queue to send ok/error alarms if the lambda stops working."
}

provider "aws" {
  region = var.region
  profile = var.profile
}

terraform {
  backend "s3" {
    bucket = "ana-terraform-state-prod"
    key = "investment-fund-tracker/terraform.tfstate"
    region = "eu-west-2"
  }
}

resource "aws_iam_policy" "ift-lambda-data-store-access" {
  name = "${var.name}-lambda-data-store-access"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
      {
          "Effect": "Allow",
          "Action": [
              "dynamodb:PutItem",
              "dynamodb:GetItem",
              "dynamodb:UpdateItem",
              "dynamodb:Scan",
              "dynamodb:Query"
          ],
          "Resource": "arn:aws:dynamodb:*:*:table/${var.name}-*"
      }
  ]
}
  EOF
}

module "data-retrieval-lambda" {
  source = "./infra/lambda-scheduled"
  name = "${var.name}-data-retrieval"
  description = "A lambda function to regularly retrieve and store the latest security prices."
  handler = "lambda.dataRetrievalHandler"
  source_dir = "${path.module}/dist"
  notification_sns_queue_name = var.notification_sns_queue_name
  timeout = 10
}

resource "aws_iam_role_policy_attachment" "data-retrieval-lambda" {
  policy_arn = aws_iam_policy.ift-lambda-data-store-access.arn
  role = module.data-retrieval-lambda.lambda_execution_role_name
}

resource "aws_dynamodb_table" "securities" {
  name = "${var.name}-securities"
  billing_mode = "PAY_PER_REQUEST"
  hash_key = "isin"

  attribute {
    name = "isin"
    type = "S"
  }
}

resource "aws_dynamodb_table" "fund-prices" {
  name = "${var.name}-fund-prices"
  billing_mode = "PAY_PER_REQUEST"
  hash_key = "isin"
  range_key = "date"

  attribute {
    name = "isin"
    type = "S"
  }

  attribute {
    name = "date"
    type = "S"
  }
}

module "holding-valuation-lambda" {
  source = "./infra/lambda-simple"
  name = "${var.name}-holding-valuation"
  description = "A lambda function to calculate the currently holding valuation."
  handler = "lambda.holdingValuationHandler"
  source_dir = "${path.module}/dist"
  notification_sns_queue_name = var.notification_sns_queue_name
  timeout = 10
}

resource "aws_iam_role_policy_attachment" "holding-valuation-lambda" {
  policy_arn = aws_iam_policy.ift-lambda-data-store-access.arn
  role = module.holding-valuation-lambda.lambda_execution_role_name
}

resource "aws_dynamodb_table" "fund-holdings" {
  name = "${var.name}-fund-holdings"
  billing_mode = "PAY_PER_REQUEST"
  hash_key = "isin"
  range_key = "date"

  attribute {
    name = "isin"
    type = "S"
  }

  attribute {
    name = "date"
    type = "S"
  }
}

resource "aws_apigatewayv2_api" "api" {
  name          = "ift-api"
  protocol_type = "HTTP"
  disable_execute_api_endpoint = true
}

resource "aws_cloudwatch_log_group" "api" {
  name = "${var.name}-api"
  retention_in_days = 14
}

resource "aws_apigatewayv2_stage" "api" {
  api_id = aws_apigatewayv2_api.api.id
  name   = "prod"
  auto_deploy = true
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api.arn
    format = <<EOF
    { "requestId":"$context.requestId", "ip": "$context.identity.sourceIp", "requestTime":"$context.requestTime", "httpMethod":"$context.httpMethod","routeKey":"$context.routeKey", "status":"$context.status","protocol":"$context.protocol", "responseLength":$context.responseLength, "integrationStatus": $context.integrationStatus, "integrationErrorMessage": "$context.integrationErrorMessage", "integration": { "error": "$context.integration.error", "integrationstatus": $context.integration.integrationStatus, "latency": $context.integration.latency, "requestId": "$context.integration.requestId", "status": $context.integration.status } }
EOF
  }
}

resource "aws_apigatewayv2_integration" "holding-valuation" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri           = module.holding-valuation-lambda.lambda_function_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "holding-valuation" {
  api_id = aws_apigatewayv2_api.api.id
  route_key = "GET /holdings"
  target = "integrations/${aws_apigatewayv2_integration.holding-valuation.id}"
}

resource "aws_lambda_permission" "holding-valuation" {
  action = "lambda:InvokeFunction"
  function_name = module.holding-valuation-lambda.name
  principal = "apigateway.amazonaws.com"
  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*/holdings"
}

data "aws_acm_certificate" "api_cert" {
  domain   = var.cert_domain
  statuses = ["ISSUED"]
}

resource "aws_apigatewayv2_domain_name" "api" {
  domain_name = var.domain

  domain_name_configuration {
    certificate_arn = data.aws_acm_certificate.api_cert.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

resource "aws_apigatewayv2_api_mapping" "example" {
  api_id      = aws_apigatewayv2_api.api.id
  domain_name = aws_apigatewayv2_domain_name.api.id
  stage       = aws_apigatewayv2_stage.api.id
}

data "aws_route53_zone" "api" {
  name = var.zone
  private_zone = false
}

resource "aws_route53_record" "api" {
  name    = aws_apigatewayv2_domain_name.api.domain_name
  type    = "A"
  zone_id = data.aws_route53_zone.api.zone_id

  alias {
    name                   = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.api.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = false
  }
}
