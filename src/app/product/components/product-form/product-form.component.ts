import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../../category/services/category.service';
import { Category } from '../../../category/models/category';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <h2>{{ isEditMode ? 'Editar' : 'Adicionar' }} Produto</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">

      <div class="mb-3">
        <label for="nome" class="form-label">Nome</label>
        <input type="text" id="nome" formControlName="nome" class="form-control"
               [ngClass]="{ 'is-invalid': submitted && f['nome'].errors }">
        <div *ngIf="submitted && f['nome'].errors" class="invalid-feedback">
          <div *ngIf="f['nome'].errors['required']">Nome é obrigatório</div>
        </div>
      </div>

      <div class="mb-3">
        <label for="preco" class="form-label">Preço</label>
        <input type="number" id="preco" formControlName="preco" class="form-control"
               [ngClass]="{ 'is-invalid': submitted && f['preco'].errors }">
        <div *ngIf="submitted && f['preco'].errors" class="invalid-feedback">
          <div *ngIf="f['preco'].errors['required']">Preço é obrigatório</div>
          <div *ngIf="f['preco'].errors['min']">Preço deve ser positivo</div>
        </div>
      </div>

      <div class="mb-3">
        <label for="descricao" class="form-label">Descrição</label>
        <textarea id="descricao" formControlName="descricao" class="form-control"
                  [ngClass]="{ 'is-invalid': submitted && f['descricao'].errors }"></textarea>
        <div *ngIf="submitted && f['descricao'].errors" class="invalid-feedback">
          <div *ngIf="f['descricao'].errors['required']">Descrição é obrigatória</div>
        </div>
      </div>

      <div class="mb-3">
        <label for="categoriaId" class="form-label">Categoria</label>
        <select id="categoriaId" formControlName="categoriaId" class="form-select"
                [ngClass]="{ 'is-invalid': submitted && f['categoriaId'].errors }">
          <option [ngValue]="null" disabled>Selecione uma Categoria</option>
          <option *ngFor="let category of categories$ | async" [ngValue]="category.id">
            {{ category.nome }}
          </option>
        </select>
        <div *ngIf="submitted && f['categoriaId'].errors" class="invalid-feedback">
          <div *ngIf="f['categoriaId'].errors['required']">Categoria é obrigatória</div>
        </div>
      </div>

      <div class="mb-3">
  <label for="imageFile" class="form-label">Imagem do Produto</label>
  <input type="file" id="imageFile" class="form-control" 
         accept="image/*" (change)="onFileSelected($event)">
  <div *ngIf="form.get('imagemUrl')?.value" class="mt-2">
    <img [src]="form.get('imagemUrl')?.value" 
         alt="Preview" style="max-height: 100px;">
  </div>
</div>

      <button type="submit" class="btn btn-primary me-2">Salvar</button>
      <a routerLink="/products" class="btn btn-secondary">Cancelar</a>
    </form>
  `,
  styles: []
})
export class ProductFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  productId: number | null = null;
  submitted = false;
  categories$: Observable<Category[]> | undefined;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      preco: [null, [Validators.required, Validators.min(0.01)]],
      descricao: ['', Validators.required],
      categoriaId: [null, Validators.required],
      imagem_url: ['']
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadImage(): Observable<any> {
    const formData = new FormData();
    formData.append('image', this.selectedFile as File);

    return this.http.post<any>('http://localhost:3000/api/upload', formData);
  }

  ngOnInit(): void {
    this.loadCategories();
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.productId) {
      this.isEditMode = true;
      this.productService.getProduct(this.productId).subscribe(product => {
        if (product) {
          console.log(product);
          const patchedProduct = {
            ...product,
            categoriaId: product.categoria_id
          };
          this.form.patchValue(patchedProduct);
        }
      });
    }
  }

  loadCategories(): void {
    this.categories$ = this.categoryService.getCategories();
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const productData = this.form.value;

    if (this.selectedFile) {
      this.uploadImage().subscribe({
        next: res => {
          console.log(res);

          this.form.patchValue({
            imagem_url: res.imagePath
          })
          console.log(this.form.value);

          const productData = this.form.value;

          if (this.isEditMode && this.productId) {
            const productData = this.form.value;
            this.productService.updateProduct(productData, this.productId).subscribe({
              next: res => {
                console.log("Produto criado com sucesso");
                this.router.navigate(['/products'])
              }, error: (err) => console.error("Erro ao salvar produto: ", err)
            })
          } else {
            this.productService.addProduct(productData).subscribe({
              next: res => {
                console.log("Produto criado com sucesso");
                this.router.navigate(['/products'])
              }, error: (err) => console.error("Erro ao salvar produto: ", err)
            })
          }
        }, error: (err) => {
          console.error('Erro ao fazer upload da imagem:', err);
        }
      })
    } else {
      if (this.isEditMode && this.productId) {
        this.productService.updateProduct(productData, this.productId).subscribe({
          next: res => {
            console.log("Produto criado com sucesso");
            this.router.navigate(['/products'])
          }, error: (err) => console.error("Erro ao salvar produto: ", err)
        })
      } else {
        this.productService.addProduct(productData).subscribe({
          next: res => {
            console.log("Produto criado com sucesso");
            this.router.navigate(['/products'])
          }, error: (err) => console.error("Erro ao salvar produto: ", err)
        })
      }
    }
  }
}

