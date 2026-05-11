export type ShippingStatus =
  | '準備中'
  | '発送済み'
  | '配送中'
  | '配達完了'
  | 'キャンセル';

export interface Shipping {
  id: string;
  trackingNumber: string;
  recipient: {
    name: string;
    address: string;
    phone: string;
    email?: string;
  };
  items: {
    name: string;
    quantity: number;
    weight?: number;
  }[];
  status: ShippingStatus;
  shippingDate?: Date;
  deliveryDate?: Date;
  carrier: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingFormData {
  trackingNumber: string;
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
  recipientEmail?: string;
  carrier: string;
  status: ShippingStatus;
  notes?: string;
}
