import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Calendar, Clock, Eye, Search, Tag, BookOpen, AlertTriangle } from 'lucide-react';
import { blogService, BlogPost } from '../services/blogService';

interface BlogPageProps {
  onNavigate: (page: string, productId?: string, slug?: string) => void;
}

const BlogPage = ({ onNavigate }: BlogPageProps) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const publishedPosts = await blogService.getPublishedPosts();
      setPosts(publishedPosts);
    } catch (error) {
      console.error('Failed to load blog posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterPosts = useCallback(() => {
    let filtered = posts;

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedKeyword) {
      filtered = filtered.filter(post =>
        post.keywords.includes(selectedKeyword)
      );
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, selectedKeyword]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    filterPosts();
  }, [filterPosts]);

  const getAllKeywords = () => {
    const keywordSet = new Set<string>();
    posts.forEach(post => {
      post.keywords.forEach(keyword => keywordSet.add(keyword));
    });
    return Array.from(keywordSet).sort();
  };

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

  const handlePostClick = (slug: string) => {
    window.history.pushState({}, '', `/blog/${slug}`);
    onNavigate('blog-post', undefined, slug);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-risevia-black via-gray-900 to-risevia-black text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-risevia-teal animate-pulse" />
              <p className="text-xl text-gray-300">Loading blog posts...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-risevia-black via-gray-900 to-risevia-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-risevia-purple to-risevia-teal bg-clip-text text-transparent">
            Cannabis Education Blog
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Stay informed with the latest insights, research, and education about cannabis, THCA, and responsible consumption.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>

          {/* Keywords Filter */}
          {getAllKeywords().length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                onClick={() => setSelectedKeyword('')}
                variant={selectedKeyword === '' ? 'default' : 'outline'}
                size="sm"
                className="text-xs"
              >
                All Topics
              </Button>
              {getAllKeywords().slice(0, 8).map(keyword => (
                <Button
                  key={keyword}
                  onClick={() => setSelectedKeyword(keyword)}
                  variant={selectedKeyword === keyword ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs"
                >
                  {keyword}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-2xl font-semibold mb-2 text-gray-300">
              {searchTerm || selectedKeyword ? 'No articles found' : 'No blog posts yet'}
            </h3>
            <p className="text-gray-400">
              {searchTerm || selectedKeyword 
                ? 'Try adjusting your search terms or filters.' 
                : 'Check back soon for educational content about cannabis and THCA.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Card 
                key={post.id} 
                className="bg-gray-800 border-gray-700 hover:border-risevia-teal transition-all duration-300 cursor-pointer group"
                onClick={() => handlePostClick(post.slug)}
              >
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white group-hover:text-risevia-teal transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.published_at || post.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {getReadingTime(post.content)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.view_count}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  {/* Keywords */}
                  {post.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.keywords.slice(0, 3).map(keyword => (
                        <Badge 
                          key={keyword} 
                          variant="secondary" 
                          className="text-xs bg-risevia-purple/20 text-risevia-purple border-risevia-purple/30"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {keyword}
                        </Badge>
                      ))}
                      {post.keywords.length > 3 && (
                        <Badge variant="outline" className="text-xs text-gray-400">
                          +{post.keywords.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      By {post.author_name}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-risevia-teal hover:text-risevia-purple"
                    >
                      Read More →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Cannabis Compliance Footer */}
        <div className="mt-16 p-6 bg-amber-900/20 border border-amber-700/30 rounded-lg">
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
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
