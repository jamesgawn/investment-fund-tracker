import {Fund} from "../../domain/Fund";

interface IFundInput {
  isin: string,
  name: string
}

export function retrieveFund(fund : IFundInput) : Fund {
  return new Fund(fund.isin, fund.name, 50);
}
