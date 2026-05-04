export class Category {
    public categoryId: number;
  public name: string;
  public label: string;
  public type: string;
  public subType: string;
  public catOrder: string;
  public reserve: boolean;
  public budget: boolean;

  constructor(
    categoryId: number,
    name: string,
    label: string,
    type: string,
    subType: string,
    catOrder: string,
    reserve: boolean,
    budget: boolean) {
    this.categoryId = categoryId;
    this.name = name;
    this.label = label;
    this.type = type;
    this.subType = subType;
    this.catOrder = catOrder;
    this.reserve = reserve;
    this.budget = budget;
   }
}
