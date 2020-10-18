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

module "data-retrieval-lambda" {
  source = "./infra/lambda-scheduled"
  name = "${var.name}-data-retrieval"
  description = "A lambda function to regularly retrieve and store the latest security prices."
  handler = "dataRetrievalLambda.handler"
  source_dir = "${path.module}/dist"
  notification_sns_queue_name = var.notification_sns_queue_name
  timeout = 10
}

resource "aws_iam_policy" "data-retrieval" {
  name = "${var.name}-data-retrieval"
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
              "dynamodb:Scan"
          ],
          "Resource": "arn:aws:dynamodb:*:*:table/${var.name}-*"
      }
  ]
}
  EOF
}

resource "aws_iam_role_policy_attachment" "lambda_execution_dynamodb_access_attachment" {
  policy_arn = aws_iam_policy.data-retrieval.arn
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
