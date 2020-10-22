import {FundHoldingValuation} from "./FundHoldingValuation";
import {Fund} from "./Fund";
import {FundPrice} from "./FundPrice";
import {parse} from "date-fns";

describe("FundHoldingValuation", () => {
  const isin = "GB001234";
  const name = "Super Fund";
  const fund = new Fund(isin, name);
  const price = 50;
  const date = parse("2019-01-01", "yyyy-MM-dd", new Date());
  const fundPrice = new FundPrice(fund, price, date);
  const fundHolding = {
    isin: isin,
    price: 45,
    amount: 100,
    date: "2018-01-01"
  };
  let fundHoldingValuation: FundHoldingValuation;
  beforeEach(() => {
    fundHoldingValuation = new FundHoldingValuation(fundPrice, fundHolding);
  });
  describe("constructor", () => {
    test("should create fund holding valuation with populated values", () => {
      expect(fundHoldingValuation.isin).toBe("GB001234");
      expect(fundHoldingValuation.name).toBe("Super Fund");
      expect(fundHoldingValuation.currentPrice).toBe(50);
      expect(fundHoldingValuation.currentValue).toBe(50);
      expect(fundHoldingValuation.originalValue).toBe(45);
      expect(fundHoldingValuation.amount).toBe(100);
      expect(fundHoldingValuation.originalPrice).toBe(45);
      expect(fundHoldingValuation.profitValue).toBe(5);
      expect(fundHoldingValuation.profitPercentage).toBe(0.1);
    });
  });
});
