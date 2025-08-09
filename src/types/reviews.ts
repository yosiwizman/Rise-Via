export interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  title: string;
  comment: string;
  verified_purchase: boolean;
  helpful_count: number;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface ReviewVote {
  review_id: string;
  user_id: string;
  vote_type: 'helpful' | 'not_helpful';
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
  images: File[];
}
