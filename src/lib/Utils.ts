import {LoggerHelper} from "./LoggerHelper";

export const userAgent = "Investment Fund Tracker";
export function throwError(log: LoggerHelper, friendlyMessage: string, data?: object) {
  return rethrowError(log, friendlyMessage, new Error(friendlyMessage), data);
}
export function rethrowError(log: LoggerHelper, friendlyMessage: string, err: Error, data?: object) {
  log.error(friendlyMessage, err, data);
  return err;
}
export function round(value: number, places: number) {
  return +(value.toFixed(places));
}
