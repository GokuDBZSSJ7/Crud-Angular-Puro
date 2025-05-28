import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ProductService } from '../product/services/product.service';
import { CategoryService } from '../category/services/category.service';
import { Product } from '../product/models/product';
import { Category } from '../category/models/category';
import { Observable, forkJoin, map } from 'rxjs';

interface CategoryWithProducts extends Category {
  products: Product[];
}

@Component({
  selector: 'app-print-index',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="print-container">
      <header class="text-center mb-4">
        <h1>Cardápio</h1>
        <p>Deliciosas opções para toda família</p>
      </header>

      <section *ngFor="let categoryGroup of categoriesWithProducts$ | async" class="mb-5 category-section">
        <h2 class="category-title">{{ categoryGroup.nome }}</h2>
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 product-grid">
          <div *ngFor="let product of categoryGroup.products" class="col">
            <div class="card h-100 product-card">
              <!-- Adicionar imagem do produto se disponível -->
              <div class="card-body">
                <h5 class="card-title">{{ product.nome }}</h5>
                <p class="card-text">{{ product.descricao }}</p>
              </div>
              <div class="card-footer">
                <span class="price">{{ product.preco | currency:'BRL' }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer class="text-center mt-5">
        <p>© {{ currentYear }} Seu Estabelecimento. Todos os direitos reservados.</p>
        <!-- Adicionar informações de contato ou endereço se necessário -->
      </footer>
    </div>
  `,
  styles: [`
    /* Estilos otimizados para impressão e visualização */
    .print-container {
      font-family: sans-serif;
      max-width: 1000px; /* Ajustar conforme necessário */
      margin: 20px auto;
      padding: 15px;
      background-color: #fff;
    }
    header h1 {
      font-size: 2.5em;
      color: #333;
      margin-bottom: 0.2em;
    }
    header p {
      font-size: 1.1em;
      color: #666;
    }
    .category-section {
      page-break-inside: avoid; /* Evita quebrar a seção da categoria entre páginas */
    }
    .category-title {
      background-color: #f8f9fa; /* Cor de fundo suave para o título da categoria */
      padding: 10px 15px;
      border-radius: 5px;
      margin-bottom: 20px;
      font-size: 1.8em;
      color: #444;
      border-left: 5px solid #0d6efd; /* Detalhe visual */
    }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      align-items: stretch; /* Adicionado: Garante que os cards na mesma linha tenham a mesma altura */
    }

    .product-card {
      border: 1px solid #eee;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      background-color: #fff;
      page-break-inside: avoid;
      width: 300px;
      display: flex; /* Mantido: Para layout interno do card */
      flex-direction: column; /* Mantido: Conteúdo empilhado verticalmente */
      height: 100%; /* Mantido: Para cards de altura igual */
    }

    .product-card .card-body {
      padding: 15px;
      flex-grow: 1; /* Mantido: Faz o corpo do card crescer */
      overflow-wrap: break-word; /* Adicionado: Ajuda a quebrar palavras longas */
      word-wrap: break-word; /* Adicionado: Suporte legado */
      word-break: break-word; /* Adicionado: Garante quebra de palavras */
    }

    .product-card .card-title {
      font-size: 1.2em;
      font-weight: bold;
      margin-bottom: 10px;
      color: #333;
    }

    .product-card .card-text {
      font-size: 0.95em;
      color: #555;
      margin-bottom: 15px;
    }

    .product-card .card-footer {
      background-color: #f8f9fa;
      padding: 10px 15px;
      border-top: 1px solid #eee;
      text-align: right;
      margin-top: auto; /* Adicionado: Empurra o rodapé para baixo no layout flex */
    }

    .product-card .price {
      font-size: 1.3em;
      font-weight: bold;
      color: #28a745;
    }

    footer {
      border-top: 1px solid #ccc;
      padding-top: 20px;
      margin-top: 40px;
      color: #777;
      font-size: 0.9em;
    }

    /* Estilos específicos para impressão */
    @media print {
      body {
        -webkit-print-color-adjust: exact; /* Força a impressão de cores de fundo no Chrome/Safari */
        print-color-adjust: exact;
        margin: 0;
        padding: 0;
        background-color: #fff !important; /* Garante fundo branco */
      }
      .print-container {
        margin: 0;
        padding: 10mm; /* Margens de impressão */
        max-width: none;
        box-shadow: none;
        border: none;
      }
      .navbar, .btn, a[routerLink]:not(.print-link) { /* Esconde elementos não necessários na impressão */
        display: none !important;
      }
      .category-title {
        background-color: #f8f9fa !important; /* Garante cor de fundo */
        border-left-color: #0d6efd !important; /* Garante cor da borda */
      }
      .product-card {
         box-shadow: none;
         border: 1px solid #ccc;
      }
       .product-card .card-footer {
         background-color: #f8f9fa !important;
       }
       .product-card .price {
         color: #28a745 !important;
       }
      footer {
        page-break-before: auto; /* Tenta evitar que o rodapé fique sozinho */
      }
    }
  `]
})
export class PrintIndexComponent implements OnInit {
  categoriesWithProducts$: Observable<CategoryWithProducts[]> | undefined;
  currentYear = new Date().getFullYear();

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    this.loadDataForPrint();
  }

  loadDataForPrint(): void {
    this.categoriesWithProducts$ = forkJoin({
      products: this.productService.getProducts(),
      categories: this.categoryService.getCategories()
    }).pipe(
      map(({ products, categories }) => {
        const productMap = new Map<number, Product[]>();
        products.forEach(product => {
          const existing = productMap.get(product.categoriaId) || [];
          existing.push(product);
          productMap.set(product.categoriaId, existing);
        });

        return categories
          .map(category => ({
            ...category,
            products: productMap.get(category.id) || []
          }))
          .filter(category => category.products.length > 0);
      })
    );
  }
}

