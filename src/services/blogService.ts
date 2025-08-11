import { neon } from '@neondatabase/serverless';

const DATABASE_URL = import.meta.env.VITE_DATABASE_URL || import.meta.env.VITE_NEON_DATABASE_URL;
const isValidDatabaseUrl = DATABASE_URL && DATABASE_URL.startsWith('postgresql://');

if (!isValidDatabaseUrl) {
  console.warn('⚠️ No valid database URL provided in blogService.ts. Running in development mode with mock data.');
}

const sql = isValidDatabaseUrl ? neon(DATABASE_URL) : null;

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author_name: string;
  keywords: string[];
  tone: string;
  target_length: number;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  published_at?: string;
  scheduled_at?: string;
  view_count: number;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogPostData {
  title: string;
  content: string;
  excerpt?: string;
  author_name?: string;
  keywords?: string[];
  tone?: string;
  target_length?: number;
  status?: 'draft' | 'scheduled' | 'published' | 'archived';
  scheduled_at?: string;
  meta_description?: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function generateExcerpt(content: string, maxLength: number = 160): string {
  const plainText = content.replace(/[#*`_~]/g, '').replace(/\n+/g, ' ');
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

export const blogService = {
  async getAllPosts(status?: string): Promise<BlogPost[]> {
    try {
      if (!sql) {
        console.warn('Database not available, returning mock data');
        return [];
      }
      
      if (status) {
        const result = await sql`SELECT * FROM blog_posts WHERE status = ${status} ORDER BY created_at DESC`;
        return result as BlogPost[];
      } else {
        const result = await sql`SELECT * FROM blog_posts ORDER BY created_at DESC`;
        return result as BlogPost[];
      }
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
      return [];
    }
  },

  async getPublishedPosts(): Promise<BlogPost[]> {
    try {
      if (!sql) {
        console.warn('Database not available, returning mock data');
        return [
          {
            id: '1',
            title: 'Understanding THCA: The Non-Psychoactive Precursor to THC',
            slug: 'understanding-thca-non-psychoactive-precursor-thc',
            content: '# Understanding THCA: The Non-Psychoactive Precursor to THC\n\nTHCA (Tetrahydrocannabinolic acid) is a fascinating cannabinoid that serves as the precursor to THC...',
            excerpt: 'Learn about THCA, the non-psychoactive cannabinoid that converts to THC when heated.',
            author_name: 'Rise-Via Team',
            keywords: ['THCA', 'cannabinoids', 'cannabis education'],
            tone: 'educational',
            target_length: 800,
            status: 'published',
            published_at: new Date().toISOString(),
            scheduled_at: undefined,
            view_count: 42,
            meta_description: 'Comprehensive guide to THCA and its role in cannabis',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
      }
      
      const result = await sql`
        SELECT * FROM blog_posts 
        WHERE status = 'published' AND published_at <= NOW() 
        ORDER BY published_at DESC
      `;
      return result as BlogPost[];
    } catch (error) {
      console.error('Failed to fetch published blog posts:', error);
      return [
        {
          id: '1',
          title: 'Understanding THCA: The Non-Psychoactive Precursor to THC',
          slug: 'understanding-thca-non-psychoactive-precursor-thc',
          content: '# Understanding THCA: The Non-Psychoactive Precursor to THC\n\nTHCA (Tetrahydrocannabinolic acid) is a fascinating cannabinoid that serves as the precursor to THC...',
          excerpt: 'Learn about THCA, the non-psychoactive cannabinoid that converts to THC when heated.',
          author_name: 'Rise-Via Team',
          keywords: ['THCA', 'cannabinoids', 'cannabis education'],
          tone: 'educational',
          target_length: 800,
          status: 'published',
          published_at: new Date().toISOString(),
          scheduled_at: undefined,
          view_count: 42,
          meta_description: 'Comprehensive guide to THCA and its role in cannabis',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }
  },

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      if (!sql) {
        console.warn('Database not available, returning mock data');
        if (slug === 'understanding-thca-non-psychoactive-precursor-thc') {
          return {
            id: '1',
            title: 'Understanding THCA: The Non-Psychoactive Precursor to THC',
            slug: 'understanding-thca-non-psychoactive-precursor-thc',
            content: '# Understanding THCA: The Non-Psychoactive Precursor to THC\n\nTHCA (Tetrahydrocannabinolic acid) is a fascinating cannabinoid that serves as the precursor to THC. Unlike THC, THCA is non-psychoactive in its raw form, meaning it won\'t produce the "high" associated with cannabis consumption.\n\n## What is THCA?\n\nTHCA is found in fresh, undried cannabis plants. When cannabis is heated through smoking, vaping, or cooking (a process called decarboxylation), THCA converts to THC, which is psychoactive.\n\n## Benefits of THCA\n\nResearch suggests THCA may offer several potential benefits:\n- Anti-inflammatory properties\n- Neuroprotective effects\n- Anti-nausea properties\n- Potential appetite stimulation\n\n## How to Consume THCA\n\nTo preserve THCA content:\n- Consume raw cannabis (juicing)\n- Use low-temperature extraction methods\n- Store cannabis properly to prevent decarboxylation\n\n**Important Disclaimer:** This content is for educational purposes only and has not been evaluated by the FDA. Cannabis products may cause drowsiness and should not be used while operating machinery. Keep out of reach of children and pets. Must be 21+ to purchase. Please consume responsibly and in accordance with local laws.',
            excerpt: 'Learn about THCA, the non-psychoactive cannabinoid that converts to THC when heated.',
            author_name: 'Rise-Via Team',
            keywords: ['THCA', 'cannabinoids', 'cannabis education'],
            tone: 'educational',
            target_length: 800,
            status: 'published',
            published_at: new Date().toISOString(),
            scheduled_at: undefined,
            view_count: 43,
            meta_description: 'Comprehensive guide to THCA and its role in cannabis',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        return null;
      }
      
      const result = await sql`SELECT * FROM blog_posts WHERE slug = ${slug}`;
      
      if (result && result.length > 0) {
        const post = result[0] as BlogPost;
        
        await sql`UPDATE blog_posts SET view_count = view_count + 1 WHERE id = ${post.id}`;
        
        return { ...post, view_count: post.view_count + 1 };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to fetch blog post by slug:', error);
      if (slug === 'understanding-thca-non-psychoactive-precursor-thc') {
        return {
          id: 'mock-1',
          title: 'Understanding THCA: The Non-Psychoactive Precursor to THC',
          slug: 'understanding-thca-non-psychoactive-precursor-thc',
          content: `# Understanding THCA: The Non-Psychoactive Precursor to THC

## What is THCA?

THCA (Tetrahydrocannabinolic acid) is the non-psychoactive precursor to THC found in raw cannabis plants. Unlike THC, THCA does not produce intoxicating effects when consumed in its natural state.

## How THCA Converts to THC

When cannabis is heated through smoking, vaping, or cooking (a process called decarboxylation), THCA converts to THC, which then produces the psychoactive effects associated with cannabis.

### Key Benefits of THCA:

• **Non-psychoactive**: Won't cause intoxication in raw form
• **Potential therapeutic properties**: Research suggests anti-inflammatory benefits
• **Legal considerations**: THCA products may have different legal status than THC
• **Versatile consumption**: Can be consumed raw or heated for different effects

## Important Safety Information

**Always consult with healthcare professionals before using cannabis products for medical purposes.**

THCA products should be stored properly and kept away from heat sources to maintain their non-psychoactive properties.

## Cannabis Compliance Notice

This content is for educational purposes only and has not been evaluated by the FDA. Cannabis products are not intended to diagnose, treat, cure, or prevent any disease. You must be 21+ to purchase cannabis products. Keep out of reach of children and pets. Cannabis laws vary by state - please consult your local regulations before purchasing or consuming cannabis products.`,
          excerpt: 'Learn about THCA, the non-psychoactive cannabinoid that converts to THC when heated.',
          author_name: 'Rise-Via Team',
          keywords: ['THCA', 'cannabinoids', 'cannabis education'],
          tone: 'educational',
          target_length: 500,
          status: 'published' as const,
          published_at: '2025-08-11T00:00:00Z',
          scheduled_at: undefined,
          view_count: 42,
          meta_description: 'Understanding THCA and its conversion to THC - educational guide',
          created_at: '2025-08-11T00:00:00Z',
          updated_at: '2025-08-11T00:00:00Z'
        };
      }
      return null;
    }
  },

  async createPost(data: CreateBlogPostData): Promise<BlogPost | null> {
    try {
      if (!sql) {
        console.warn('Database not available, simulating blog post creation');
        const mockPost: BlogPost = {
          id: Math.random().toString(36).substr(2, 9),
          title: data.title,
          slug: generateSlug(data.title),
          content: data.content,
          excerpt: data.excerpt || generateExcerpt(data.content),
          author_name: data.author_name || 'Rise-Via Team',
          keywords: data.keywords || [],
          tone: data.tone || 'educational',
          target_length: data.target_length || 500,
          status: data.status || 'draft',
          published_at: data.status === 'published' ? new Date().toISOString() : undefined,
          scheduled_at: data.scheduled_at || undefined,
          view_count: 0,
          meta_description: data.meta_description || generateExcerpt(data.content),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return mockPost;
      }
      
      const slug = generateSlug(data.title);
      const excerpt = data.excerpt || generateExcerpt(data.content);
      const keywordsJson = JSON.stringify(data.keywords || []);
      
      const result = await sql`
        INSERT INTO blog_posts (
          title, slug, content, excerpt, author_name, keywords, tone, 
          target_length, status, scheduled_at, meta_description, published_at
        ) VALUES (
          ${data.title},
          ${slug},
          ${data.content},
          ${excerpt},
          ${data.author_name || 'Rise-Via Team'},
          ${keywordsJson},
          ${data.tone || 'educational'},
          ${data.target_length || 500},
          ${data.status || 'draft'},
          ${data.scheduled_at || null},
          ${data.meta_description || excerpt},
          ${data.status === 'published' ? new Date().toISOString() : null}
        )
        RETURNING *
      `;
      
      return result && result.length > 0 ? (result[0] as BlogPost) : null;
    } catch (error) {
      console.error('Failed to create blog post:', error);
      return null;
    }
  },

  async updatePost(id: string, data: Partial<CreateBlogPostData>): Promise<BlogPost | null> {
    try {
      if (!sql) {
        console.warn('Database not available, simulating blog post update');
        return null;
      }
      
      const updates: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (data.title !== undefined) {
        updates.push(`title = $${paramIndex++}`);
        values.push(data.title);
        updates.push(`slug = $${paramIndex++}`);
        values.push(generateSlug(data.title));
      }
      
      if (data.content !== undefined) {
        updates.push(`content = $${paramIndex++}`);
        values.push(data.content);
        if (!data.excerpt) {
          updates.push(`excerpt = $${paramIndex++}`);
          values.push(generateExcerpt(data.content));
        }
      }
      
      if (data.status !== undefined) {
        updates.push(`status = $${paramIndex++}`);
        values.push(data.status);
        if (data.status === 'published') {
          updates.push(`published_at = NOW()`);
        }
      }

      if (updates.length === 0) {
        return null;
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const query = `UPDATE blog_posts SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
      const result = await sql(query, values);
      
      return result && result.length > 0 ? (result[0] as BlogPost) : null;
    } catch (error) {
      console.error('Failed to update blog post:', error);
      return null;
    }
  },

  async deletePost(id: string): Promise<boolean> {
    try {
      if (!sql) {
        console.warn('Database not available, simulating blog post deletion');
        return true;
      }
      
      await sql`DELETE FROM blog_posts WHERE id = ${id}`;
      return true;
    } catch (error) {
      console.error('Failed to delete blog post:', error);
      return false;
    }
  },

  async getScheduledPosts(): Promise<BlogPost[]> {
    try {
      if (!sql) {
        console.warn('Database not available, returning empty scheduled posts');
        return [];
      }
      
      const result = await sql`
        SELECT * FROM blog_posts 
        WHERE status = 'scheduled' AND scheduled_at <= NOW() 
        ORDER BY scheduled_at ASC
      `;
      return result as BlogPost[];
    } catch (error) {
      console.error('Failed to fetch scheduled blog posts:', error);
      return [];
    }
  },

  async publishScheduledPosts(): Promise<number> {
    try {
      const scheduledPosts = await this.getScheduledPosts();
      let publishedCount = 0;

      for (const post of scheduledPosts) {
        const updated = await this.updatePost(post.id, {
          status: 'published'
        });
        
        if (updated) {
          publishedCount++;
          console.log(`📝 Published scheduled blog post: ${post.title}`);
        }
      }

      return publishedCount;
    } catch (error) {
      console.error('Failed to publish scheduled posts:', error);
      return 0;
    }
  },

  async searchPosts(searchTerm: string, status: string = 'published'): Promise<BlogPost[]> {
    try {
      if (!sql) {
        console.warn('Database not available, returning empty search results');
        return [];
      }
      
      const result = await sql`
        SELECT * FROM blog_posts 
        WHERE status = ${status} 
        AND (
          title ILIKE ${`%${searchTerm}%`}
          OR content ILIKE ${`%${searchTerm}%`}
          OR excerpt ILIKE ${`%${searchTerm}%`}
        )
        ORDER BY published_at DESC
      `;
      
      return result as BlogPost[];
    } catch (error) {
      console.error('Failed to search blog posts:', error);
      return [];
    }
  }
};
