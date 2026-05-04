import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Report } from '../models/report.model';

@Injectable({
  providedIn: 'root',
})


export class ReportsService {

private reports: Report[];

  report: Report;
  
  host = environment.host;
  port = environment.apiPort;
  war = environment.war;

  baseUrl = this.host + ':' + this.port + this.war + '/';

  getAllUrl = this.baseUrl + 'reports/listreports';
  getUpdateUrl = this.baseUrl + 'reports/update';
  getReportUrl = this.baseUrl + 'reports/';
  getDeleteReportUrl = this.baseUrl + 'reports/';
  getImportReportUrl = this.baseUrl + 'reports/importReport/';
  getReportNamesUrl = this.baseUrl + 'reports/getReportNames';
   
constructor(private httpClient: HttpClient) {

}

fetchReports() {

    console.log('ReportService.fetchReports');
    console.log('url ' + this.getAllUrl);
    return this.httpClient
      // tslint:disable-next-line: object-literal-shorthand
      .get<Report[]>(this.getAllUrl);

  }

  fetchReport(reportId: number) {

    console.log('ReportService.fetchReport: reportId: ');

    return this.httpClient.get<Report>(this.getReportUrl + reportId);
  }

  addReport(reportName: string) {

    console.log('ReportService.addReport:' + reportName);
    console.log('url: ' + this.getReportUrl);
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.httpClient.get<Report>(
      this.getImportReportUrl + reportName
    );

  }



  updateReport(report: Report) {
    console.log('ReportService.updateReport:' + report.reportName);
    console.log('url: ' + this.getReportUrl + report.reportId);
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.httpClient.put<Report>(
      this.getUpdateUrl, report);
  }

  deleteReport(reportId: number) {
    console.log('ReportService.deleteeReport:' + reportId);

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.httpClient.delete(
      this.getDeleteReportUrl + '/' + reportId);
  }

  fetchReportNames() {

    console.log('FincialReportService.fetchReports');
    console.log('url ' + this.getReportNamesUrl);
    return this.httpClient
      // tslint:disable-next-line: object-literal-shorthand
      .get<string[]>(this.getReportNamesUrl);
  }



}
