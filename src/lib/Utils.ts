import {LoggerHelper} from "./LoggerHelper";

export const userAgent = "Investment Fund Tracker";
export function throwError(log: LoggerHelper, friendlyMessage: string) {
  return rethrowError(log, friendlyMessage, new Error(friendlyMessage));
}
export function rethrowError(log: LoggerHelper, friendlyMessage: string, err: Error) {
  log.error(friendlyMessage, err);
  return err;
}
