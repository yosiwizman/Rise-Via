import { motion } from 'framer-motion';
import { BookOpen, Microscope, FileText, Play, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { SEOHead } from '../components/SEOHead';

export const LearnPage = () => {
  const educationalSections = [
    {
      icon: <Microscope className="w-8 h-8" />,
      title: "Understanding THCA",
      content: [
        "THCA (Tetrahydrocannabinolic Acid) is the non-psychoactive precursor to THC found in raw cannabis plants.",
        "Unlike THC, THCA doesn't produce intoxicating effects in its natural state, making it federally compliant when containing less than 0.3% Delta-9 THC.",
        "THCA converts to THC through decarboxylation - a process that occurs when the compound is heated through smoking, vaping, or cooking.",
        "This conversion process is what activates the psychoactive properties, transforming THCA into the THC that produces the traditional cannabis effects."
      ]
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "The Science of Potency",
      content: [
        "THCA potency is measured as a percentage of the total cannabinoid content in the product.",
        "Higher THCA percentages indicate more potential THC conversion when heated, resulting in stronger effects.",
        "Our products range from 25% to 35% THCA, representing premium-grade cannabis with exceptional potency potential.",
        "Terpene profiles work synergistically with THCA to create the 'entourage effect,' enhancing the overall experience and therapeutic benefits."
      ]
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Reading a Certificate of Analysis (COA)",
      content: [
        "Every RiseViA product comes with a third-party Certificate of Analysis (COA) that provides detailed information about the product's composition.",
        "The COA shows exact cannabinoid percentages, including THCA, Delta-9 THC, CBD, and other minor cannabinoids.",
        "Pesticide screening results ensure our products are free from harmful chemicals and contaminants.",
        "Heavy metal testing confirms the absence of lead, mercury, cadmium, and arsenic for your safety.",
        "Microbial testing checks for bacteria, yeast, mold, and other potentially harmful microorganisms."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-risevia-light py-8">
      <SEOHead
        title="Cannabis Education & THCA Information"
        description="Learn about THCA, cannabis science, and lab testing. Educational resources about hemp-derived cannabinoids, potency, and certificates of analysis."
        canonical="https://risevia.com/learn"
      />
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
            Cannabis Education
          </h1>
          <p className="text-xl text-risevia-charcoal dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Knowledge is power. Learn about THCA, cannabis science, and how to make informed decisions 
            about your wellness journey with our comprehensive educational resources.
          </p>
        </motion.div>

        <div className="space-y-16">
          {educationalSections.map((section, index) => (
            <motion.section
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
            >
              <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <Card className="card-light border-gray-200 h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center text-white">
                        {section.icon}
                      </div>
                      <CardTitle className="text-2xl text-risevia-black dark:text-gray-100">{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {section.content.map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-risevia-charcoal dark:text-gray-300 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className={`${index % 2 === 1 ? 'lg:order-1' : ''} flex items-center justify-center`}>
                <div className="aspect-square w-full max-w-md bg-gradient-to-br from-risevia-purple/20 to-risevia-teal/20 rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center text-white">
                      {section.icon}
                    </div>
                    <Badge className="bg-risevia-teal text-white text-lg px-4 py-2">
                      Educational Content
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.section>
          ))}
        </div>

        <Separator className="my-16 bg-gray-200" />

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-8">
            Educational Video Content
          </h2>
          <div className="max-w-4xl mx-auto">
            <Card className="card-light border-gray-200 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-risevia-purple/20 to-risevia-teal/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center text-white">
                    <Play className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-risevia-black dark:text-gray-100 mb-2">Coming Soon</h3>
                  <p className="text-risevia-charcoal dark:text-gray-300">Educational video content will be available here</p>
                  <Badge className="mt-4 bg-risevia-teal text-white">YouTube Integration Ready</Badge>
                </div>
              </div>
            </Card>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <Card className="card-light border-gray-200">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center text-white">
                  <Award className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl text-risevia-black dark:text-gray-100">Infographic Library</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-risevia-charcoal mb-4">
                Visual guides and infographics explaining cannabis science, THCA benefits, and usage guidelines.
              </p>
              <Button variant="outline" className="border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white">
                View Infographics (Coming Soon)
              </Button>
            </CardContent>
          </Card>

          <Card className="card-light border-gray-200">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl text-risevia-black dark:text-gray-100">Research Papers</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-risevia-charcoal mb-4">
                Access to peer-reviewed research and scientific studies about THCA and cannabis therapeutics.
              </p>
              <Button variant="outline" className="border-risevia-teal text-risevia-teal hover:bg-risevia-teal hover:text-white">
                Browse Research (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
};
