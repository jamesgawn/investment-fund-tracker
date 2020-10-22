import {DynamoDBHelper} from "./lib/DynamoDBHelper";
import {IFund} from "./domain/IFund";
import {SecurityRetriever} from "./lib/SecurityRetriever";
import {IFundPrice} from "./domain/IFundPrice";
import {LoggerHelper} from "./lib/LoggerHelper";
import {IFundHolding} from "./domain/IFundHolding";
import {FundHoldingValuation} from "./domain/FundHoldingValuation";
import {APIGatewayProxyHandlerV2} from "aws-lambda";

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

export const holdingValuationHandler : APIGatewayProxyHandlerV2<FundHoldingValuation[]> = async (event, context) => {
  const log = LoggerHelper.createLogger("ift-holding-valuation", event, context);
  log.info("Calculating fund holding valuations");
  const fundHoldingsTable = new DynamoDBHelper<IFundHolding>(log, "ift-fund-holdings");
  const fundPriceTable = new DynamoDBHelper<IFundPrice>(log, "ift-fund-prices");
  const fundHoldings = await fundHoldingsTable.getRecords();
  const fundHoldingValuation = await Promise.all(fundHoldings.map<Promise<FundHoldingValuation>>(async (fundHolding) => {
    const fundPrice = await fundPriceTable.queryRecordByKey({
      ":isin": fundHolding.isin
    }, "isin = :isin", 1, false);
    return new FundHoldingValuation(fundPrice[0], fundHolding);
  }));
  log.info("Returning fund holding valuations", fundHoldingValuation);
  return fundHoldingValuation;
};
