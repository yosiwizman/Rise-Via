import { sql } from '../lib/neon';
import type { Popup } from '../types/database';

export const popupService = {
  async getAllPopups(): Promise<Popup[]> {
    if (!sql) {
      console.warn('Database not available, returning empty popups');
      return [];
    }
    
    try {
      const result = await sql`
        SELECT * FROM popups 
        ORDER BY priority DESC, created_at DESC
      `;
      return result as Popup[];
    } catch (error) {
      console.error('Failed to fetch popups:', error);
      return [];
    }
  },

  async getActivePopups(currentPage: string): Promise<Popup[]> {
    if (!sql) return [];
    
    try {
      const now = new Date().toISOString();
      const result = await sql`
        SELECT * FROM popups 
        WHERE is_active = true 
        AND (start_date IS NULL OR start_date <= ${now})
        AND (end_date IS NULL OR end_date >= ${now})
        AND (target_pages = '{}' OR ${currentPage} = ANY(target_pages))
        ORDER BY priority DESC
        LIMIT 20
      `;
      return result as Popup[];
    } catch (error) {
      console.error('Failed to fetch active popups:', error);
      return [];
    }
  },

  async createPopup(popup: Omit<Popup, 'id' | 'created_at' | 'updated_at'>): Promise<Popup | null> {
    if (!sql) {
      console.warn('Database not available, popup not saved');
      return null;
    }
    
    try {
      const result = await sql`
        INSERT INTO popups (
          title, content, image_url, trigger_type, trigger_delay,
          is_active, priority, target_pages, display_frequency,
          start_date, end_date
        ) VALUES (
          ${popup.title}, ${popup.content}, ${popup.image_url || null},
          ${popup.trigger_type}, ${popup.trigger_delay}, ${popup.is_active},
          ${popup.priority}, ${popup.target_pages}, ${popup.display_frequency},
          ${popup.start_date || null}, ${popup.end_date || null}
        )
        RETURNING *
      `;
      return result[0] as Popup;
    } catch (error) {
      console.error('Failed to create popup:', error);
      return null;
    }
  },

  async updatePopup(id: string, updates: Partial<Popup>): Promise<Popup | null> {
    if (!sql) return null;
    
    try {
      const result = await sql`
        UPDATE popups 
        SET 
          title = COALESCE(${updates.title}, title),
          content = COALESCE(${updates.content}, content),
          image_url = COALESCE(${updates.image_url}, image_url),
          trigger_type = COALESCE(${updates.trigger_type}, trigger_type),
          trigger_delay = COALESCE(${updates.trigger_delay}, trigger_delay),
          is_active = COALESCE(${updates.is_active}, is_active),
          priority = COALESCE(${updates.priority}, priority),
          target_pages = COALESCE(${updates.target_pages}, target_pages),
          display_frequency = COALESCE(${updates.display_frequency}, display_frequency),
          start_date = COALESCE(${updates.start_date}, start_date),
          end_date = COALESCE(${updates.end_date}, end_date),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0] as Popup;
    } catch (error) {
      console.error('Failed to update popup:', error);
      return null;
    }
  },

  async deletePopup(id: string): Promise<boolean> {
    if (!sql) return false;
    
    try {
      await sql`DELETE FROM popups WHERE id = ${id}`;
      return true;
    } catch (error) {
      console.error('Failed to delete popup:', error);
      return false;
    }
  }
};
