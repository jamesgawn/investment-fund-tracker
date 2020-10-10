import {DynamoDBHelper} from "./DynamoDBHelper";
import {PromiseResult} from "aws-sdk/lib/request";
import {AWSError} from "aws-sdk";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import Logger from "bunyan";
import {IRecord} from "../domain/IRecord";

const mockGet = jest.fn();
const mockPut = jest.fn();
jest.mock("aws-sdk", () => ({
  DynamoDB: {
    DocumentClient: jest.fn().mockImplementation(() => ({
      get: mockGet,
      put: mockPut
    }))
  }
}));

describe("DynamoDBHelper", () => {
  let dbh : DynamoDBHelper;
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
  let mockGetPromise : jest.Mock<Promise<PromiseResult<DocumentClient.GetItemOutput, AWSError>>>;
  let mockPutPromise : jest.Mock<Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>>>;
  beforeEach(() => {
    dbh = new DynamoDBHelper(logger, tableName);
    mockGetPromise = jest.fn();
    mockPutPromise = jest.fn();
    mockGet.mockImplementation(() => ({
      promise: mockGetPromise
    }));
    mockPut.mockImplementation(() => ({
      promise: mockPutPromise
    }));
  });
  describe("getRecord", () => {
    test("should return record if in table", async () => {
      mockGetPromise.mockResolvedValue({
        "Item": testRecord1
      } as any);
      const film = await dbh.getRecordById<IRecord>("record1");
      expect(mockGet).toBeCalledWith({
        TableName: tableName,
        Key: {
          "id": "record1",
        }
      });
      expect(film).toBe(testRecord1);
    });
    test("should throw error if one occurs when attempting to retrieve a record", async () => {
      const sampleError = new Error("error");
      mockGetPromise.mockRejectedValue(sampleError);
      await expect(dbh.getRecordById<IRecord>("film1")).rejects.toThrow("error");
    });
  });
  describe("putRecord", () => {
    test("should return record", async () => {
      mockPutPromise.mockResolvedValue("something" as any);
      const response = await dbh.putRecord<IRecord>(testRecord2);
      expect(mockPut).toBeCalledWith({
        TableName: tableName,
        Item: testRecord2
      });
      expect(response).toBeDefined();
    });
    test("should throw error if one occurs when attempting to retrieve a record", async () => {
      mockPutPromise.mockRejectedValue(new Error("error"));
      await expect(dbh.putRecord<IRecord>(testRecord2)).rejects.toThrow("error");
    });
  });
});
