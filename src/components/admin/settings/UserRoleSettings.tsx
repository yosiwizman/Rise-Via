import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import { Plus, Edit, Shield, Users } from 'lucide-react';

const sql = Object.assign(
  (strings: TemplateStringsArray, ...values: any[]) => {
    const query = strings.join('?');
    console.log('Mock SQL Query (UserRoleSettings):', query, values);
    
    if (query.includes('admin_users')) {
      return Promise.resolve([
        {
          id: 'admin-1',
          email: 'admin@rise-via.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          permissions: {},
          is_active: true,
          last_login_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: 'manager-1',
          email: 'manager@rise-via.com',
          first_name: 'Manager',
          last_name: 'User',
          role: 'manager',
          permissions: {},
          is_active: true,
          last_login_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ]);
    }
    
    return Promise.resolve([]);
  },
  {
    unsafe: (str: string) => str
  }
);

interface AdminUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'manager' | 'employee';
  permissions: Record<string, any>;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

const UserRoleSettings: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const rolePermissions = {
    admin: {
      label: 'Administrator',
      color: 'bg-red-100 text-red-800',
      permissions: {
        products: { create: true, read: true, update: true, delete: true },
        orders: { create: true, read: true, update: true, delete: true },
        customers: { create: true, read: true, update: true, delete: true },
        inventory: { create: true, read: true, update: true, delete: true },
        reports: { view: true, export: true, advanced: true },
        settings: { api: true, users: true, system: true },
        media: { upload: true, manage: true, delete: true }
      }
    },
    manager: {
      label: 'Manager',
      color: 'bg-blue-100 text-blue-800',
      permissions: {
        products: { create: true, read: true, update: true, delete: false },
        orders: { create: true, read: true, update: true, delete: false },
        customers: { create: true, read: true, update: true, delete: false },
        inventory: { create: true, read: true, update: true, delete: false },
        reports: { view: true, export: true, advanced: false },
        settings: { api: false, users: false, system: false },
        media: { upload: true, manage: true, delete: false }
      }
    },
    employee: {
      label: 'Employee',
      color: 'bg-green-100 text-green-800',
      permissions: {
        products: { create: false, read: true, update: false, delete: false },
        orders: { create: true, read: true, update: true, delete: false },
        customers: { create: false, read: true, update: false, delete: false },
        inventory: { create: false, read: true, update: false, delete: false },
        reports: { view: true, export: false, advanced: false },
        settings: { api: false, users: false, system: false },
        media: { upload: false, manage: false, delete: false }
      }
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await sql`
        SELECT * FROM admin_users 
        ORDER BY created_at DESC
      `;
      setUsers(data as AdminUser[]);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const createUser = async (userData: Partial<AdminUser>) => {
    setLoading(true);
    try {
      const permissions = rolePermissions[userData.role as keyof typeof rolePermissions].permissions;
      
      await sql`
        INSERT INTO admin_users (email, first_name, last_name, role, permissions, is_active, created_at)
        VALUES (${userData.email}, ${userData.first_name}, ${userData.last_name}, ${userData.role}, ${JSON.stringify(permissions)}, true, NOW())
      `;
      
      await loadUsers();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: Partial<AdminUser>) => {
    setLoading(true);
    try {
      if (updates.role) {
        updates.permissions = rolePermissions[updates.role].permissions;
      }
      
      const setClause = Object.keys(updates)
        .map(key => `${key} = $${Object.keys(updates).indexOf(key) + 2}`)
        .join(', ');
      
      await sql`
        UPDATE admin_users 
        SET ${sql.unsafe(setClause)}, updated_at = NOW()
        WHERE id = ${userId}
      `;
      
      await loadUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    await updateUser(userId, { is_active: isActive });
  };

  const UserForm: React.FC<{ user?: AdminUser; onSubmit: (data: Partial<AdminUser>) => void; onCancel: () => void }> = ({ user, onSubmit, onCancel }) => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      
      onSubmit({
        email: formData.get('email') as string,
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        role: formData.get('role') as 'admin' | 'manager' | 'employee'
      });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>{user ? 'Edit User' : 'Create New User'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user?.email}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <select
                  id="role"
                  name="role"
                  defaultValue={user?.role}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-risevia-purple"
                  required
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  defaultValue={user?.first_name}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  defaultValue={user?.last_name}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-risevia-purple hover:bg-risevia-purple/90">
                {loading ? 'Saving...' : (user ? 'Update User' : 'Create User')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">User Role Management</h3>
          <p className="text-sm text-gray-600">Manage admin users and their permissions</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 bg-risevia-purple hover:bg-risevia-purple/90"
        >
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </Button>
      </div>

      {showCreateForm && (
        <UserForm
          onSubmit={createUser}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingUser && (
        <UserForm
          user={editingUser}
          onSubmit={(data) => updateUser(editingUser.id, data)}
          onCancel={() => setEditingUser(null)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Object.entries(rolePermissions).map(([role, config]) => (
          <Card key={role}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-risevia-purple" />
                <span>{config.label}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm font-medium">Permissions:</div>
                <div className="space-y-1 text-xs">
                  {Object.entries(config.permissions).map(([area, perms]) => (
                    <div key={area} className="flex justify-between">
                      <span className="capitalize">{area}:</span>
                      <span className="text-gray-600">
                        {Object.entries(perms as Record<string, boolean>)
                          .filter(([, allowed]) => allowed)
                          .map(([perm]) => perm.charAt(0).toUpperCase())
                          .join('')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-risevia-purple" />
            <span>Admin Users ({users.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{user.email}</span>
                      <Badge className={rolePermissions[user.role].color}>
                        {rolePermissions[user.role].label}
                      </Badge>
                      {!user.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {user.first_name} {user.last_name}
                      {user.last_login_at && (
                        <span className="ml-2">• Last login: {new Date(user.last_login_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={user.is_active}
                    onCheckedChange={(checked) => toggleUserStatus(user.id, checked)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingUser(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No admin users found. Create your first admin user to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRoleSettings;
