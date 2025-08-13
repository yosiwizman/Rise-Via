/**
 * Review Service Implementation
 * Handles product reviews and ratings with database persistence
 */

import { sql } from '../lib/neon';
import { ReviewStats, ReviewFormData } from '../types/reviews';

interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  customer_name?: string;
  rating: number;
  title: string;
  comment: string;
  verified_purchase: boolean;
  helpful_count: number;
  images: string[];
  created_at: string;
  updated_at: string;
}

interface ReviewVote {
  id: string;
  review_id: string;
  user_id: string;
  vote_type: string;
  created_at: string;
}

interface ReviewWithCustomer extends Review {
  customer_name: string;
  verified_purchase: boolean;
}

interface RatingCount {
  rating: number;
  count: string;
}

interface ReviewStatsResult {
  average_rating: string;
  total_reviews: string;
}

interface CustomerReviewResult extends Review {
  product_name: string;
}

/**
 * Initialize review tables
 */
async function initializeReviewTables(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping review table initialization');
      return;
    }

    // Reviews table
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id VARCHAR(255) NOT NULL,
        customer_id VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255),
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255) NOT NULL,
        comment TEXT NOT NULL,
        verified_purchase BOOLEAN DEFAULT false,
        helpful_count INTEGER DEFAULT 0,
        images TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Review votes table (for helpful/not helpful)
    await sql`
      CREATE TABLE IF NOT EXISTS review_votes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        vote_type VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(review_id, user_id)
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_votes(review_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON review_votes(user_id)`;

    console.log('✅ Review tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize review tables:', error);
  }
}

// Initialize tables on module load
initializeReviewTables();

export const reviewService = {
  /**
   * Get product reviews with sorting
   */
  async getProductReviews(productId: string, sortBy: 'recent' | 'helpful' | 'rating' = 'recent') {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty reviews');
        return { data: [], error: null };
      }

      let orderClause = 'created_at DESC';
      if (sortBy === 'helpful') {
        orderClause = 'helpful_count DESC, created_at DESC';
      } else if (sortBy === 'rating') {
        orderClause = 'rating DESC, created_at DESC';
      }

      const reviews = await sql`
        SELECT 
          r.*,
          COALESCE(c.first_name || ' ' || c.last_name, r.customer_name, 'Anonymous') as customer_name,
          EXISTS(
            SELECT 1 FROM orders o 
            JOIN order_items oi ON o.id = oi.order_id 
            WHERE o.customer_id = r.customer_id 
            AND oi.product_id = r.product_id 
            AND o.status = 'delivered'
          ) as verified_purchase
        FROM reviews r
        LEFT JOIN customers c ON r.customer_id = c.id::text
        WHERE r.product_id = ${productId}
        ORDER BY ${sql(orderClause)}
      ` as Array<ReviewWithCustomer>;
      
      return { data: reviews || [], error: null };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return { data: [], error };
    }
  },

  /**
   * Create a new review
   */
  async createReview(reviewData: ReviewFormData & { productId: string; customerId: string }) {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, cannot create review');
        return { data: null, error: 'Database not available' };
      }

      // Check if customer has already reviewed this product
      const existingReviews = await sql`
        SELECT id FROM reviews 
        WHERE product_id = ${reviewData.productId} 
        AND customer_id = ${reviewData.customerId}
      ` as Array<{ id: string }>;

      if (existingReviews.length > 0) {
        return { data: null, error: 'You have already reviewed this product' };
      }

      // Check if customer has purchased this product
      const purchases = await sql`
        SELECT COUNT(*) as count
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.customer_id = ${reviewData.customerId}
        AND oi.product_id = ${reviewData.productId}
        AND o.status IN ('delivered', 'shipped')
      ` as Array<{ count: string }>;

      const verifiedPurchase = parseInt(purchases[0]?.count || '0') > 0;

      // Get customer name
      const customers = await sql`
        SELECT first_name, last_name FROM customers WHERE id::text = ${reviewData.customerId}
      ` as Array<{ first_name: string; last_name: string }>;
      
      const customerName = customers.length > 0 
        ? `${customers[0].first_name} ${customers[0].last_name}`.trim()
        : 'Anonymous';

      // Create the review
      const reviews = await sql`
        INSERT INTO reviews (
          product_id, customer_id, customer_name, rating, title, comment, 
          verified_purchase, images
        ) VALUES (
          ${reviewData.productId}, ${reviewData.customerId}, ${customerName},
          ${reviewData.rating}, ${reviewData.title}, ${reviewData.comment},
          ${verifiedPurchase}, ${reviewData.images || []}
        ) RETURNING *
      ` as Array<Review>;

      const review = reviews[0];
      
      return { data: review, error: null };
    } catch (error) {
      console.error('Error creating review:', error);
      return { data: null, error };
    }
  },

  /**
   * Get review statistics for a product
   */
  async getReviewStats(productId: string): Promise<{ data: ReviewStats | null; error: unknown }> {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning default stats');
        return {
          data: {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          },
          error: null
        };
      }

      // Get overall stats
      const stats = await sql`
        SELECT 
          COALESCE(AVG(rating), 0) as average_rating,
          COUNT(*) as total_reviews
        FROM reviews
        WHERE product_id = ${productId}
      ` as Array<ReviewStatsResult>;

      // Get rating distribution
      const distribution = await sql`
        SELECT 
          rating,
          COUNT(*) as count
        FROM reviews
        WHERE product_id = ${productId}
        GROUP BY rating
        ORDER BY rating
      ` as Array<RatingCount>;

      // Build rating distribution object with proper typing
      const ratingDistribution: { 1: number; 2: number; 3: number; 4: number; 5: number } = { 
        1: 0, 
        2: 0, 
        3: 0, 
        4: 0, 
        5: 0 
      };
      
      distribution.forEach(item => {
        const rating = item.rating as 1 | 2 | 3 | 4 | 5;
        ratingDistribution[rating] = parseInt(item.count.toString());
      });

      return {
        data: {
          averageRating: parseFloat(stats[0]?.average_rating || '0'),
          totalReviews: parseInt(stats[0]?.total_reviews || '0'),
          ratingDistribution
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching review stats:', error);
      return { data: null, error };
    }
  },

  /**
   * Vote on review helpfulness
   */
  async voteHelpful(reviewId: string, userId: string, voteType: 'helpful' | 'not_helpful') {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, cannot vote on review');
        return { error: 'Database not available' };
      }

      // Check if user has already voted on this review
      const existingVotes = await sql`
        SELECT id, vote_type FROM review_votes 
        WHERE review_id = ${reviewId} AND user_id = ${userId}
      ` as Array<ReviewVote>;

      if (existingVotes.length > 0) {
        // Update existing vote
        await sql`
          UPDATE review_votes 
          SET vote_type = ${voteType}, created_at = NOW()
          WHERE review_id = ${reviewId} AND user_id = ${userId}
        `;
      } else {
        // Create new vote
        await sql`
          INSERT INTO review_votes (review_id, user_id, vote_type)
          VALUES (${reviewId}, ${userId}, ${voteType})
        `;

        // Update helpful count on review if vote is helpful
        if (voteType === 'helpful') {
          await sql`
            UPDATE reviews 
            SET helpful_count = helpful_count + 1
            WHERE id = ${reviewId}
          `;
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Error voting on review:', error);
      return { error };
    }
  },

  /**
   * Update a review
   */
  async updateReview(reviewId: string, customerId: string, updates: Partial<ReviewFormData>) {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, cannot update review');
        return { data: null, error: 'Database not available' };
      }

      // Verify ownership
      const reviews = await sql`
        SELECT * FROM reviews 
        WHERE id = ${reviewId} AND customer_id = ${customerId}
      ` as Array<Review>;

      if (reviews.length === 0) {
        return { data: null, error: 'Review not found or unauthorized' };
      }

      // Build update query using individual SET clauses
      let updatedReviews: Array<Review> = [];
      
      if (updates.rating !== undefined && updates.title !== undefined && updates.comment !== undefined && updates.images !== undefined) {
        updatedReviews = await sql`
          UPDATE reviews 
          SET 
            rating = ${updates.rating},
            title = ${updates.title},
            comment = ${updates.comment},
            images = ${updates.images},
            updated_at = NOW()
          WHERE id = ${reviewId}
          RETURNING *
        ` as Array<Review>;
      } else if (updates.rating !== undefined && updates.title !== undefined && updates.comment !== undefined) {
        updatedReviews = await sql`
          UPDATE reviews 
          SET 
            rating = ${updates.rating},
            title = ${updates.title},
            comment = ${updates.comment},
            updated_at = NOW()
          WHERE id = ${reviewId}
          RETURNING *
        ` as Array<Review>;
      } else if (updates.rating !== undefined && updates.title !== undefined) {
        updatedReviews = await sql`
          UPDATE reviews 
          SET 
            rating = ${updates.rating},
            title = ${updates.title},
            updated_at = NOW()
          WHERE id = ${reviewId}
          RETURNING *
        ` as Array<Review>;
      } else if (updates.rating !== undefined && updates.comment !== undefined) {
        updatedReviews = await sql`
          UPDATE reviews 
          SET 
            rating = ${updates.rating},
            comment = ${updates.comment},
            updated_at = NOW()
          WHERE id = ${reviewId}
          RETURNING *
        ` as Array<Review>;
      } else if (updates.title !== undefined && updates.comment !== undefined) {
        updatedReviews = await sql`
          UPDATE reviews 
          SET 
            title = ${updates.title},
            comment = ${updates.comment},
            updated_at = NOW()
          WHERE id = ${reviewId}
          RETURNING *
        ` as Array<Review>;
      } else if (updates.rating !== undefined) {
        updatedReviews = await sql`
          UPDATE reviews 
          SET 
            rating = ${updates.rating},
            updated_at = NOW()
          WHERE id = ${reviewId}
          RETURNING *
        ` as Array<Review>;
      } else if (updates.title !== undefined) {
        updatedReviews = await sql`
          UPDATE reviews 
          SET 
            title = ${updates.title},
            updated_at = NOW()
          WHERE id = ${reviewId}
          RETURNING *
        ` as Array<Review>;
      } else if (updates.comment !== undefined) {
        updatedReviews = await sql`
          UPDATE reviews 
          SET 
            comment = ${updates.comment},
            updated_at = NOW()
          WHERE id = ${reviewId}
          RETURNING *
        ` as Array<Review>;
      } else if (updates.images !== undefined) {
        updatedReviews = await sql`
          UPDATE reviews 
          SET 
            images = ${updates.images},
            updated_at = NOW()
          WHERE id = ${reviewId}
          RETURNING *
        ` as Array<Review>;
      } else {
        // No updates needed
        return { data: reviews[0], error: null };
      }

      return { data: updatedReviews[0], error: null };
    } catch (error) {
      console.error('Error updating review:', error);
      return { data: null, error };
    }
  },

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string, customerId: string) {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, cannot delete review');
        return { success: false, error: 'Database not available' };
      }

      // Verify ownership
      const result = await sql`
        DELETE FROM reviews 
        WHERE id = ${reviewId} AND customer_id = ${customerId}
        RETURNING id
      ` as Array<{ id: string }>;

      if (result.length === 0) {
        return { success: false, error: 'Review not found or unauthorized' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting review:', error);
      return { success: false, error };
    }
  },

  /**
   * Get customer's reviews
   */
  async getCustomerReviews(customerId: string, limit: number = 10) {
    try {
      if (!sql) {
        console.warn('⚠️ Database not available, returning empty reviews');
        return { data: [], error: null };
      }

      const reviews = await sql`
        SELECT r.*, p.name as product_name
        FROM reviews r
        LEFT JOIN products p ON r.product_id = p.id
        WHERE r.customer_id = ${customerId}
        ORDER BY r.created_at DESC
        LIMIT ${limit}
      ` as Array<CustomerReviewResult>;

      return { data: reviews || [], error: null };
    } catch (error) {
      console.error('Error fetching customer reviews:', error);
      return { data: [], error };
    }
  }
};
