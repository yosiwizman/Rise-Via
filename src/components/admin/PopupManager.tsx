import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { popupService } from '../../services/popupService';
import { uploadToCloudinary } from '../../lib/cloudinary';
import type { Popup } from '../../types/database';

export const PopupManager = () => {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    trigger_type: 'timer' as 'timer' | 'exit_intent' | 'scroll' | 'page_load',
    trigger_delay: 5000,
    is_active: true,
    priority: 1,
    target_pages: [] as string[],
    display_frequency: 'once_per_session' as 'once_per_session' | 'once_per_day' | 'always',
    start_date: '',
    end_date: ''
  });

  const loadPopups = async () => {
    setLoading(true);
    const data = await popupService.getAllPopups();
    setPopups(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPopups();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      image_url: '',
      trigger_type: 'timer',
      trigger_delay: 5000,
      is_active: true,
      priority: 1,
      target_pages: [],
      display_frequency: 'once_per_session',
      start_date: '',
      end_date: ''
    });
    setEditingPopup(null);
    setShowForm(false);
  };

  const handleEdit = (popup: Popup) => {
    setFormData({
      title: popup.title,
      content: popup.content,
      image_url: popup.image_url || '',
      trigger_type: popup.trigger_type,
      trigger_delay: popup.trigger_delay,
      is_active: popup.is_active,
      priority: popup.priority,
      target_pages: popup.target_pages,
      display_frequency: popup.display_frequency,
      start_date: popup.start_date ? new Date(popup.start_date).toISOString().slice(0, 16) : '',
      end_date: popup.end_date ? new Date(popup.end_date).toISOString().slice(0, 16) : ''
    });
    setEditingPopup(popup);
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadToCloudinary(file, 'popups');
      setFormData(prev => ({ ...prev, image_url: result.secure_url }));
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const popupData = {
      ...formData,
      start_date: formData.start_date ? new Date(formData.start_date) : undefined,
      end_date: formData.end_date ? new Date(formData.end_date) : undefined
    };

    try {
      if (editingPopup) {
        await popupService.updatePopup(editingPopup.id, popupData);
      } else {
        await popupService.createPopup(popupData);
      }
      
      await loadPopups();
      resetForm();
      alert(editingPopup ? 'Popup updated successfully!' : 'Popup created successfully!');
    } catch (error) {
      console.error('Failed to save popup:', error);
      alert('Failed to save popup. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this popup?')) return;
    
    try {
      await popupService.deletePopup(id);
      await loadPopups();
      alert('Popup deleted successfully!');
    } catch (error) {
      console.error('Failed to delete popup:', error);
      alert('Failed to delete popup. Please try again.');
    }
  };

  const toggleActive = async (popup: Popup) => {
    try {
      await popupService.updatePopup(popup.id, { is_active: !popup.is_active });
      await loadPopups();
    } catch (error) {
      console.error('Failed to toggle popup status:', error);
      alert('Failed to update popup status.');
    }
  };

  if (loading) {
    return <div className="p-6">Loading popups...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Popup Management ({popups.length}/20)</CardTitle>
            <Button 
              onClick={() => setShowForm(true)}
              disabled={popups.length >= 20}
              className="bg-gradient-to-r from-risevia-purple to-risevia-teal"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Popup
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4">
            {popups.map((popup) => (
              <div key={popup.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{popup.title}</h3>
                      <Badge variant={popup.is_active ? 'default' : 'secondary'}>
                        {popup.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">
                        Priority: {popup.priority}
                      </Badge>
                      <Badge variant="outline">
                        {popup.trigger_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {popup.content.substring(0, 100)}...
                    </p>
                    <div className="text-xs text-gray-500">
                      Delay: {popup.trigger_delay}ms | Frequency: {popup.display_frequency}
                    </div>
                  </div>
                  
                  {popup.image_url && (
                    <img 
                      src={popup.image_url} 
                      alt={popup.title}
                      className="w-16 h-16 object-cover rounded ml-4"
                    />
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(popup)}
                  >
                    {popup.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(popup)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(popup.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {popups.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No popups created yet. Click "Add Popup" to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPopup ? 'Edit Popup' : 'Create New Popup'}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority (1-10)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="image">Popup Image</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
                </div>
                {formData.image_url && (
                  <img 
                    src={formData.image_url} 
                    alt="Preview"
                    className="mt-2 w-32 h-32 object-cover rounded"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="trigger_type">Trigger Type</Label>
                  <Select 
                    value={formData.trigger_type} 
                    onValueChange={(value: 'timer' | 'exit_intent' | 'scroll' | 'page_load') => setFormData(prev => ({ ...prev, trigger_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="timer">Timer</SelectItem>
                      <SelectItem value="page_load">Page Load</SelectItem>
                      <SelectItem value="exit_intent">Exit Intent</SelectItem>
                      <SelectItem value="scroll">Scroll</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="trigger_delay">Delay (ms)</Label>
                  <Input
                    id="trigger_delay"
                    type="number"
                    min="0"
                    value={formData.trigger_delay}
                    onChange={(e) => setFormData(prev => ({ ...prev, trigger_delay: parseInt(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="display_frequency">Display Frequency</Label>
                  <Select 
                    value={formData.display_frequency} 
                    onValueChange={(value: 'once_per_session' | 'once_per_day' | 'always') => setFormData(prev => ({ ...prev, display_frequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once_per_session">Once per session</SelectItem>
                      <SelectItem value="once_per_day">Once per day</SelectItem>
                      <SelectItem value="always">Always</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date (optional)</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date (optional)</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-gradient-to-r from-risevia-purple to-risevia-teal">
                  {editingPopup ? 'Update Popup' : 'Create Popup'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
