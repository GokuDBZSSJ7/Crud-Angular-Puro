import { Injectable } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { Product } from '../models/product';
import { CategoryService } from '../../category/services/category.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private products: Product[] = [
    { id: 1, nome: 'Batata Frita com Cheddar', preco: 35.00, descricao: 'Deliciosa batata frita coberta com cheddar.', categoriaId: 1 },
    { id: 2, nome: 'Calabresa Acebolada', preco: 45.00, descricao: 'Linguiça calabresa acebolada servida com pão, 500 g.', categoriaId: 1 },
    { id: 3, nome: 'Tilápia', preco: 55.00, descricao: 'Filé de tilápia empanado e frito, com molho especial.', categoriaId: 1 }, // Assumindo Porções como Categoria 1
    { id: 4, nome: 'Água 510ml', preco: 5.00, descricao: 'Água mineral natural, 510 ml.', categoriaId: 2 }, // Assumindo Bebidas como Categoria 2
    { id: 5, nome: 'Água com Gás', preco: 6.00, descricao: 'Água mineral com gás, refrescante', categoriaId: 2 },
    { id: 6, nome: 'Espeto de Carne', preco: 15.00, descricao: 'Delicioso espeto de carne bovina.', categoriaId: 3 }, // Assumindo Espetos como Categoria 3
    { id: 7, nome: 'Coxinha', preco: 8.00, descricao: 'Salgado frito recheado com frango.', categoriaId: 4 } // Assumindo Salgados como Categoria 4
  ];

  private nextId = 8;

  constructor(private categoryService: CategoryService) { }

  getProducts(): Observable<Product[]> {
    return of(this.products).pipe(
      map(products => products.map(product => {
        return product;
      }))
    );
  }

  getProduct(id: number): Observable<Product | undefined> {
    return of(this.products.find(p => p.id === id));
  }

  addProduct(product: Omit<Product, 'id' | 'categoria'>): Observable<Product> {
    const newProduct: Product = { ...product, id: this.nextId++ };
    this.products.push(newProduct);
    return of(newProduct);
  }

  updateProduct(product: Product): Observable<Product | undefined> {
    const index = this.products.findIndex(p => p.id === product.id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...product }; // Mescla para manter a categoria se não for passada
      return of(this.products[index]);
    }
    return of(undefined);
  }

  deleteProduct(id: number): Observable<boolean> {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  getProductsByCategory(categoriaId: number): Observable<Product[]> {
    return of(this.products.filter(p => p.categoriaId === categoriaId));
  }
}

