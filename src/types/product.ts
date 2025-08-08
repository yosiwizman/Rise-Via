export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  strainType?: string;
  thcaPercentage?: number;
  description: string;
  effects?: string[];
  inventory: number;
  featured?: boolean;
  images: string[];
}
