export class ReserveCategoryHistory {
  public categoryId: number;
  public label: string;
  public name: string;
  public description: string;
  public reserveDate: string;
  public reserveEntryId: number;
  public amount: number;
  public subtotal: number;

  constructor(
    categoryId: number,
    label: string,
    name: string,
    description: string,
    reserveDate: string,
    reserveEntryId: number,
    amount: number,
    subtotal: number) {

      this.categoryId = categoryId;
      this.label = label;
      this.name = name;
      this.description = description;
      this.reserveDate = reserveDate;
      this.reserveEntryId = reserveEntryId;
      this.amount = amount;
      this.subtotal = subtotal;

    }
}
