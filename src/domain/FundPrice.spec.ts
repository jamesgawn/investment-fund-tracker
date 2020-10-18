import {Fund} from "./Fund";
import {FundPrice} from "./FundPrice";
import {parse} from "date-fns";

describe("Fund", () => {
  describe("constructor", () => {
    test("should create fund with populated values", () => {
      const isin = "GB001234";
      const name = "Super Fund";
      const fund = new Fund(isin, name);
      const price = 50;
      const date = parse("2019-01-01", "yyyy-MM-dd", new Date());
      const fundPrice = new FundPrice(fund, price, date);
      expect(fundPrice.isin).toBe(fund.isin);
      expect(fundPrice.name).toBe(fund.name);
      expect(fundPrice.price).toBe(price);
      expect(fundPrice.date).toBe("2019-01-01");
    });
  });
});
