import { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { validateContent } from '../../utils/aiCompliance';

export const ComplianceChecker = () => {
  const [content, setContent] = useState('');
  const [result, setResult] = useState<{
    isCompliant: boolean;
    violations: string[];
    suggestions: string[];
  } | null>(null);

  const checkCompliance = () => {
    const validation = validateContent(content);
    setResult(validation);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          Cannabis Compliance Checker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Content to Check
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your content here to check for cannabis compliance..."
            rows={6}
          />
        </div>

        <Button onClick={checkCompliance} disabled={!content.trim()}>
          Check Compliance
        </Button>

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {result.isCompliant ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <Badge className="bg-green-100 text-green-800">
                    Compliant
                  </Badge>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <Badge className="bg-red-100 text-red-800">
                    Non-Compliant
                  </Badge>
                </>
              )}
            </div>

            {result.violations.length > 0 && (
              <div>
                <h4 className="font-medium text-red-800 mb-2">Violations:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.violations.map((violation, index) => (
                    <li key={index} className="text-sm text-red-700">
                      {violation}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-amber-800 mb-2">Suggestions:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-amber-700">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
