import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../../category/services/category.service'; 
import { Category } from '../../../category/models/category';
import { Observable, map, switchMap, forkJoin } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <h2>Produtos</h2>
    <a [routerLink]="['add']" class="btn btn-primary mb-3">Adicionar Produto</a>
    <!-- Adicionar filtro por categoria se necessário -->
    <table class="table table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Preço</th>
          <th>Descrição</th>
          <th>Categoria</th>
          <th>Imagem</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <!-- Usaremos uma versão enriquecida dos produtos com nome da categoria -->
        <tr *ngFor="let product of productsWithCategory$ | async">
          <td>{{ product.id }}</td>
          <td>{{ product.nome }}</td>
          <td>{{ product.preco | currency:'BRL' }}</td>
          <td>{{ product.descricao }}</td>
          <td>{{ product.categoria?.nome || 'N/A' }}</td> <!-- Exibe nome da categoria -->
          <td><img *ngIf="product.imagemUrl" [src]="'http://localhost:3000' + product.imagemUrl" 
       alt="{{ product.nome }}" style="max-width: 80px"></td>
          <td>
            <a [routerLink]="['edit', product.id]" class="btn btn-sm btn-warning me-2">Editar</a>
            <button (click)="deleteProduct(product.id)" class="btn btn-sm btn-danger">Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
  styles: []
})
export class ProductListComponent implements OnInit {
  productsWithCategory$: Observable<Product[]> | undefined;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.loadProductsWithCategory();
  }

  loadProductsWithCategory(): void {
    this.productsWithCategory$ = this.productService.getProducts()
  }

  deleteProduct(id: number): void {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      this.productService.deleteProduct(id).subscribe(success => {
        if (success) {
          this.loadProductsWithCategory();
        } else {
          alert('Erro ao excluir produto.');
        }
      });
    }
  }
}

