import { Category } from "./category-model";

export class ReserveEntry {

  public reserveEntryId: number;
  public amount: number;
  public subtotal: number;
  public createDate: string;
  public category: Category;

  constructor(
    reserveEntryId: number,
    amount: number,
    subtotal: number,
    createDate: string,
    category: Category) {

    this.reserveEntryId = reserveEntryId;
    this.amount = amount;
    this.subtotal = subtotal;
    this.createDate = createDate;
    this.category = category;

  }

}
