import {dataRetrievalHandler, holdingValuationHandler, valuationHandler} from "./lambda";
import {FundPrice} from "./domain/FundPrice";
import {Fund} from "./domain/Fund";

const mockGetRecords = jest.fn();
const mockPutRecord = jest.fn();
const mockQueryRecordsByKey = jest.fn();
jest.mock("./lib/DynamoDBHelper", () => ({
  DynamoDBHelper: jest.fn().mockImplementation(() => ({
    getRecords: mockGetRecords,
    putRecord: mockPutRecord,
    queryRecordByKey: mockQueryRecordsByKey
  }))
}));

const getLatestPrice = jest.fn();
jest.mock("./lib/FundService", () => ({
  FundService: jest.fn().mockImplementation(() => ({
    getLatestPrice: getLatestPrice
  }))
}));

const mockGetFund = jest.fn();
jest.mock("./lib/SecurityRetriever", () => ({
  SecurityRetriever: jest.fn().mockImplementationOnce(() => ({
    getFundPrice: mockGetFund
  }))
}));

describe("lambda", () => {
  const testFund = new Fund("GB0001", "Bingo Bob Fund");
  const date = new Date();
  const price = 50;
  const testFundPrice = new FundPrice(testFund, price, date);
  const event = {};
  const context = {
    awsRequestId: "testRequestId"
  };
  describe("dataRetrievalHandler", () => {
    beforeEach(() => {
      mockGetRecords.mockResolvedValue([testFund]);
      mockGetFund.mockResolvedValue(testFundPrice);
    });
    test("should run successfully", async () => {
      await expect(dataRetrievalHandler(event as any, context as any, {} as any)).resolves.not.toThrow();
      expect(mockGetFund).toBeCalledWith(testFund);
      expect(mockPutRecord).toBeCalledWith(testFundPrice);
    });
  });
  describe("holdingValuationHandler", ()=> {
    const testFundHolding = {
      isin: "GB0001",
      date: "2020-01-01",
      amount: 100,
      price: 50
    };
    const price = {
      isin: "GB001",
      name: "blah",
      price: 55,
      date: ""
    };
    beforeEach(() => {
      mockGetRecords.mockResolvedValue([testFundHolding]);
      mockQueryRecordsByKey.mockResolvedValue([price]);
    });
    test("should run successfully", async () => {
      expect(holdingValuationHandler(event as any, context as any, {} as any)).resolves.toEqual([{
        date: "2020-01-01",
        isin: "GB001",
        name: "blah",
        amount: 100,
        originalPrice: 50,
        originalValue: 50,
        currentPrice: 55,
        currentValue: 55,
        profitValue: 5,
        profitPercentage: 0.09
      }]);
    });
  });
  describe("valuationHandler", ()=> {
    const testFundHolding = {
      isin: "GB0001",
      date: "2020-01-01",
      amount: 100,
      price: 50
    };
    const price = {
      isin: "GB001",
      name: "blah",
      price: 55,
      date: ""
    };
    beforeEach(() => {
      mockGetRecords.mockResolvedValue([testFundHolding]);
      getLatestPrice.mockResolvedValue(price);
    });
    test("should run successfully", async () => {
      const result = await valuationHandler(event as any, context as any, {} as any);
      expect(result).toEqual({
        originalValue: 50,
        currentValue: 55,
        profitValue: 5,
        profitPercentage: 0.09
      });
    });
  });
});
