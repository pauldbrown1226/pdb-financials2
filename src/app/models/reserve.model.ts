import { ReserveEntry } from './reserve-entry.model';
export class Reserve {

  public reserveId: number;
  public description: string;
  public reserveDate: string;
  public reserveEntries: ReserveEntry[];
  public reserveTotal: number;
  public reserveSubtotal: number;

  constructor(reserveId: number,
              description: string,
              reserveDate: string,
              reserveEntries: ReserveEntry[],
              reserveTotal: number,
              reserveSubtotal) {

      this.reserveId = reserveId;
      this.description = description;
      this.reserveDate = reserveDate;
      this.reserveEntries = reserveEntries;
      this.reserveTotal = reserveTotal;
      this.reserveSubtotal = reserveSubtotal;

  }
}
