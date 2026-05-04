import { PlannerDetails } from './../models/planner-details.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Planner } from './../models/planner.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlannerService {

  plannersObservable: any = [];
  plannerObservable: any;
  private planners: Planner[];

  private planner: Planner;

  plannersChanged = new Subject<Planner[]>();
  plannerChanged = new Subject<Planner>();
  errorSub = new Subject<any>();


  host = environment.host;
  port = environment.apiPort;
  war = environment.war;

  baseUrl = this.host + ':' + this.port +  this.war + '/';
  getAddPlannerUrl = this.baseUrl + 'planner';
  getAllUrl = this.baseUrl + 'planner/listplanners';
  getEstimateUrl = this.baseUrl + 'planner/estimate/';
  getReestimateUrl = this.baseUrl + 'planner/reestimate';
  getUpdateUrl = this.baseUrl + 'planner/update/';
  getPlannerUrl = this.baseUrl + 'planner/';
  getDeletePlannerUrl = this.baseUrl + 'planner/';
  getPlannerDetailsUrl = this.baseUrl + 'planner/getPlannerDetails';
  getUpdatePlannerDetailsUrl = this.baseUrl + 'planner/updatePlannerDetails';

  constructor(private http: HttpClient) {}

  fetchPlanners() {


    console.log('PlannerService.fetchPlanners');
    console.log('url ' + this.getAllUrl);
    return this.http
      // tslint:disable-next-line: object-literal-shorthand
      .get<Planner[]>(this.getAllUrl);

  }
  // This will reestimate from this year forward.
  estimate(year: number) {


    console.log('PlannerService.estimate');
    console.log('url ' + this.getEstimateUrl);
    return this.http.get<Planner[]>(this.getEstimateUrl + year);
  }
  
  
  // rerun all the years, both actuals and estimates
  reestimate() {


    console.log('PlannerService.reestimate');
    console.log('url ' + this.getReestimateUrl);
    return this.http
      .get<Planner[]>(this.getReestimateUrl);
    
  }


  fetchPlannerDetails() {

    console.log('PlannerService.fetchPlannerDetails: plannerId: ');

    return this.http.get<PlannerDetails>(this.getPlannerDetailsUrl);
  }


  updatePlanner(planner: Planner) {


    console.log('PlannerService.updatePlanner:' + planner.year);
    console.log('url: ' + this.getUpdateUrl + planner.plannerId);
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.put<Planner[]>(
      this.getUpdateUrl + planner.plannerId, planner);
  }

  updatePlannerDetails(plannerDtails: PlannerDetails) {
    console.log('PlannerService.updatePlannerDetails:');
    console.log('url: ' + this.getUpdatePlannerDetailsUrl);
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.put<PlannerDetails>(
      this.getUpdatePlannerDetailsUrl, plannerDtails);
  }



  deletePlanner(plannerId: number) {
    console.log('PlannerService.deleteePlanner:' + plannerId);

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.http.delete(
      this.getDeletePlannerUrl + '/' + plannerId);
    }

}
