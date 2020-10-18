import {IFundHolding} from "./IFundHolding";
import {IFundPrice} from "./IFundPrice";

export class FundHoldingValuation {
  isin: string;
  name: string;
  private readonly price: number;
  amount: number;
  currentPrice: number;

  constructor(fundPrice: IFundPrice, fundHolding: IFundHolding) {
    this.isin = fundPrice.isin;
    this.name = fundPrice.name;
    this.price = fundHolding.price;
    this.amount = fundHolding.amount;
    this.currentPrice = fundPrice.price;
  }

  get originalPrice() {
    return this.price;
  }

  get originalValue() {
    return this.price * this.amount;
  }

  get currentValue() {
    return this.currentPrice * this.amount;
  }

  get profitValue() {
    return this.currentValue - this.originalValue;
  }

  get profitPercentage() {
    return (this.currentValue - this.originalValue) / this.currentValue;
  }
}
