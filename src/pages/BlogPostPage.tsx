import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ArrowLeft, Calendar, Clock, Eye, Share2, Tag, User, AlertTriangle, Check } from 'lucide-react';
import { blogService, BlogPost } from '../services/blogService';

interface BlogPostPageProps {
  slug: string;
  onNavigate: (page: string) => void;
}

const BlogPostPage = ({ slug, onNavigate }: BlogPostPageProps) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadPost = useCallback(async () => {
    try {
      setLoading(true);
      setPost(null);
      const blogPost = await blogService.getPostBySlug(slug);
      setPost(blogPost);
    } catch (err) {
      console.error('Failed to load blog post:', err);
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug, loadPost]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: url
        });
      } catch {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  const handleBackToBlog = () => {
    window.history.pushState({}, '', '/blog');
    onNavigate('blog');
  };

  const renderContent = (content: string) => {
    if (!content || typeof content !== 'string') {
      console.warn('⚠️ BlogPostPage.renderContent called with invalid content:', typeof content, content);
      return null;
    }
    
    try {
      return content.split('\n').map((paragraph, index) => {
        if (!paragraph || typeof paragraph !== 'string' || paragraph.trim() === '') return null;
        
        if (paragraph && typeof paragraph === 'string' && paragraph.startsWith('# ')) {
          return (
            <h1 key={index} className="text-3xl font-bold mb-6 text-white">
              {paragraph.replace('# ', '')}
            </h1>
          );
        }
        
        if (paragraph && typeof paragraph === 'string' && paragraph.startsWith('## ')) {
          return (
            <h2 key={index} className="text-2xl font-semibold mb-4 text-risevia-teal">
              {paragraph.replace('## ', '')}
            </h2>
          );
        }
        
        if (paragraph && typeof paragraph === 'string' && paragraph.startsWith('### ')) {
          return (
            <h3 key={index} className="text-xl font-semibold mb-3 text-risevia-purple">
              {paragraph.replace('### ', '')}
            </h3>
          );
        }
        
        if (paragraph && typeof paragraph === 'string' && paragraph.startsWith('**') && paragraph.endsWith('**')) {
          return (
            <p key={index} className="text-lg font-bold mb-4 text-white">
              {paragraph.replace(/\*\*/g, '')}
            </p>
          );
        }
        
        if (paragraph && typeof paragraph === 'string' && (paragraph.startsWith('• ') || paragraph.startsWith('- '))) {
          return (
            <li key={index} className="text-gray-300 mb-2 ml-4">
              {paragraph.replace(/^[•-]\s/, '')}
            </li>
          );
        }
        
        return (
          <p key={index} className="text-gray-300 mb-4 leading-relaxed">
            {paragraph}
          </p>
        );
      });
    } catch (error) {
      console.error('❌ Error in BlogPostPage.renderContent:', error, 'Content:', content);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-risevia-black via-gray-900 to-risevia-black text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-risevia-teal border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xl text-gray-300">Loading article...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-risevia-black via-gray-900 to-risevia-black text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4 text-gray-300">Article Not Found</h1>
            <p className="text-gray-400 mb-8">The article you're looking for doesn't exist or has been removed.</p>
            <Button 
              onClick={handleBackToBlog}
              className="bg-gradient-to-r from-risevia-purple to-risevia-teal"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-risevia-black via-gray-900 to-risevia-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          onClick={handleBackToBlog}
          variant="ghost" 
          className="mb-8 text-risevia-teal hover:text-risevia-purple"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Button>

        {/* Article Header */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader className="pb-6">
              <CardTitle className="text-3xl md:text-4xl font-bold text-white mb-4">
                {post.title}
              </CardTitle>
              
              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {post.author_name}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.published_at || post.created_at)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {getReadingTime(post.content)}
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {post.view_count} views
                </div>
              </div>

              {/* Keywords */}
              {post.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.keywords.map(keyword => (
                    <Badge 
                      key={keyword} 
                      variant="secondary" 
                      className="bg-risevia-purple/20 text-risevia-purple border-risevia-purple/30"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Share Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleShare}
                  variant="outline" 
                  size="sm"
                  className="border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="prose prose-invert max-w-none">
              {/* Article Content */}
              <div className="text-lg leading-relaxed">
                {renderContent(post.content)}
              </div>
            </CardContent>
          </Card>

          {/* Cannabis Compliance Notice */}
          <Card className="bg-amber-900/20 border-amber-700/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                <div className="text-sm text-amber-200">
                  <p className="font-semibold mb-2">Important Cannabis Compliance Information</p>
                  <p className="mb-2">
                    This content is for educational purposes only and has not been evaluated by the FDA. 
                    Cannabis products are not intended to diagnose, treat, cure, or prevent any disease.
                  </p>
                  <p className="mb-2">
                    <strong>Age Restriction:</strong> You must be 21+ to purchase cannabis products. 
                    Keep out of reach of children and pets.
                  </p>
                  <p>
                    <strong>Legal Notice:</strong> Cannabis laws vary by state. Please consult your local 
                    regulations before purchasing or consuming cannabis products. Do not drive or operate 
                    machinery after use.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Article Footer */}
          <div className="text-center">
            <Button 
              onClick={handleBackToBlog}
              className="bg-gradient-to-r from-risevia-purple to-risevia-teal"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Articles
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;
