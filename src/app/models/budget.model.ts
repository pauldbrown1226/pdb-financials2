import { BudgetEntry } from "./budget-entry.model";

export class Budget {
  public budgetId: number;
  public budgetName: string;
  public reportName: string;
  public budgetDate: string;
  public annualExpTotal: number;
  public monthlyExpTotal: number;
  public reportExpTotal: number;
  public reserveTotal: number;
  public annualIncTotal: number;
  public monthlyIncTotal: number;
  public reportIncTotal: number;
  public budgetEntries: BudgetEntry[];

  constructor(
    budgetId: number,
    budgetName: string,
    reportName: string,
    budgetDate: string,
    annualExpTotal: number,
    monthlyExpTotal: number,
    reportExpTotal: number,
    reserveTotal: number,
    annualIncTotal: number,
    monthlyIncTotal: number,
    reportIncTotal: number,
    budgetEntries
  ) {
    this.budgetId = budgetId;
    this.budgetName = budgetName;
    this.reportName = reportName;
    this.budgetDate = budgetDate;
    this.annualExpTotal = annualExpTotal;
    this.monthlyExpTotal = monthlyExpTotal;
    this.reportExpTotal = reportExpTotal;
    this.reserveTotal = reserveTotal;
    this.annualIncTotal = annualIncTotal;
    this.monthlyIncTotal = monthlyIncTotal;
    this.reportIncTotal = reportIncTotal;
    this.budgetEntries = budgetEntries;
  }
}
