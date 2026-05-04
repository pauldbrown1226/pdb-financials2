import { ReserveTotals } from './../models/reserve-totals.model';
import { ReserveCategoryHistory } from './../models/reserve-category-history.model';
import { ReservePage } from './../models/reserve-page.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Reserve } from './../models/reserve.model';
import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { FileSelect } from '../models/file-select.model';
@Injectable({
  providedIn: 'root'
})
export class ReserveService {

  reservesObservable: any = [];
  reserveObservable: any;
  reservesCategoryHistoryObservable: any;
  private reserves: Reserve[];
  private reservePage: ReservePage;
  private reserveCategoryHistorys: ReserveCategoryHistory[];

  private reserve: Reserve;

  host = environment.host;
  port = environment.apiPort;
  war = environment.war;

  baseUrl = this.host + ':' + this.port + this.war + '/';
  getAddReserveUrl = this.baseUrl + 'reserve';
  getAllUrl = this.baseUrl + 'reserve';
  getUpdateUrl = this.baseUrl + 'reserve/update/';
  getReserveUrl = this.baseUrl + 'reserve/';
  getBalanceReserveUrl = this.baseUrl + 'reserve/balanceReserve/';
  getFileNamesUrl = this.baseUrl + 'reserve/getFileNames/';
  createReserveFromFileUrl = this.baseUrl + 'reserve/createReserveFromFile';
  updateReserveTotalsUrl = this.baseUrl + 'reserve/updateReserveTotals';
  getDeleteReserveUrl = this.baseUrl + 'reserve/';
  getReserveHistoryUrl = this.baseUrl + 'reserve/getReserveHistoryEntries/';
  getDeleteOldestReservesUrl = this.baseUrl + 'reserve/deleteReservesByOldestYear';
  getFindOldestYear =  this.baseUrl + 'reserve/findOldestYear';
  constructor(private http: HttpClient) {}

  fetchReserves(pageNo: string) {


    console.log('ReportService.fetchReserves');
    console.log('url ' + this.getAllUrl);
    return this.http
      // tslint:disable-next-line: object-literal-shorthand
      .get<ReservePage>(this.getAllUrl, {
        params: {
          pageNo
        },
      })

  }

  fetchReserve(reserveId: number) {

    console.log('ReserveService.fetchReserve: reserveId: ');

    return this.http.get<Reserve>(this.getReserveUrl + reserveId);
  }

  findOldestYear() {



    console.log('ReserveService.fetchReserve: reserveId: ');

    return this.http.get<number>(this.getFindOldestYear);
  }

  fetchBalanceReserve() {

    console.log('ReserveService.fetchBalanceReserve');

    return this.http.get<Reserve>(this.getBalanceReserveUrl);
  }

  addReserve(reserve: Reserve) {

    console.log('ReserveService.addReserve:');
    console.log('url: ' + this.getReserveUrl);
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.post<Reserve>(
      this.getAddReserveUrl, reserve);

  }

  getFileNames(type: string) {

    console.log('ReportService.getFileNames:' + type);
    console.log('url: ' + this.getFileNamesUrl);
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.get<string[]>(
      this.getFileNamesUrl + type
    );

  }


  getReserveFromFile(fileSelect: FileSelect, fileType: string) {

    const fileName = fileSelect.fileName;
    const label = fileSelect.label;
    
    console.log('ReserveService.getReserveFromFile');
    console.log('url ' + this.getAllUrl);

    return this.http
      .get<ReservePage>(this.createReserveFromFileUrl, {
          params: {
            fileName,
            label,
            fileType

          },
        })
  }

  updateReserve(reserve: Reserve) {
    console.log('ReserveService.updateReserve:' + reserve.description);
    console.log('url: ' + this.getReserveUrl + reserve.reserveId);
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.put<Reserve>(
      this.getUpdateUrl + reserve.reserveId, reserve);
  }

  updateReserveTotals(reserveTotals: ReserveTotals) {
    console.log('ReserveService.updateReserveTotals:' +
    reserveTotals.quickenTotal + ' ' + reserveTotals.cmaTotal);

    const quickenTotal = '' + reserveTotals.quickenTotal;
    const cmaTotal = '' + reserveTotals.cmaTotal;

    return this.http.get(this.updateReserveTotalsUrl, {
        params: {
          quickenTotal,
          cmaTotal,
        },
      });
  }

  deleteReserve(reserveId: number) {
    console.log('ReserveService.deleteeReserve:' + reserveId);

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.delete(
      this.getDeleteReserveUrl + reserveId);
    }
  
    deleteReservesByOldestYear() {
    console.log('ReserveService.deleteReservesByOldestYear');

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.delete(
      this.getDeleteOldestReservesUrl);
    }
  

    

    fetchReserveCategoryHistroy(categoryId: number) {


      console.log('ReserveService.fetchReserveCategoryHistory');
      console.log('url ' + this.getReserveHistoryUrl);
      return this.http
        // tslint:disable-next-line: object-literal-shorthand
        .get<ReserveCategoryHistory[]>(this.getReserveHistoryUrl + categoryId);

    }

  setReserves(reservePage: ReservePage) {
    this.reservePage = reservePage;
    console.log('ReserveService.setReserves');
  }

  setReserveCategoryHistory(reserveCategoryHistorys: ReserveCategoryHistory[]) {
    this.reserveCategoryHistorys = reserveCategoryHistorys;
    console.log('ReserveService.setReservesCategoryHistory');

    // this.reservesCategoryHistoryChanged.next(this.reserveCategoryHistorys);
  }
}
