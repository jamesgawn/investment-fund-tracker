import {FundService} from "./FundService";
import Logger from "bunyan";

const mockGetRecords = jest.fn();
const mockPutRecord = jest.fn();
const mockQueryRecordsByKey = jest.fn();
jest.mock("./DynamoDBHelper", () => ({
  DynamoDBHelper: jest.fn().mockImplementation(() => ({
    getRecords: mockGetRecords,
    putRecord: mockPutRecord,
    queryRecordByKey: mockQueryRecordsByKey
  }))
}));

describe("FundService", () => {
  let fundService: FundService;
  const price = {
    isin: "GB001",
    name: "blah",
    price: 55,
    date: ""
  };
  describe("getLatestPrice", () => {
    beforeEach(() => {
      const log = Logger.createLogger({
        name: "Fund Service Test"
      });
      fundService = new FundService(log);
      mockQueryRecordsByKey.mockResolvedValue([price]);
    });
    test("should cache result so DynamoDB is only queried once", async () => {
      const priceResult1 = await fundService.getLatestPrice("GB001");
      const priceResult2 = await fundService.getLatestPrice("GB001");
      expect(priceResult1).toBe(price);
      expect(priceResult2).toBe(price);
      expect(mockQueryRecordsByKey).toHaveBeenCalledTimes(1);
    });
  });
});
