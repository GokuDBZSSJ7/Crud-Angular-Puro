import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private categories: Category[] = [
    { id: 1, nome: 'Porções' },
    { id: 2, nome: 'Bebidas' },
    { id: 3, nome: 'Espetos' },
    { id: 4, nome: 'Salgados' },
    { id: 5, nome: 'Drinks' },
    { id: 6, nome: 'Combos' },
    { id: 7, nome: 'Extras' },
    { id: 8, nome: 'Moda Praia' }
  ];

  private nextId = 9;

  constructor() { }

  getCategories(): Observable<Category[]> {
    return of(this.categories);
  }

  getCategory(id: number): Observable<Category | undefined> {
    return of(this.categories.find(c => c.id === id));
  }

  addCategory(category: Omit<Category, 'id'>): Observable<Category> {
    const newCategory: Category = { ...category, id: this.nextId++ };
    this.categories.push(newCategory);
    return of(newCategory);
  }

  updateCategory(category: Category): Observable<Category | undefined> {
    const index = this.categories.findIndex(c => c.id === category.id);
    if (index !== -1) {
      this.categories[index] = category;
      return of(category);
    }
    return of(undefined);
  }

  deleteCategory(id: number): Observable<boolean> {
    const index = this.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      this.categories.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
}

