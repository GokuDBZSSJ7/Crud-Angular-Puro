import { Category } from '../../category/models/category';

export interface Product {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
  categoriaId: number;
  categoria?: Category;
}

