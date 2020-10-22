import {DynamoDBHelper} from "./DynamoDBHelper";
import {PromiseResult} from "aws-sdk/lib/request";
import {AWSError} from "aws-sdk";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import Logger from "bunyan";

const mockScan = jest.fn();
const mockGet = jest.fn();
const mockQuery = jest.fn();
const mockPut = jest.fn();
jest.mock("aws-sdk", () => ({
  DynamoDB: {
    DocumentClient: jest.fn().mockImplementation(() => ({
      scan: mockScan,
      get: mockGet,
      query: mockQuery,
      put: mockPut
    }))
  }
}));

interface IRecord {
  id: string
}

describe("DynamoDBHelper", () => {
  let dbh : DynamoDBHelper<IRecord>;
  const tableName = "test-table";
  const logger = Logger.createLogger({
    name: "DynamoDBHelper - Test"
  });
  const testRecord1 = {
    id: "record1"
  };
  const testRecord2 = {
    id: "record2"
  };
  let mockScanPromise : jest.Mock<Promise<PromiseResult<DocumentClient.ScanInput, AWSError>>>;
  let mockGetPromise : jest.Mock<Promise<PromiseResult<DocumentClient.GetItemOutput, AWSError>>>;
  let mockQueryPromise : jest.Mock<Promise<PromiseResult<DocumentClient.QueryOutput, AWSError>>>;
  let mockPutPromise : jest.Mock<Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>>>;
  beforeEach(() => {
    dbh = new DynamoDBHelper<IRecord>(logger, tableName);
    mockScanPromise = jest.fn();
    mockGetPromise = jest.fn();
    mockQueryPromise = jest.fn();
    mockPutPromise = jest.fn();
    mockScan.mockImplementation(() => ({
      promise: mockScanPromise
    }));
    mockGet.mockImplementation(() => ({
      promise: mockGetPromise
    }));
    mockQuery.mockImplementation(() => ({
      promise: mockQueryPromise
    }));
    mockPut.mockImplementation(() => ({
      promise: mockPutPromise
    }));
  });
  describe("getRecords", () => {
    test("should return all records", async () => {
      mockScanPromise.mockResolvedValue({
        Items: [testRecord1, testRecord2]
      } as any);
      const records = await dbh.getRecords();
      expect(mockScan).toBeCalledWith({
        TableName: tableName
      });
      expect(records).toStrictEqual([testRecord1, testRecord2]);
    });
    test("should throw error if one occurs when attempting to retrieve a record", async () => {
      const sampleError = new Error("error");
      mockScanPromise.mockRejectedValue(sampleError);
      await expect(dbh.getRecords()).rejects.toThrow("error");
    });
  });
  describe("getRecord", () => {
    test("should return record if in table", async () => {
      mockGetPromise.mockResolvedValue({
        "Item": testRecord1
      } as any);
      const record = await dbh.getRecordByKey({
        id: "record1"
      });
      expect(mockGet).toBeCalledWith({
        TableName: tableName,
        Key: {
          "id": "record1",
        }
      });
      expect(record).toBe(testRecord1);
    });
    test("should throw error if one occurs when attempting to retrieve a record", async () => {
      const sampleError = new Error("error");
      mockGetPromise.mockRejectedValue(sampleError);
      await expect(dbh.getRecordByKey({
        id: "record1"
      })).rejects.toThrow("error");
    });
  });
  describe("queryRecord", () => {
    test("should return record if in table", async () => {
      mockQueryPromise.mockResolvedValue({
        "Items": [testRecord1]
      } as any);
      const record = await dbh.queryRecordByKey({
        id: "record1"
      }, "id: id", 1, false);
      expect(mockQuery).toBeCalledWith({
        TableName: tableName,
        ExpressionAttributeValues: {
          "id": "record1",
        },
        KeyConditionExpression: "id: id",
        Limit: 1,
        ScanIndexForward: false
      });
      expect(record).toStrictEqual([testRecord1]);
    });
    test("should throw error if one occurs when attempting to retrieve a record", async () => {
      const sampleError = new Error("error");
      mockQueryPromise.mockRejectedValue(sampleError);
      await expect(dbh.queryRecordByKey({
        id: "record1"
      }, "id: id", 1, false)).rejects.toThrow("error");
    });
  });
  describe("putRecord", () => {
    test("should return record", async () => {
      mockPutPromise.mockResolvedValue("something" as any);
      const response = await dbh.putRecord(testRecord2);
      expect(mockPut).toBeCalledWith({
        TableName: tableName,
        Item: testRecord2
      });
      expect(response).toBeDefined();
    });
    test("should throw error if one occurs when attempting to retrieve a record", async () => {
      mockPutPromise.mockRejectedValue(new Error("error"));
      await expect(dbh.putRecord(testRecord2)).rejects.toThrow("error");
    });
  });
});
