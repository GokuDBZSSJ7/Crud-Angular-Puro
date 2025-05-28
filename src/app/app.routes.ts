import { Routes } from '@angular/router';
import { PanelLayoutComponent } from './layout/panel-layout/panel-layout.component';
import { PrintIndexComponent } from './print-index/print-index.component';

export const routes: Routes = [
  {
    path: '',
    component: PanelLayoutComponent, 
    children: [
      { path: '', redirectTo: 'categories', pathMatch: 'full' }, 
      {
        path: 'categories',
        loadChildren: () => import('./category/category.module').then(m => m.CategoryModule)
      },
      {
        path: 'categories/add',
        loadChildren: () => import('./category/components/category-form/category-form.component').then((c) => c.CategoryFormComponent)
      },
      {
        path: 'categories/edit/:id',
        loadChildren: () => import('./category/components/category-form/category-form.component').then((c) => c.CategoryFormComponent)
      },
      {
        path: 'products',
        loadChildren: () => import('./product/product.module').then(m => m.ProductModule)
      },
      {
        path: 'products/add',
        loadChildren: () => import('./product/components/product-form/product-form.component').then((c) => c.ProductFormComponent)
      },
      {
        path: 'products/edit/:id',
        loadChildren: () => import('./product/components/product-form/product-form.component').then((c) => c.ProductFormComponent)
      }
    ]
  },
  {
    path: 'print',
    component: PrintIndexComponent
  },
  { path: '**', redirectTo: '' }
];

