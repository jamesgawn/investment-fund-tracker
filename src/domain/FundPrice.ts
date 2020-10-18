import {Fund} from "./Fund";

export class FundPrice {
  fund: Fund;
  price: number;
  date: Date;

  constructor(fund: Fund, price: number, date: Date) {
    this.fund = fund;
    this.price = price;
    this.date = date;
  }
}
