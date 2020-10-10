import {LoggerHelper} from "./LoggerHelper";
import Logger = require("bunyan");

describe("LoggerHelper", () => {
  let log: LoggerHelper;
  const name: string = "test";
  const infoMock: jest.Mock<void> = jest.fn();
  const errorMock: jest.Mock<void> = jest.fn();
  const mockChild: jest.Mock<Logger> = jest.fn();

  beforeEach(() => {
    const logger = {
      child: mockChild
    } as any;
    mockChild.mockReturnValue({
      info: infoMock,
      error: errorMock
    } as any);
    log = new LoggerHelper(logger, name);
    infoMock.mockReset();
    errorMock.mockReset();
  });
  describe("constructor", () => {
    test("should create logger with specified name", () => {
      expect(mockChild).toBeCalledWith({
        child: name,
      });
    });
  });
  describe("info", () => {
    test("should log info level message to logger with data", () => {
      const data = {
        pies: "pork"
      };
      log.info("test info message", data);
      expect(infoMock).toBeCalledWith( {
        data: data
      }, "test info message");
    });
    test("should log info level message to logger without data", () => {
      log.info("test info message2");
      expect(infoMock).toBeCalledWith( "test info message2");
    });
  });
  describe("error", () => {
    test("should log error level message to logger with extra data", () => {
      const data = {
        pies: "pork"
      };
      const err = new Error("nooooooo!");
      log.error("test error message", err, data);
      expect(errorMock).toBeCalledWith(err, "test error message", {
        data: data
      });
    });
    test("should log error level message to logger without extra dataa", () => {
      const err = new Error("nooooooo!");
      log.error("test error message 2", err);
      expect(errorMock).toBeCalledWith(err, "test error message 2");
    });
  });
  describe("error", () => {
    test("should log error level message to logger with extra data", () => {
      const data = {
        pies: "pork"
      };
      const err = new Error("nooooooo!");
      log.error("test error message", err, data);
      expect(errorMock).toBeCalledWith(err, "test error message", {
        data: data
      });
    });
    test("should log error level message to logger without extra dataa", () => {
      const err = new Error("nooooooo!");
      log.error("test error message 2", err);
      expect(errorMock).toBeCalledWith(err, "test error message 2");
    });
  });
});
