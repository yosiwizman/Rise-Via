interface ListmonkSubscriber {
  email: string;
  name: string;
  status: 'enabled' | 'disabled';
  attributes: {
    membershipTier: string;
    loyaltyPoints: number;
    lifetimeValue: number;
    segment: string;
    isB2B: boolean;
    state?: string;
  };
  lists: number[];
}

interface ListmonkCampaign {
  name: string;
  subject: string;
  lists: number[];
  type: 'regular' | 'optin';
  content_type: 'richtext' | 'html';
  body: string;
  template_id?: number;
}

interface ListmonkTemplate {
  name: string;
  type: 'campaign' | 'tx';
  subject: string;
  body: string;
}

class ListmonkService {
  private baseUrl: string;
  private username: string;
  private password: string;

  constructor() {
    this.baseUrl = (import.meta as any).env?.VITE_LISTMONK_URL || 'http://localhost:9000';
    this.username = (import.meta as any).env?.VITE_LISTMONK_USERNAME || 'admin';
    this.password = (import.meta as any).env?.VITE_LISTMONK_PASSWORD || 'admin';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const auth = btoa(`${this.username}:${this.password}`);
      const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`Listmonk API error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Listmonk API request failed:', error);
      throw error;
    }
  }

  async addSubscriber(subscriber: ListmonkSubscriber) {
    return this.makeRequest('/subscribers', {
      method: 'POST',
      body: JSON.stringify(subscriber),
    });
  }

  async updateSubscriber(id: number, updates: Partial<ListmonkSubscriber>) {
    return this.makeRequest(`/subscribers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getSubscriberByEmail(email: string) {
    return this.makeRequest(`/subscribers?query=email LIKE '${email}'`);
  }

  async createCampaign(campaign: ListmonkCampaign) {
    return this.makeRequest('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
  }

  async sendCampaign(campaignId: number) {
    return this.makeRequest(`/campaigns/${campaignId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'running' }),
    });
  }

  async createList(name: string, type: 'public' | 'private' = 'private') {
    return this.makeRequest('/lists', {
      method: 'POST',
      body: JSON.stringify({ name, type }),
    });
  }

  async getLists() {
    return this.makeRequest('/lists');
  }

  async createTemplate(template: ListmonkTemplate) {
    return this.makeRequest('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async getTemplates() {
    return this.makeRequest('/templates');
  }

  async subscribeToList(subscriberId: number, listId: number) {
    return this.makeRequest(`/subscribers/lists`, {
      method: 'PUT',
      body: JSON.stringify({
        ids: [subscriberId],
        action: 'add',
        target_list_ids: [listId],
      }),
    });
  }

  async unsubscribeFromList(subscriberId: number, listId: number) {
    return this.makeRequest(`/subscribers/lists`, {
      method: 'PUT',
      body: JSON.stringify({
        ids: [subscriberId],
        action: 'remove',
        target_list_ids: [listId],
      }),
    });
  }
}

export const listmonkService = new ListmonkService();
export type { ListmonkSubscriber, ListmonkCampaign, ListmonkTemplate };
