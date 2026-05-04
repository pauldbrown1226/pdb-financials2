import { Injectable } from '@angular/core';
import { Category } from '../models/category-model';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  categories: Array<Category>;

  host = environment.host;
  port = environment.apiPort;
  war = environment.war;

  baseUrl = this.host + ':' + this.port + this.war + '/';
  getAllUrl = this.baseUrl + 'categories/listcategories';
  getReserveCategoriesUrl = this.baseUrl + 'categories/reserveCategories';
  getUpdateUrl = this.baseUrl + 'categories/update';
  getCategoryUrl = this.baseUrl + 'categories/';
  getDeleteCategoryUrl = this.baseUrl + 'categories/';


  constructor(private httpClient: HttpClient) {}

  getCatgories() {
    return this.httpClient.get<Category[]>(this.getAllUrl);
  }


  addCategory(category: Category) {

    console.log('CategoryService.addCategory:' + category.name);
    console.log('url: ' + this.getCategoryUrl);
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.httpClient.post<Category>(
      this.getCategoryUrl,
      category
    );

  }

  updateCategory(category: Category) {
    console.log('CategoryService.updateCategory:' + category.name);
    console.log('url: ' + this.getCategoryUrl + category.categoryId);
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.httpClient.put<Category>(
      this.getUpdateUrl, category);
  }

  deleteCategory(categoryId: number) {
    console.log('CategoryService.deleteeCategory:' + categoryId);

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return this.httpClient.delete(
      this.getDeleteCategoryUrl + '/' + categoryId);
    }
  }