export class Fund {
  isin: string;
  name: string;
  price: number;
  constructor(isin: string, name: string, price: number) {
    this.isin = isin;
    this.name = name;
    this.price = price;
  }
}
