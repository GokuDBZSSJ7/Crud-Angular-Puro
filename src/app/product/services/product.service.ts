import { Injectable } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { Product } from '../models/product';
import { CategoryService } from '../../category/services/category.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  url: string = 'http://localhost:3000/api'

  private nextId = 8;

  constructor(private categoryService: CategoryService, private http: HttpClient) { }

  getProducts(): Observable<any> {
    return this.http.get(`${this.url}/products`);
  }

  getProduct(id: number): Observable<any> {
    return this.http.get(`${this.url}/products/${id}`)
  }

  addProduct(data: any): Observable<any> {
    return this.http.post(`${this.url}/products`, data);
  }

  updateProduct(data: any, id: number): Observable<any> {
    return this.http.put(`${this.url}/products/${id}`, data)
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.url}/products/${id}`)
  }

  getProductsByCategory(categoriaId: number): Observable<any> {
    return this.http.get(`${this.url}/productsCategory/${categoriaId}`);
  }
}

