import {SecurityRetriever} from "./SecurityRetriever";
import Logger from "bunyan";
import axios from "axios";
import {userAgent} from "./Utils";
import {format} from "date-fns";

jest.mock("axios");
const mockedAxios: jest.Mocked<typeof axios> = axios as any;

describe("SecurityRetriever", () => {
  const logger = Logger.createLogger({
    name: "SecurityRetriever - Test"
  });
  let sr: SecurityRetriever;
  beforeEach(() => {
    sr = new SecurityRetriever(logger);
    mockedAxios.get.mockReset();
  });
  describe("getFund", () => {
    test("should return fund price if value in page", async () => {
      mockedAxios.get.mockResolvedValue({
        data: '<html lang="en"><head><title></title></head><body>50.00 GBX</body></html>'
      });
      const isin = "GB00B0CNH163";
      const name = "Super Fund";
      const price = 50.0;
      const fundPrice = await sr.getFundPrice({
        isin: isin,
        name: name
      });
      expect(mockedAxios.get).toBeCalledWith("https://www.markets.iweb-sharedealing.co.uk/funds-centre/fund-supermarket/detail/GB00B0CNH163", {
        headers: {
          "User-Agent": userAgent
        }
      });
      expect(fundPrice.isin).toBe(isin);
      expect(fundPrice.name).toBe(name);
      expect(fundPrice.price).toBe(price);
      expect(fundPrice.date).toBe(format(new Date(), "yyyy-MM-dd"));
    });
    test("should throw error if page returns but price is not present", async () => {
      mockedAxios.get.mockResolvedValue({
        data: '<html lang="en"><head><title></title></head><body>pies GBX</body></html>'
      });
      const isin = "GB00B0CNH163";
      const name = "Super Fund";
      await expect(sr.getFundPrice({
        isin: isin,
        name: name
      })).rejects.toThrow("Unable to find match for ([0-9]+.[0-9][0-9]) GBX in page");
    });
    test("should throw error if page returns but is empty", async () => {
      mockedAxios.get.mockResolvedValue({
        data: undefined
      });
      const isin = "GB00B0CNH163";
      const name = "Super Fund";
      await expect(sr.getFundPrice({
        isin: isin,
        name: name
      })).rejects.toThrow("No contents in page https://www.markets.iweb-sharedealing.co.uk/funds-centre/fund-supermarket/detail/GB00B0CNH163");
    });
    test("should throw error if unable to retrieve page", async () => {
      const error = new Error("oops");
      mockedAxios.get.mockRejectedValue(error);
      const isin = "GB00B0CNH163";
      const name = "Super Fund";
      await expect(sr.getFundPrice({
        isin: isin,
        name: name
      })).rejects.toThrow(error);
    });
  });
});
