import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <h2>Categorias</h2>
    <a [routerLink]="['add']" class="btn btn-primary mb-3">Adicionar Categoria</a>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let category of categories$ | async">
          <td>{{ category.id }}</td>
          <td>{{ category.nome }}</td>
          <td>
            <a [routerLink]="['edit', category.id]" class="btn btn-sm btn-warning me-2">Editar</a>
            <button (click)="deleteCategory(category.id)" class="btn btn-sm btn-danger">Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
  styles: []
})
export class CategoryListComponent implements OnInit {
  categories$: Observable<Category[]> | undefined;

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categories$ = this.categoryService.getCategories();
  }

  deleteCategory(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      this.categoryService.deleteCategory(id).subscribe(success => {
        if (success) {
          this.loadCategories();
        } else {
          alert('Erro ao excluir categoria.');
        }
      });
    }
  }
}

