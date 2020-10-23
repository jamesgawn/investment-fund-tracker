import {round} from "../lib/Utils";

export class FundValuation {
  originalValue: number;
  currentValue: number;
  profitValue: number;
  profitPercentage: number;
  constructor(originalValue: number, currentValue: number) {
    this.originalValue = originalValue;
    this.currentValue = currentValue;
    this.profitValue = round(currentValue - originalValue, 2);
    this.profitPercentage = round((this.currentValue - this.originalValue) / this.currentValue, 2);
  }
}
