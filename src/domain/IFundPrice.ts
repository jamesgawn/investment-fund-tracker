import {IFund} from "./IFund";

export interface IFundPrice extends IFund {
  price: number
  date: string
}
