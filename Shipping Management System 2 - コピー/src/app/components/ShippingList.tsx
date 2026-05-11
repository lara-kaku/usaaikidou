import { Package, Truck, CheckCircle, XCircle, Clock, Edit2, Trash2 } from 'lucide-react';
import type { Shipping, ShippingStatus } from '../types/shipping';

interface ShippingListProps {
  shipments: Shipping[];
  onEdit: (shipping: Shipping) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<ShippingStatus, { icon: React.ReactNode; color: string; bgColor: string }> = {
  '準備中': {
    icon: <Clock className="w-5 h-5" />,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  '発送済み': {
    icon: <Package className="w-5 h-5" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  '配送中': {
    icon: <Truck className="w-5 h-5" />,
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
  },
  '配達完了': {
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  'キャンセル': {
    icon: <XCircle className="w-5 h-5" />,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
};

export function ShippingList({ shipments, onEdit, onDelete }: ShippingListProps) {
  if (shipments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p>発送データがありません</p>
        <p className="text-sm mt-2">右上の「新規発送」ボタンから追加してください</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shipments.map((shipping) => {
        const statusInfo = statusConfig[shipping.status];
        return (
          <div
            key={shipping.id}
            className="bg-white rounded-lg border hover:shadow-md transition-shadow p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                    {statusInfo.icon}
                    {shipping.status}
                  </span>
                  <span className="text-sm text-gray-500">{shipping.carrier}</span>
                </div>
                <h3 className="font-semibold text-lg mb-1">{shipping.recipient.name}</h3>
                <p className="text-sm text-gray-600">{shipping.recipient.address}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(shipping)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="編集"
                >
                  <Edit2 className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => onDelete(shipping.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="削除"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-500">追跡番号:</span>
                <span className="ml-2 font-mono font-medium">{shipping.trackingNumber}</span>
              </div>
              <div>
                <span className="text-gray-500">電話:</span>
                <span className="ml-2">{shipping.recipient.phone}</span>
              </div>
              {shipping.recipient.email && (
                <div>
                  <span className="text-gray-500">メール:</span>
                  <span className="ml-2">{shipping.recipient.email}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-3">
              <div className="text-sm font-medium text-gray-700 mb-2">商品:</div>
              <div className="flex flex-wrap gap-2">
                {shipping.items.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {item.name} × {item.quantity}
                  </span>
                ))}
              </div>
            </div>

            {shipping.notes && (
              <div className="mt-3 pt-3 border-t">
                <span className="text-sm text-gray-500">備考: </span>
                <span className="text-sm">{shipping.notes}</span>
              </div>
            )}

            <div className="mt-3 pt-3 border-t text-xs text-gray-400">
              登録日時: {new Date(shipping.createdAt).toLocaleString('ja-JP')}
            </div>
          </div>
        );
      })}
    </div>
  );
}
