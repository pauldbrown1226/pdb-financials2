import { ReportEntry } from "./report-entry.model";

export class Report {

  public reportId: number;
  public reportName: string;
  public reportDate: string;
  public reportEntries: ReportEntry[];
  public expensesTotal: number;
  public ytdTotal: number;
  public budget: boolean;

  constructor(reportId: number,
              reportName: string,
              reportDate: string,
              reportEntries: ReportEntry[],
              expensesTotal: number,
              ytdTotal: number,
              budget: boolean) {

      this.reportId = reportId;
      this.reportName = reportName;
      this.reportDate = reportDate;
      this.reportEntries = reportEntries;
      this.expensesTotal = expensesTotal;
      this.ytdTotal = ytdTotal;
      this.budget = budget;

  }
}
