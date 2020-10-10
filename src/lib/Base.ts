import {LoggerHelper} from "./LoggerHelper";
import Logger from "bunyan";
import {rethrowError, throwError} from "./Utils";

export class Base {
  log: LoggerHelper
  constructor(logger: Logger) {
    this.log = new LoggerHelper(logger, this.constructor["name"]);
  }

  protected throwError(friendlyMessage: string) {
    return throwError(this.log, friendlyMessage);
  }

  protected rethrowError(friendlyMessage: string, err: Error) {
    return rethrowError(this.log, friendlyMessage, err);
  }
}
