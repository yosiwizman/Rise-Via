export interface ProductReview {
  id: string;
  productId: string;
  userId?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  createdAt: Date;
  approved: boolean;
  userName?: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}
