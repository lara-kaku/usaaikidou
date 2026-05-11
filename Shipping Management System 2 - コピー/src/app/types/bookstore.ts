export type StoreType = 'headquarters' | 'store';

export interface Store {
  id: string;
  name: string;
  type: StoreType;
  address: string;
  phone: string;
  managerName: string;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  price: number;
  category: string;
}

export interface Inventory {
  id: string;
  bookId: string;
  storeId: string;
  quantity: number;
  lastUpdated: Date;
}

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  registeredStoreId: string;
  registeredDate: Date;
  status: 'active' | 'paused' | 'cancelled';
}

export interface Subscription {
  id: string;
  subscriberId: string;
  bookId: string;
  frequency: 'weekly' | 'monthly' | 'quarterly';
  nextDeliveryDate: Date;
  status: 'active' | 'paused' | 'cancelled';
  createdAt: Date;
}

export type OrderStatus = 'pending' | 'approved' | 'shipped' | 'received' | 'cancelled';

export interface StoreOrder {
  id: string;
  orderNumber: string;
  fromStoreId: string;
  toStoreId: string; // Always headquarters
  items: {
    bookId: string;
    quantity: number;
  }[];
  status: OrderStatus;
  requestedDate: Date;
  approvedDate?: Date;
  shippedDate?: Date;
  receivedDate?: Date;
  notes?: string;
}

export type DeliveryStatus = 'scheduled' | 'preparing' | 'shipped' | 'delivered' | 'failed';

export interface SubscriptionDelivery {
  id: string;
  subscriptionId: string;
  subscriberId: string;
  bookId: string;
  scheduledDate: Date;
  shippedDate?: Date;
  deliveredDate?: Date;
  trackingNumber?: string;
  carrier?: string;
  status: DeliveryStatus;
  notes?: string;
}
