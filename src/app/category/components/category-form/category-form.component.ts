import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category';
import { Observable, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <h2>{{ isEditMode ? 'Editar' : 'Adicionar' }} Categoria</h2>
    <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
      <div class="mb-3">
        <label for="nome" class="form-label">Nome</label>
        <input type="text" id="nome" formControlName="nome" class="form-control"
               [ngClass]="{ 'is-invalid': submitted && f['nome'].errors }">
        <div *ngIf="submitted && f['nome'].errors" class="invalid-feedback">
          <div *ngIf="f['nome'].errors['required']">Nome é obrigatório</div>
        </div>
      </div>

      <button type="submit" class="btn btn-primary me-2">Salvar</button>
      <a routerLink="/categories" class="btn btn-secondary">Cancelar</a>
    </form>
  `,
  styles: []
})
export class CategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  isEditMode = false;
  categoryId: number | null = null;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService
  ) {
    this.categoryForm = this.fb.group({
      nome: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.categoryId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.categoryId) {
      this.isEditMode = true;
      this.categoryService.getCategory(this.categoryId).subscribe(category => {
        if (category) {
          this.categoryForm.patchValue(category);
        }
      });
    }
  }

  get f() { return this.categoryForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.categoryForm.invalid) {
      return;
    }

    const categoryData = this.categoryForm.value;

    let saveObservable: Observable<Category | undefined>;

    if (this.isEditMode && this.categoryId) {
      this.categoryService.updateCategory(categoryData, this.categoryId).subscribe({
        next: res => {
          console.log("Categoria atualizada com sucesso!");
          this.router.navigate(['/categories']);
        }, error: (err) => console.error('Erro ao salvar categoria:', err)
      })
    } else {
      this.categoryService.addCategory(categoryData).subscribe({
        next: res => {
          console.log("Categoria criada com sucesso!");
          this.router.navigate(['/categories'])
        }, error: (err) => console.error('Erro ao salvar categoria:', err)
      });
    }

  }
}

