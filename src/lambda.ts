import {APIGatewayProxyHandlerV2} from "aws-lambda";
import {DynamoDBHelper} from "./lib/DynamoDBHelper";
import {IFund} from "./domain/IFund";
import {SecurityRetriever} from "./lib/SecurityRetriever";
import {IFundPrice} from "./domain/IFundPrice";
import {LoggerHelper} from "./lib/LoggerHelper";
import {IFundHolding} from "./domain/IFundHolding";

export const dataRetrievalHandler : APIGatewayProxyHandlerV2<void> = async (event, context) => {
  const log = LoggerHelper.createLogger("ift-data-retrieval", event, context);
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

export const holdingValuationHandler : APIGatewayProxyHandlerV2<IFundHolding[]> = async (event, context) => {
  const log = LoggerHelper.createLogger("ift-holding-valuation", event, context);
  const fundHoldingsTable = new DynamoDBHelper<IFundHolding>(log, "ift-fund-holdings");
  return await fundHoldingsTable.getRecords();
};
