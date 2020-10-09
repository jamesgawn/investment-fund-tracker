import {Fund} from "./Fund";

describe("Fund", () => {
  describe("constructor", () => {
    test("should create fund with populated values", () => {
      const isin = "GB001234";
      const name = "Super Fund";
      const price = 50;
      const fund = new Fund(isin, name, price);
      expect(fund.isin).toBe(isin);
      expect(fund.name).toBe(name);
      expect(fund.price).toBe(price);
    });
  });
});
