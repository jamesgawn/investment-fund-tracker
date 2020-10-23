import {DynamoDBHelper} from "./DynamoDBHelper";
import {IFundHolding} from "../domain/IFundHolding";
import {IFundPrice} from "../domain/IFundPrice";
import {FundHoldingValuation} from "../domain/FundHoldingValuation";
import Logger from "bunyan";
import {FundValuation} from "../domain/FundValuation";

export async function valueHoldings(log: Logger) {
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
}

export async function valueAll(log: Logger) {
  const fundHoldingValuation = await valueHoldings(log);
  let originalValue = 0;
  let currentValue = 0;
  for (const holding of fundHoldingValuation) {
    originalValue += holding.originalValue;
    currentValue += holding.currentValue;
  }
  return new FundValuation(originalValue, currentValue);
}
