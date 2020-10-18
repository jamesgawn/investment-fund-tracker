import {handler} from "./dataRetrievalLambda";
import {FundPrice} from "./domain/FundPrice";
import {Fund} from "./domain/Fund";

const mockGetRecords = jest.fn();
const mockPutRecord = jest.fn();
jest.mock("./lib/DynamoDBHelper", () => ({
  DynamoDBHelper: jest.fn().mockImplementation(() => ({
    getRecords: mockGetRecords,
    putRecord: mockPutRecord
  }))
}));

const mockGetFund = jest.fn();
jest.mock("./lib/SecurityRetriever", () => ({
  SecurityRetriever: jest.fn().mockImplementationOnce(() => ({
    getFundPrice: mockGetFund
  }))
}));

describe("dataRetrievalLambda", () => {
  const testFund = new Fund("GB0001", "Bingo Bob Fund");
  const date = new Date();
  const price = 50;
  const testFundPrice = new FundPrice(testFund, price, date);
  beforeEach(() => {
    mockGetRecords.mockResolvedValue([testFund]);
    mockGetFund.mockResolvedValue(testFundPrice);
  });
  describe("handler", () => {
    test("should run successfully", async () => {
      const event = {};
      const context = {
        awsRequestId: "testRequestId"
      };
      await expect(handler(event as any, context as any, {} as any)).resolves.not.toThrow();
      expect(mockGetFund).toBeCalledWith(testFund);
      expect(mockPutRecord).toBeCalledWith(testFundPrice);
    });
  });
});
