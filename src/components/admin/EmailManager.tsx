import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Clock, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { emailAutomationService, type EmailTemplate, type AutomationWorkflow } from '../../services/EmailAutomation';
import { emailService } from '../../services/emailService';

interface EmailLog {
  id: string;
  to_email: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  sent_at: string | null;
}

export const EmailManager = () => {
  const [activeTab, setActiveTab] = useState<'send' | 'templates' | 'automation' | 'logs'>('send');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(false);

  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    body: '',
    templateId: ''
  });

  const [bulkEmailForm, setBulkEmailForm] = useState({
    segment: 'all',
    templateId: '',
    subject: '',
    customMessage: ''
  });

  useEffect(() => {
    loadEmailData();
  }, []);

  const loadEmailData = async () => {
    try {
      const templatesData = emailAutomationService.getTemplates();
      const workflowsData = emailAutomationService.getWorkflows();
      const logsData = await emailService.getEmailLogs(50);
      
      setTemplates(templatesData);
      setWorkflows(workflowsData);
      setEmailLogs(logsData as EmailLog[]);
    } catch (error) {
      console.error('Failed to load email data:', error);
    }
  };

  const handleSendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.body) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const success = await emailService.sendEmail(emailForm.to, emailForm.subject, emailForm.body);
      if (success) {
        alert('Email sent successfully!');
        setEmailForm({ to: '', subject: '', body: '', templateId: '' });
        await loadEmailData();
      } else {
        alert('Failed to send email. Please try again.');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBulkEmail = async () => {
    if (!bulkEmailForm.templateId || !bulkEmailForm.subject) {
      alert('Please select a template and enter a subject');
      return;
    }

    setLoading(true);
    try {
      alert('Bulk email feature requires customer database integration. Feature coming soon!');
    } catch (error) {
      console.error('Failed to send bulk email:', error);
      alert('Failed to send bulk email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setEmailForm(prev => ({
        ...prev,
        templateId,
        subject: template.subject,
        body: template.body
      }));
    }
  };

  const getWorkflowStatusColor = (enabled: boolean) => {
    return enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getEmailStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Email Management</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setActiveTab('send')}
            variant={activeTab === 'send' ? 'default' : 'outline'}
          >
            <Send className="w-4 h-4 mr-2" />
            Send Email
          </Button>
          <Button
            onClick={() => setActiveTab('templates')}
            variant={activeTab === 'templates' ? 'default' : 'outline'}
          >
            <Mail className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button
            onClick={() => setActiveTab('automation')}
            variant={activeTab === 'automation' ? 'default' : 'outline'}
          >
            <Clock className="w-4 h-4 mr-2" />
            Automation
          </Button>
          <Button
            onClick={() => setActiveTab('logs')}
            variant={activeTab === 'logs' ? 'default' : 'outline'}
          >
            <Eye className="w-4 h-4 mr-2" />
            Email Logs
          </Button>
        </div>
      </div>

      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Individual Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template">Use Template (Optional)</Label>
                <Select value={emailForm.templateId} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="to">To Email *</Label>
                <Input
                  id="to"
                  type="email"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject"
                />
              </div>

              <div>
                <Label htmlFor="body">Message *</Label>
                <Textarea
                  id="body"
                  value={emailForm.body}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Email message..."
                  rows={8}
                />
              </div>

              <Button 
                onClick={handleSendEmail}
                disabled={loading}
                className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal"
              >
                {loading ? 'Sending...' : 'Send Email'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Send Bulk Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="segment">Customer Segment</Label>
                <Select value={bulkEmailForm.segment} onValueChange={(value) => setBulkEmailForm(prev => ({ ...prev, segment: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="vip">VIP Customers</SelectItem>
                    <SelectItem value="regular">Regular Customers</SelectItem>
                    <SelectItem value="new">New Customers</SelectItem>
                    <SelectItem value="dormant">Dormant Customers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bulkTemplate">Email Template *</Label>
                <Select value={bulkEmailForm.templateId} onValueChange={(value) => setBulkEmailForm(prev => ({ ...prev, templateId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bulkSubject">Custom Subject</Label>
                <Input
                  id="bulkSubject"
                  value={bulkEmailForm.subject}
                  onChange={(e) => setBulkEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Override template subject"
                />
              </div>

              <div>
                <Label htmlFor="customMessage">Additional Message</Label>
                <Textarea
                  id="customMessage"
                  value={bulkEmailForm.customMessage}
                  onChange={(e) => setBulkEmailForm(prev => ({ ...prev, customMessage: e.target.value }))}
                  placeholder="Add custom message to template..."
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSendBulkEmail}
                disabled={loading}
                className="w-full bg-gradient-to-r from-risevia-purple to-risevia-teal"
              >
                {loading ? 'Sending...' : 'Send Bulk Email'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'templates' && (
        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm">{template.name}</h3>
                    <Badge className="text-xs">{template.type}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                  <div className="text-xs text-gray-500 mb-3">
                    {template.body.substring(0, 100)}...
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTemplateSelect(template.id)}
                    className="w-full"
                  >
                    Use Template
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'automation' && (
        <Card>
          <CardHeader>
            <CardTitle>Email Automation Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{workflow.name}</h3>
                    <p className="text-sm text-gray-600">{workflow.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">Trigger: {workflow.trigger}</Badge>
                      {workflow.delay && (
                        <Badge variant="outline">
                          Delay: {Math.floor(workflow.delay / (24 * 60 * 60 * 1000))} days
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getWorkflowStatusColor(workflow.enabled)}>
                      {workflow.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button size="sm" variant="outline">
                      {workflow.enabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'logs' && (
        <Card>
          <CardHeader>
            <CardTitle>Email Delivery Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">To</th>
                    <th className="text-left p-3">Subject</th>
                    <th className="text-left p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {emailLogs.length > 0 ? (
                    emailLogs.map((log, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm">
                          {log.sent_at ? new Date(log.sent_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-3">{log.to_email}</td>
                        <td className="p-3">{log.subject}</td>
                        <td className="p-3">
                          <Badge className={getEmailStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">
                        No email logs available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
