import { Category } from "./category-model";
export class ReportEntry {
  public reportEntryId: number;
  public amount: number;
  public ytdAmount: number;
  public createDate: string;
  public category: Category;

  constructor(
    reportEntryId: number,
    amount: number,
    ytdAmount: number,
    createDate: string,
    category: Category
  ) {
    this.reportEntryId = reportEntryId;
    this.amount = amount;
    this.ytdAmount = ytdAmount;
    this.createDate = createDate;
    this.category = category;
  }
}
