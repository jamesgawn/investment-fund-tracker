import {DynamoDBHelper} from "./DynamoDBHelper";
import {IFundPrice} from "../domain/IFundPrice";
import {Base} from "./Base";
import Logger from "bunyan";

export class FundService extends Base {
  private priceTable: DynamoDBHelper<IFundPrice>
  constructor(log: Logger) {
    super(log);
    this.priceTable = new DynamoDBHelper<IFundPrice>(log, "ift-fund-prices");
  }

  async getLatestPrice(isin: string) {
    const fundPrice = await this.priceTable.queryRecordByKey({
      ":isin": isin
    }, "isin = :isin", 1, false);
    return fundPrice[1];
  }
}
