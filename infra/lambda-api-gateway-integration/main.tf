variable "lambda_name" {
  type = string
}

variable "api_gateway_id" {
  type = string
}

variable "api_gateway_execution_arn" {
  type = string
}

data "aws_lambda_function" "function" {
  function_name = var.lambda_name
}

resource "aws_apigatewayv2_integration" "integration" {
  api_id           = var.api_gateway_id
  integration_type = "AWS_PROXY"
  integration_uri           = data.aws_lambda_function.function.arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "holding-valuation" {
  api_id = var.api_gateway_id
  route_key = "GET /holdings"
  target = "integrations/${aws_apigatewayv2_integration.integration.id}"
}

resource "aws_lambda_permission" "holding-valuation" {
  action = "lambda:InvokeFunction"
  function_name = data.aws_lambda_function.function.function_name
  principal = "apigateway.amazonaws.com"
  source_arn = "${var.api_gateway_execution_arn}/*/*/holdings"
}
