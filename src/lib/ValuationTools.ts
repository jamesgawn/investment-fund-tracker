import {DynamoDBHelper} from "./DynamoDBHelper";
import {IFundHolding} from "../domain/IFundHolding";
import {FundHoldingValuation} from "../domain/FundHoldingValuation";
import Logger from "bunyan";
import {FundValuation} from "../domain/FundValuation";
import {FundService} from "./FundService";

export async function valueHoldings(log: Logger) {
  log.info("Calculating fund holding valuations");
  const fundHoldingsTable = new DynamoDBHelper<IFundHolding>(log, "ift-fund-holdings");
  const fundService = new FundService(log);
  const fundHoldings = await fundHoldingsTable.getRecords();
  const fundHoldingValuations : FundHoldingValuation[] = [];
  for (const fundHolding of fundHoldings) {
    const fundPrice = await fundService.getLatestPrice(fundHolding.isin);
    fundHoldingValuations.push(new FundHoldingValuation(fundPrice, fundHolding));
  }
  log.info("Returning fund holding valuations", fundHoldingValuations);
  return fundHoldingValuations;
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
