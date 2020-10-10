import {APIGatewayProxyHandlerV2} from "aws-lambda";
import Logger from "bunyan";

export const handler : APIGatewayProxyHandlerV2<void> = async (event, context) => {
  const log = Logger.createLogger({
    name: "ift-data-retrieval",
    src: true,
    awsRequestId: context.awsRequestId
  });
  log.info({
    event: event,
    context: context
  });
};
