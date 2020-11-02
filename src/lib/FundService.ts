import {DynamoDBHelper} from "./DynamoDBHelper";
import {IFundPrice} from "../domain/IFundPrice";
import {Base} from "./Base";
import Logger from "bunyan";

export class FundService extends Base {
  private priceTable: DynamoDBHelper<IFundPrice>
  private priceCache: Map<string, IFundPrice> = new Map<string, IFundPrice>();
  constructor(log: Logger) {
    super(log);
    this.priceTable = new DynamoDBHelper<IFundPrice>(log, "ift-fund-prices");
  }

  async getLatestPrice(isin: string) {
    this.log.info(`Retrieving the latest price for ${isin}`);
    const cachedValue = this.priceCache.get(isin);
    if (cachedValue) {
      this.log.info(`Returning latest price for ${isin} from the cache`);
      return cachedValue;
    } else {
      const fundPrice = await this.priceTable.queryRecordByKey({
        ":isin": isin
      }, "isin = :isin", 1, false);
      this.priceCache.set(isin, fundPrice[0]);
      this.log.info(`Returning latest price for ${isin} from the DynamoDB`);
      return fundPrice[0];
    }
  }
}
