import {LoggerHelper} from "./LoggerHelper";
import Logger from "bunyan";
import {rethrowError, throwError} from "./Utils";

export class Base {
  log: LoggerHelper
  constructor(logger: Logger) {
    this.log = new LoggerHelper(logger, this.constructor["name"]);
  }

  protected throwError(friendlyMessage: string, data?: object) {
    return throwError(this.log, friendlyMessage, data);
  }

  protected rethrowError(friendlyMessage: string, err: Error, data?: object) {
    return rethrowError(this.log, friendlyMessage, err, data);
  }
}
