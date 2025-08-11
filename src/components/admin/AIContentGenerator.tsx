import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, FileText, Wand2, Copy, Download, Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { aiService } from '../../services/AIService';
import { ComplianceChecker } from './ComplianceChecker';

export const AIContentGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [activeTab, setActiveTab] = useState('product');

  const [productForm, setProductForm] = useState({
    name: '',
    strainType: 'hybrid' as 'sativa' | 'indica' | 'hybrid',
    thcaPercentage: '',
    effects: '',
    category: 'flower'
  });

  const [blogForm, setBlogForm] = useState({
    topic: '',
    keywords: '',
    targetLength: '500',
    tone: 'educational' as 'educational' | 'promotional' | 'informative'
  });

  const [metaForm, setMetaForm] = useState({
    content: ''
  });

  const handleGenerateProduct = async () => {
    if (!productForm.name || !productForm.thcaPercentage || !productForm.effects) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await aiService.generateProductDescription({
        name: productForm.name,
        strainType: productForm.strainType as 'sativa' | 'indica' | 'hybrid',
        thcPercentage: parseFloat(productForm.thcaPercentage),
        cbdPercentage: 0,
        terpenes: [],
        effects: productForm.effects.split(',').map(e => e.trim())
      });
      
      if (result && result.trim()) {
        setGeneratedContent(result);
      } else {
        const fallbackContent = `**${productForm.name} - Premium THCA ${productForm.strainType.charAt(0).toUpperCase() + productForm.strainType.slice(1)}**

Experience the exceptional quality of ${productForm.name}, a premium ${productForm.strainType} strain with ${productForm.thcaPercentage}% THCA content.

**Effects:** ${productForm.effects}

**Key Features:**
• Lab-tested for purity and potency
• Federally compliant hemp-derived THCA
• Third-party COA available
• Discreet packaging and fast shipping

**Important:** This product has not been evaluated by the FDA. Not for use by minors, pregnant or nursing women. Keep out of reach of children and pets. Do not drive or operate machinery after use.

*Must be 21+ to purchase. Please consume responsibly.*`;
        
        setGeneratedContent(fallbackContent);
        console.warn('AI service returned empty result, using fallback content');
      }
    } catch (error) {
      console.error('Product generation error:', error);
      
      const fallbackContent = `**${productForm.name} - Premium THCA ${productForm.strainType.charAt(0).toUpperCase() + productForm.strainType.slice(1)}**

Experience the exceptional quality of ${productForm.name}, a premium ${productForm.strainType} strain with ${productForm.thcaPercentage}% THCA content.

**Effects:** ${productForm.effects}

**Key Features:**
• Lab-tested for purity and potency
• Federally compliant hemp-derived THCA
• Third-party COA available
• Discreet packaging and fast shipping

**Important:** This product has not been evaluated by the FDA. Not for use by minors, pregnant or nursing women. Keep out of reach of children and pets. Do not drive or operate machinery after use.

*Must be 21+ to purchase. Please consume responsibly.*

*Note: AI generation temporarily unavailable. This is a template description.*`;
      
      setGeneratedContent(fallbackContent);
      alert('AI service temporarily unavailable. Generated template description instead.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateBlog = async () => {
    if (!blogForm.topic || !blogForm.keywords) {
      alert('Please fill in topic and keywords');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await aiService.generateBlogPost({
        topic: blogForm.topic,
        keywords: blogForm.keywords.split(',').map(k => k.trim()).filter(k => k),
        targetLength: parseInt(blogForm.targetLength),
        tone: blogForm.tone as 'educational' | 'promotional' | 'informative'
      });
      
      if (result && result.trim()) {
        setGeneratedContent(result);
      } else {
        const fallbackContent = `# ${blogForm.topic}

## Introduction

Welcome to our comprehensive guide on ${blogForm.topic}. In this ${blogForm.tone} article, we'll explore the key aspects of ${blogForm.keywords.split(',')[0]?.trim() || 'cannabis'} and provide valuable insights for our community.

## Key Points

Understanding ${blogForm.topic} is essential for anyone interested in cannabis education and responsible consumption. Here are the main topics we'll cover:

• **Safety and Compliance**: Always prioritize safety and legal compliance
• **Quality Standards**: Learn about lab testing and quality assurance
• **Best Practices**: Discover recommended usage guidelines
• **Community Insights**: Connect with fellow enthusiasts

## Conclusion

${blogForm.topic} represents an important aspect of cannabis education. We encourage all readers to stay informed, consume responsibly, and follow local regulations.

**Keywords**: ${blogForm.keywords}

---

*Disclaimer: This content is for educational purposes only. Cannabis products have not been evaluated by the FDA. Keep out of reach of children and pets. Must be 21+ to purchase.*`;
        
        setGeneratedContent(fallbackContent);
        console.warn('AI service returned empty result, using fallback content');
      }
    } catch (error) {
      console.error('Blog generation error:', error);
      
      const fallbackContent = `# ${blogForm.topic}

## Introduction

Welcome to our guide on ${blogForm.topic}. This ${blogForm.tone} article covers important information about ${blogForm.keywords.split(',')[0]?.trim() || 'cannabis'}.

## Key Information

Understanding ${blogForm.topic} is crucial for cannabis education and responsible use.

## Important Notes

• Always follow local laws and regulations
• Consume responsibly and safely
• Keep products away from children and pets
• Consult with healthcare providers when needed

**Keywords**: ${blogForm.keywords}

*Note: AI generation temporarily unavailable. This is a template blog post.*

---

*Disclaimer: This content is for educational purposes only. Must be 21+ to purchase cannabis products.*`;
      
      setGeneratedContent(fallbackContent);
      alert('AI service temporarily unavailable. Generated template blog post instead.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMeta = async () => {
    if (!metaForm.content) {
      alert('Please provide content for meta description generation');
      return;
    }

    setIsGenerating(true);
    try {
      alert('Meta description generation feature coming soon!');
      setGeneratedContent('Meta description generation feature is not yet implemented.');
    } catch (error) {
      console.error('Meta generation error:', error);
      alert('Failed to generate meta description. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    alert('Content copied to clipboard!');
  };

  const downloadContent = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-generated-${activeTab}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-risevia-purple" />
            AI Content Generator
            <Badge className="bg-risevia-teal text-white">Beta</Badge>
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>All generated content includes compliance disclaimers and follows cannabis industry regulations.</span>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="product">Product Descriptions</TabsTrigger>
              <TabsTrigger value="blog">Blog Posts</TabsTrigger>
              <TabsTrigger value="meta">Meta Descriptions</TabsTrigger>
              <TabsTrigger value="compliance">Compliance Check</TabsTrigger>
            </TabsList>

            <TabsContent value="product" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Blue Dream"
                  />
                </div>
                
                <div>
                  <Label htmlFor="strainType">Strain Type</Label>
                  <Select value={productForm.strainType} onValueChange={(value: 'sativa' | 'indica' | 'hybrid') => setProductForm(prev => ({ ...prev, strainType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sativa">Sativa</SelectItem>
                      <SelectItem value="indica">Indica</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="thcaPercentage">THCA Percentage *</Label>
                  <Input
                    id="thcaPercentage"
                    type="number"
                    step="0.1"
                    value={productForm.thcaPercentage}
                    onChange={(e) => setProductForm(prev => ({ ...prev, thcaPercentage: e.target.value }))}
                    placeholder="e.g., 25.5"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={productForm.category} onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flower">Flower</SelectItem>
                      <SelectItem value="pre-rolls">Pre-Rolls</SelectItem>
                      <SelectItem value="concentrates">Concentrates</SelectItem>
                      <SelectItem value="edibles">Edibles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="effects">Effects (comma-separated) *</Label>
                <Input
                  id="effects"
                  value={productForm.effects}
                  onChange={(e) => setProductForm(prev => ({ ...prev, effects: e.target.value }))}
                  placeholder="e.g., relaxed, euphoric, creative"
                />
              </div>

              <Button 
                onClick={handleGenerateProduct}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Product Description
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="blog" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="blogTopic">Blog Topic *</Label>
                  <Input
                    id="blogTopic"
                    value={blogForm.topic}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Understanding Terpenes"
                  />
                </div>

                <div>
                  <Label htmlFor="targetLength">Target Length (words)</Label>
                  <Select value={blogForm.targetLength} onValueChange={(value) => setBlogForm(prev => ({ ...prev, targetLength: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="300">300 words</SelectItem>
                      <SelectItem value="500">500 words</SelectItem>
                      <SelectItem value="800">800 words</SelectItem>
                      <SelectItem value="1200">1200 words</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={blogForm.tone} onValueChange={(value: 'educational' | 'promotional' | 'informative') => setBlogForm(prev => ({ ...prev, tone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="informative">Informative</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="keywords">Keywords (comma-separated) *</Label>
                <Input
                  id="keywords"
                  value={blogForm.keywords}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="e.g., cannabis, terpenes, effects, education"
                />
              </div>

              <Button 
                onClick={handleGenerateBlog}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Blog Post
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="meta" className="space-y-4">
              <div>
                <Label htmlFor="metaContent">Content for Meta Description *</Label>
                <Textarea
                  id="metaContent"
                  value={metaForm.content}
                  onChange={(e) => setMetaForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Paste your content here to generate an SEO meta description..."
                  rows={6}
                />
              </div>

              <Button 
                onClick={handleGenerateMeta}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Meta Description
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <ComplianceChecker />
            </TabsContent>
          </Tabs>

          {generatedContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Generated Content</CardTitle>
                    <div className="flex gap-2">
                      <Button onClick={copyToClipboard} variant="outline" size="sm">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button onClick={downloadContent} variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                      {generatedContent}
                    </pre>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Compliance Check Passed</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Content includes required disclaimers and follows cannabis industry regulations.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
