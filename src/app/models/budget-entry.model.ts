import { Budget } from "./budget.model";
import { Category } from "./category-model";

export class BudgetEntry {
  public budgetEntryId: number;
  public annualAmount: number;
  public prevAnnualAmount: number;
  public monthlyAmount: number;
  public reportAmount: number;
  public createDate: string;
  public rowNo: number;
  public category: Category;
  public budgetId: number;
  


  constructor(
    budgetEntryId: number,
    annualAmount: number,
    prevAnnualAmount: number,
    monthlyAmount: number,
    reportAmount: number,
    createDate: string,
    rowNo: number,
    category: Category,
    budgetId: number
  ) {
    this.budgetEntryId = budgetEntryId;
    this.annualAmount = annualAmount;
    this.prevAnnualAmount = prevAnnualAmount;
    this.monthlyAmount = monthlyAmount;
    this.reportAmount = reportAmount;
    this.createDate = createDate;
    this.rowNo = rowNo;
    this.category = category;
    this.budgetId = budgetId;
  
  }
}
