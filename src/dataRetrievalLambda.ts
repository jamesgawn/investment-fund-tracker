import {APIGatewayProxyHandlerV2} from "aws-lambda";
import Logger from "bunyan";
import {DynamoDBHelper} from "./lib/DynamoDBHelper";
import {IFund} from "./domain/IFund";
import {SecurityRetriever} from "./lib/SecurityRetriever";
import {IFundPrice} from "./domain/IFundPrice";

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
  const securityRetriever = new SecurityRetriever(log);
  // Get list of securities for which to obtain prices.
  const securityTable = new DynamoDBHelper<IFund>(log, "ift-securities");
  const securities = await securityTable.getRecords();
  // Retrieve and store the latest prices.
  const fundPriceTable = new DynamoDBHelper<IFundPrice>(log, "ift-fund-prices");
  await Promise.all(securities.map<Promise<void>>(async (fund) => {
    const fundPrice = await securityRetriever.getFundPrice(fund);
    await fundPriceTable.putRecord(fundPrice);
  }));
};
