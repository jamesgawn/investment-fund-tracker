import {Fund} from "./Fund";
import {format} from "date-fns";
import {IFundPrice} from "./IFundPrice";

export class FundPrice extends Fund implements IFundPrice {
  price: number;
  date: string;

  constructor(fund: Fund, price: number, date: Date) {
    super(fund.isin, fund.name);
    this.price = price;
    this.date = format(date, "yyyy-MM-dd");
  }
}
