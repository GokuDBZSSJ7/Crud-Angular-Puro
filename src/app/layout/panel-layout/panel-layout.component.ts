import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router'; 

@Component({
  selector: 'app-panel-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div class="container-fluid">
        <a class="navbar-brand" routerLink="/">Painel CRUD</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" routerLink="/categories" routerLinkActive="active">Categorias</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/products" routerLinkActive="active">Produtos</a>
            </li>
          </ul>
          <ul class="navbar-nav">
             <li class="nav-item">
              <a class="nav-link" routerLink="/print">Visualizar Cardápio (Impressão)</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <div class="container">
      <router-outlet></router-outlet> <!-- This is where routed components will be displayed -->
    </div>
  `,
  styles: [`
    /* Adicionar estilos personalizados se necessário */
    .navbar-brand {
        font-weight: bold;
    }
    .nav-link.active {
        font-weight: bold;
        color: #fff !important; /* Cor branca para link ativo */
    }
  `]
})
export class PanelLayoutComponent { }

