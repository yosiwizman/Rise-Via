import { blogService } from './blogService';
import { aiService } from './AIService';

export class BlogScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(async () => {
      await this.publishScheduledPosts();
    }, 5 * 60 * 1000);
    
    console.log('📝 Blog scheduler started - checking every 5 minutes');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('📝 Blog scheduler stopped');
  }

  async publishScheduledPosts() {
    try {
      const publishedCount = await blogService.publishScheduledPosts();
      if (publishedCount > 0) {
        console.log(`📝 Published ${publishedCount} scheduled blog posts`);
      }
    } catch (error) {
      console.error('❌ Failed to publish scheduled posts:', error);
    }
  }

  async scheduleRandomPost(topics: string[], delayHours: number = 24) {
    try {
      if (topics.length === 0) {
        console.warn('No topics provided for random post generation');
        return null;
      }

      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      const scheduledTime = new Date();
      scheduledTime.setHours(scheduledTime.getHours() + delayHours);

      console.log(`📝 Generating random blog post about: ${randomTopic}`);

      let content = '';
      try {
        content = await aiService.generateBlogPost({
          topic: randomTopic,
          keywords: [randomTopic, 'cannabis', 'education'],
          targetLength: 500,
          tone: 'educational'
        });
      } catch (error) {
        console.warn('AI service unavailable, using fallback content');
        content = this.generateFallbackContent(randomTopic);
      }

      const blogPost = await blogService.createPost({
        title: randomTopic,
        content: content,
        keywords: [randomTopic, 'cannabis', 'education'],
        tone: 'educational',
        target_length: 500,
        status: 'scheduled',
        scheduled_at: scheduledTime.toISOString()
      });

      if (blogPost) {
        console.log(`📝 Random blog post scheduled for ${scheduledTime.toLocaleString()}: ${randomTopic}`);
        return blogPost;
      } else {
        console.error('Failed to create scheduled blog post');
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to schedule random post:', error);
      return null;
    }
  }

  private generateFallbackContent(topic: string): string {
    return `# ${topic}

## Introduction

Welcome to our comprehensive guide on ${topic}. In this educational article, we'll explore the key aspects of cannabis and provide valuable insights for our community.

## Key Points

Understanding ${topic} is essential for anyone interested in cannabis education and responsible consumption. Here are the main topics we'll cover:

• **Safety and Compliance**: Always prioritize safety and legal compliance
• **Quality Standards**: Learn about lab testing and quality assurance
• **Best Practices**: Discover recommended usage guidelines
• **Community Insights**: Connect with fellow enthusiasts

## Educational Content

${topic} represents an important aspect of cannabis education. Our team is committed to providing accurate, up-to-date information to help you make informed decisions.

**Key Benefits:**
• Enhanced understanding of cannabis products
• Improved safety awareness
• Better consumption practices
• Compliance with local regulations

## Conclusion

${topic} is a valuable topic for cannabis education. We encourage all readers to stay informed, consume responsibly, and follow local regulations.

---

**Important:** This content is for educational purposes only. Cannabis products have not been evaluated by the FDA. Keep out of reach of children and pets. Must be 21+ to purchase.

*Note: This content was automatically generated as part of our educational blog series.*`;
  }

  async scheduleWeeklyPosts(topics: string[]) {
    const postsToSchedule = Math.min(topics.length, 7);
    const scheduledPosts = [];

    for (let i = 0; i < postsToSchedule; i++) {
      const delayHours = (i + 1) * 24;
      const post = await this.scheduleRandomPost([topics[i]], delayHours);
      if (post) {
        scheduledPosts.push(post);
      }
    }

    console.log(`📝 Scheduled ${scheduledPosts.length} posts for the week`);
    return scheduledPosts;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      nextCheck: this.intervalId ? 'Every 5 minutes' : 'Not scheduled'
    };
  }
}

export const blogScheduler = new BlogScheduler();

export const defaultCannabisTopics = [
  'Understanding THCA vs THC',
  'Cannabis Terpenes and Their Effects',
  'Safe Cannabis Consumption Guidelines',
  'Cannabis Lab Testing Explained',
  'The Entourage Effect in Cannabis',
  'Cannabis Storage Best Practices',
  'Understanding Cannabis Potency',
  'Cannabis and Wellness',
  'Legal Cannabis Compliance',
  'Cannabis Quality Standards',
  'Responsible Cannabis Use',
  'Cannabis Education Basics',
  'Cannabis Product Types',
  'Cannabis Dosage Guidelines',
  'Cannabis Safety Tips'
];
