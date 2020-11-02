variable "name" {
  type = string
}

variable "description" {
  type = string
  default = ""
}

variable "handler" {
  type = string
}

variable "source_dir" {
  type = string
}

variable "memory_size" {
  type = number
  default = 128
}

variable "timeout" {
  type = number
  default = 3
}

variable "schedule" {
  type = string
  default = "rate(15 minutes)"
}

variable "notification_sns_queue_name" {
  type = string
  description = "The name of the SNS queue to send ok/error alarms if the lambda stops working."
}

variable "periodsFailingForAlarm" {
  type = number
  default = 2
}

module "lambda" {
  source = "../lambda-simple"
  name = var.name
  description = var.description
  handler = var.handler
  source_dir = var.source_dir
  memory_size = var.memory_size
  timeout = var.timeout
  notification_sns_queue_name = var.notification_sns_queue_name
  periodsFailingForAlarm = var.periodsFailingForAlarm
}

resource "aws_cloudwatch_event_rule" "scheduled_event_rule" {
  name = "${var.name}-trigger-rule"
  schedule_expression = var.schedule
  description = "A rule to regularly trigger the bfi imax new film notifier lambda."
}

resource "aws_cloudwatch_event_target" "scheduled_event_target" {
  arn = module.lambda.lambda_function_arn
  rule = aws_cloudwatch_event_rule.scheduled_event_rule.name
}

resource "aws_lambda_permission" "allow_clowdwatch_to_trigger_lambda" {
  statement_id = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda.lambda_function_arn
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.scheduled_event_rule.arn
}

output "lambda_execution_role_name" {
  value = module.lambda.lambda_execution_role_name
}

output "lambda_function_arn" {
  value = module.lambda.lambda_function_arn
}
