import {IFund} from "./IFund";

export class Fund implements IFund {
  isin: string;
  name: string;

  constructor(isin: string, name: string) {
    this.isin = isin;
    this.name = name;
  }
}
