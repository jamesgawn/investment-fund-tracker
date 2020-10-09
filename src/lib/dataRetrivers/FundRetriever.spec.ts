import {retrieveFund} from "./FundRetriever";

describe("FundRetriever", () => {
  describe("retrieveFund", () => {
    test("should return fund price", () => {
      const isin = "GB001234";
      const name = "Super Fund";
      const price = 50;
      const fund = retrieveFund({
        isin: isin,
        name: name
      });
      expect(fund.isin).toBe(isin);
      expect(fund.name).toBe(name);
      expect(fund.price).toBe(price);
    });
  });
});
