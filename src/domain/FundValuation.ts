import {round} from "../lib/Utils";

export class FundValuation {
  originalValue: number;
  currentValue: number;
  profitValue: number;
  profitPercentage: number;
  constructor(originalValue: number, currentValue: number) {
    this.originalValue = round(originalValue, 2);
    this.currentValue = round(currentValue, 2);
    this.profitValue = round(currentValue - originalValue, 2);
    this.profitPercentage = round((currentValue - originalValue) / currentValue, 2);
  }
}
