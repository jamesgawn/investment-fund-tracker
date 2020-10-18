import Logger from "bunyan";
import {Base} from "./Base";
import axios, {AxiosResponse} from "axios";
import {userAgent} from "./Utils";
import {IFund} from "../domain/IFund";
import {FundPrice} from "../domain/FundPrice";

export class SecurityRetriever extends Base {
  constructor(logger: Logger) {
    super(logger);
  }

  async getFundPrice(fund : IFund) {
    const rawPage = await this.getWebPage(`https://www.markets.iweb-sharedealing.co.uk/funds-centre/fund-supermarket/detail/${fund.isin}`);
    const rawPrice = this.findStringInPage(rawPage, "([0-9]+\.[0-9][0-9]) GBX");
    const price = Number.parseFloat(rawPrice);
    return new FundPrice(fund, price, new Date());
  }

  private async getWebPage(url: string) {
    // Get the page, if not throw an error
    let response : AxiosResponse<string>;
    try {
      this.log.info(`Retrieving page ${url}`);
      response = await axios.get<string>(url, {
        headers: {
          "User-Agent": userAgent
        }
      });
    } catch (err) {
      throw this.rethrowError(`Failed to retrieve page ${url}`, err);
    }
    this.log.info(`Retrieved page ${url}`);
    if (response.data) {
      this.log.info(`Found contents of page ${url}`);
      return response.data;
    } else {
      throw this.throwError(`No contents in page ${url}`);
    }
  }

  private findStringInPage(page : string, regex: string) {
    const match = page.match(regex);
    if (match && match[1]) {
      this.log.info(`Found match for regex ${regex}`);
      return match[1];
    } else {
      throw this.throwError(`Unable to find match for ${regex} in page`);
    }
  };
}
