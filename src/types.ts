export interface Category {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrls: string[];
  status: 'available' | 'sold';
  isPinned?: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  displayName?: string;
  whatsappNumber?: string;
  createdAt: any;
}
