import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Category } from '../models/category';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  url: string = 'http://localhost:3000/api'



  constructor(private http: HttpClient) { }

  getCategories(): Observable<any> {
    return this.http.get(`${this.url}/categories`);
  }

  getCategory(id: number): Observable<any> {
    return this.http.get(`${this.url}/categories/${id}`);
  }

  addCategory(data: any): Observable<any> {
    return this.http.post(`${this.url}/categories`, data)
  }

  updateCategory(data: any, id: number): Observable<any> {
    return this.http.put(`${this.url}/categories/${id}`, data);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.url}/categories/${id}`);
  }
}

