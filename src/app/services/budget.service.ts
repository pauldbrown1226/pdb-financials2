import { BudgetEntry } from './../models/budget-entry.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Budget } from './../models/budget.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BudgetEntryDto } from '../models/update-budget-entry-dto.model';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  budgetsObservable: any = [];
  budgetObservable: any;
  private budgets: Budget[];

  budgetsChanged = new Subject<Budget[]>();
  budgetChanged = new Subject<Budget>();
  errorSub = new Subject<any>();

  host = environment.host;
  port = environment.apiPort;
  war = environment.war;

  baseUrl = this.host + ':' + this.port + this.war + '/';
  getAllUrl = this.baseUrl + 'budgets/listbudgets';
  getUpdateUrl = this.baseUrl + 'budgets/update/';
  getCreateUrl = this.baseUrl + 'budgets/createBudget/';
  getBudgetUrl = this.baseUrl + 'budgets/getBudget/';
  getLatestBudgetUrl = this.baseUrl + 'budgets/latestBudget';
  getDeleteBudgetUrl = this.baseUrl + 'budgets/';
  getBudgeEntrytUrl = this.baseUrl + 'budgets/getBudgetEntry/';
  getUpdateBudgeEntrytUrl =
    this.baseUrl + 'budgets/updateBudgetEntry';
  getDeleteBudgeEntrytUrl =
    this.baseUrl + 'budgets/deleteBudgetEntry/';
  getCopyBudgetUrl = this.baseUrl + 'budgets/copyBudget';

  constructor(private httpClient: HttpClient) {}

  fetchBudgets() {
    console.log('REportService.fetchBudgets');
    console.log('url ' + this.getAllUrl);
    return this.httpClient.get<Budget[]>(this.getAllUrl)

  }

  fetchLatestBudget() {
    console.log('BudgetService.fetchLatestBudget');
    console.log('url ' + this.getLatestBudgetUrl);
    return this.httpClient.get<Budget>(this.getLatestBudgetUrl);
  }

  fetchBudget(budgetId: number) {
    console.log('BudgetService.fetchBudget: budgetId: ');

    return this.httpClient.get<Budget>(this.getBudgetUrl + budgetId);
  }

  createBudget(reportName: string) {
    console.log('BudgetService.createBudget: reportName: ');

    return this.httpClient.get<Budget>(this.getCreateUrl + reportName);
  }

  copyBudget(bId: number, budgetName: string) {
    const budgetId = '' + bId;
    console.log('BudgetService.copyBudget');
    return this.httpClient.get<Budget>(this.getCopyBudgetUrl, {
      params: {
        budgetId,
        budgetName,
      },
    });
  }

  deleteBudget(budgetId: number) {
    console.log('BudgetService.deleteeBudget:' + budgetId);

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    return this.httpClient.delete(this.getDeleteBudgetUrl + '/' + budgetId);
  }

    fetchBudgetEntry(budgetEntryId: number) {
    console.log('BudgetService.fetchBudgetEntry');

    return this.httpClient.get<BudgetEntry>(this.getBudgeEntrytUrl + budgetEntryId);
  }


  updatgeBudgetEntry(entryDto: BudgetEntryDto) {
  
    console.log('BudgetService.updateBudgetEntry:');
    console.log('url: ' + this.getUpdateBudgeEntrytUrl);
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    return this.httpClient.put<Budget>(this.getUpdateBudgeEntrytUrl, entryDto);
  }

  deleteBudgetEntry(budgetEntryId: number) {
    console.log('BudgetService.deleteeBudgetEntry:' + budgetEntryId);

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    return this.httpClient.delete(this.getDeleteBudgeEntrytUrl + budgetEntryId);
  }

  setBudgets(budgets: Budget[]) {
    this.budgets = budgets;
    console.log('BudgetService.setBudgets');

    this.budgetsChanged.next(this.budgets);
  }
}
