// services/staffService/orderParticipantsService.ts
import { apiClient } from '../../config/api';

export interface OrderParticipant {
  id: string;
  participant_name: string;
  relationship: string;
  age: number;
  note?: string;
  order_id: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export class OrderParticipantsService {
  
  // ✅ Get participants by order ID
  static async getParticipantsByOrderId(orderId: string): Promise<OrderParticipant[]> {
    try {
      console.log(`👥 Fetching participants for order ${orderId}...`);
      
      const response = await Promise.race([
        apiClient.get<ApiResponse<OrderParticipant[]>>(`/OrderParticipants/order/${orderId}`),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Participants fetch timeout')), 8000)
        )
      ]) as any;
      
      if (response.data.code === 200) {
        const participants = response.data.result || [];
        console.log(`✅ Found ${participants.length} participants for order ${orderId}`);
        return participants;
      } else {
        console.warn(`⚠️ Failed to fetch participants for order ${orderId}:`, response.data.message);
        return [];
      }
    } catch (error) {
      console.error(`❌ Error fetching participants for order ${orderId}:`, error);
      return [];
    }
  }

  // ✅ Get participant by ID
  static async getParticipantById(participantId: string): Promise<OrderParticipant | null> {
    try {
      console.log(`👤 Fetching participant ${participantId}...`);
      
      const response = await apiClient.get<ApiResponse<OrderParticipant>>(`/OrderParticipants/${participantId}`);
      
      if (response.data.code === 200) {
        console.log(`✅ Found participant ${participantId}`);
        return response.data.result;
      } else {
        console.warn(`⚠️ Failed to fetch participant ${participantId}:`, response.data.message);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error fetching participant ${participantId}:`, error);
      return null;
    }
  }

  // ✅ Format participant display text
  static formatParticipantText(participant: OrderParticipant): string {
    const ageText = participant.age ? ` (${participant.age} tuổi)` : '';
    return `${participant.participant_name}${ageText} - ${participant.relationship}`;
  }

  // ✅ Get relationship display text
  static getRelationshipDisplayText(relationship: string): string {
    const relationshipMap: Record<string, string> = {
      'father': 'Cha',
      'mother': 'Mẹ',
      'son': 'Con trai',
      'daughter': 'Con gái',
      'brother': 'Anh/Em trai',
      'sister': 'Chị/Em gái',
      'spouse': 'Vợ/Chồng',
      'grandparent': 'Ông/Bà',
      'grandchild': 'Cháu',
      'uncle': 'Chú/Bác',
      'aunt': 'Cô/Dì',
      'cousin': 'Anh/Chị/Em họ',
      'other': 'Khác'
    };
    
    return relationshipMap[relationship.toLowerCase()] || relationship;
  }

  // ✅ Cache for participants to avoid duplicate API calls
  private static participantsCache = new Map<string, OrderParticipant[]>();
  private static cacheExpiry = new Map<string, number>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static async getParticipantsByOrderIdCached(orderId: string): Promise<OrderParticipant[]> {
    // Check cache first
    if (this.isParticipantsCached(orderId)) {
      console.log(`📦 Cache hit for participants of order ${orderId}`);
      return this.participantsCache.get(orderId)!;
    }

    // Fetch from API
    const participants = await this.getParticipantsByOrderId(orderId);
    
    // Cache the result
    this.cacheParticipants(orderId, participants);
    
    return participants;
  }

  private static isParticipantsCached(orderId: string): boolean {
    if (!this.participantsCache.has(orderId)) {
      return false;
    }
    
    const expiry = this.cacheExpiry.get(orderId) || 0;
    if (Date.now() > expiry) {
      this.participantsCache.delete(orderId);
      this.cacheExpiry.delete(orderId);
      return false;
    }
    
    return true;
  }

  private static cacheParticipants(orderId: string, participants: OrderParticipant[]): void {
    this.participantsCache.set(orderId, participants);
    this.cacheExpiry.set(orderId, Date.now() + this.CACHE_DURATION);
  }

  // ✅ Clear cache when needed
  static clearParticipantsCache(): void {
    this.participantsCache.clear();
    this.cacheExpiry.clear();
    console.log('🗑️ Participants cache cleared');
  }
}