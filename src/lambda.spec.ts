import {dataRetrievalHandler, holdingValuationHandler} from "./lambda";
import {FundPrice} from "./domain/FundPrice";
import {Fund} from "./domain/Fund";

const mockGetRecords = jest.fn();
const mockPutRecord = jest.fn();
// jest.mock("./lib/DynamoDBHelper", () => ({
//   DynamoDBHelper: jest.fn().mockImplementation(() => ({
//     getRecords: mockGetRecords,
//     putRecord: mockPutRecord
//   }))
// }));

const mockGetFund = jest.fn();
// jest.mock("./lib/SecurityRetriever", () => ({
//   SecurityRetriever: jest.fn().mockImplementationOnce(() => ({
//     getFundPrice: mockGetFund
//   }))
// }));

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
    beforeEach(() => {
      mockGetRecords.mockResolvedValue([testFundHolding]);
    });
    test("should run successfully", async () => {
      expect(holdingValuationHandler(event as any, context as any, {} as any)).resolves.not.toThrow();
    });
  });
});
