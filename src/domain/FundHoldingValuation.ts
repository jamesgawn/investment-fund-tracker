import {IFundHolding} from "./IFundHolding";
import {IFundPrice} from "./IFundPrice";
import {round} from "../lib/Utils";

export class FundHoldingValuation {
  date: string;
  isin: string;
  name: string;
  amount: number;
  originalPrice: number;
  originalValue: number;
  currentPrice: number;
  currentValue: number;
  profitValue: number;
  profitPercentage: number;

  constructor(fundPrice: IFundPrice, fundHolding: IFundHolding) {
    this.date = fundHolding.date;
    this.isin = fundPrice.isin;
    this.name = fundPrice.name;
    this.amount = fundHolding.amount;
    this.originalPrice = fundHolding.price;
    this.originalValue = round((this.originalPrice * this.amount) / 100, 2);
    this.currentPrice = fundPrice.price;
    this.currentValue = round((this.currentPrice * this.amount) / 100, 2);
    this.profitValue = round(this.currentValue - this.originalValue, 2);
    this.profitPercentage = round((this.currentValue - this.originalValue) / this.currentValue, 2);
  }
}
