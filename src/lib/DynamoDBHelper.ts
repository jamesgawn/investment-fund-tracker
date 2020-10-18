import {DynamoDB} from "aws-sdk";
import {Base} from "./Base";
import Logger from "bunyan";

export class DynamoDBHelper<T extends object> extends Base {
  tableName: string;
  client: DynamoDB.DocumentClient;
  constructor(logger: Logger, tableName: string) {
    super(logger);
    this.tableName = tableName;
    this.client = new DynamoDB.DocumentClient({
      convertEmptyValues: true
    });
  }

  async getRecords() {
    try {
      const params = {
        TableName: this.tableName
      };
      this.log.info("Retrieving records");
      const records = await this.client.scan(params).promise();
      this.log.info("Retrieved records");
      return records.Items as T[];
    } catch (err) {
      throw this.rethrowError("Failed to retrieve records", err);
    }
  }

  async getRecordByKey(keyParameters: object) {
    try {
      const params = {
        TableName: this.tableName,
        Key: keyParameters
      };
      this.log.info("Retrieving record", keyParameters);
      const result = await this.client.get(params).promise();
      this.log.info("Retrieved record", keyParameters);
      return result.Item as T;
    } catch (err) {
      throw this.rethrowError("Failed to retrieve record", err, keyParameters);
    }
  }

  async queryRecordByKey(keyParameters: object, limit: number, asc: boolean) {
    try {
      const params = {
        TableName: this.tableName,
        Key: keyParameters,
        Limit: limit,
        ScanIndexForward: asc
      };
      this.log.info("Retrieving record", keyParameters);
      const result = await this.client.query(params).promise();
      this.log.info("Retrieved record", keyParameters);
      return result.Items as T[];
    } catch (err) {
      throw this.rethrowError("Failed to query records", err, keyParameters);
    }
  }

  async putRecord(record: T) {
    const params = {
      Item: record,
      TableName: this.tableName,
    };
    try {
      this.log.info("Putting record", record);
      const result = await this.client.put(params).promise();
      this.log.info("Put record", record);
      return result;
    } catch (err) {
      throw this.rethrowError("Failed to put record", err, record);
    }
  }
}
