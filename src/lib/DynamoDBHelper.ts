import {DynamoDB} from "aws-sdk";
import {Base} from "./Base";
import Logger from "bunyan";
import {IRecord} from "../domain/IRecord";

export class DynamoDBHelper<T extends IRecord> extends Base {
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
      return records.Items as IRecord[];
    } catch (err) {
      throw this.rethrowError("Failed to retrieve records", err);
    }
  }

  async getRecordById(id: string) {
    try {
      const params = {
        TableName: this.tableName,
        Key: {
          "id": id,
        }
      };
      this.log.info(`Retrieving record ${id}`);
      const result = await this.client.get(params).promise();
      this.log.info(`Retrieved record ${id}`);
      return result.Item as T;
    } catch (err) {
      throw this.rethrowError(`Failed to retrieve record ${id}`, err);
    }
  }

  async putRecord(record: T) {
    const params = {
      Item: record,
      TableName: this.tableName,
    };
    try {
      this.log.info(`Putting record ${record.id}`);
      const result = await this.client.put(params).promise();
      this.log.info(`Put record ${record.id}`);
      return result;
    } catch (err) {
      throw this.rethrowError(`Failed to put record ${record.id}`, err);
    }
  }
}
