import { Reserve } from './reserve.model';
export class ReservePage {

  public totalElements: number;
  public totalPages: number;
  public quickenTotal: number;
  public cmaTotal: number;
  public reserves: Reserve[];
  constructor(totalElements: number, totalPages: number, quickenTotal, cmaTotal, reserves: Reserve[]) {

    this.totalElements = totalElements;
    this.totalPages = totalPages;
    this.quickenTotal = quickenTotal;
    this.cmaTotal = cmaTotal;
    this.reserves = reserves;
  }
}
