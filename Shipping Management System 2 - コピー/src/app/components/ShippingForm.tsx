import { useState } from 'react';
import { X } from 'lucide-react';
import type { Shipping, ShippingStatus } from '../types/shipping';

interface ShippingFormProps {
  onSubmit: (shipping: Omit<Shipping, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: Shipping;
}

export function ShippingForm({ onSubmit, onCancel, initialData }: ShippingFormProps) {
  const [formData, setFormData] = useState({
    trackingNumber: initialData?.trackingNumber || '',
    recipientName: initialData?.recipient.name || '',
    recipientAddress: initialData?.recipient.address || '',
    recipientPhone: initialData?.recipient.phone || '',
    recipientEmail: initialData?.recipient.email || '',
    carrier: initialData?.carrier || '',
    status: (initialData?.status || '準備中') as ShippingStatus,
    notes: initialData?.notes || '',
    itemName: '',
    itemQuantity: 1,
  });

  const [items, setItems] = useState(initialData?.items || []);

  const handleAddItem = () => {
    if (formData.itemName && formData.itemQuantity > 0) {
      setItems([...items, { name: formData.itemName, quantity: formData.itemQuantity }]);
      setFormData({ ...formData, itemName: '', itemQuantity: 1 });
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      trackingNumber: formData.trackingNumber,
      recipient: {
        name: formData.recipientName,
        address: formData.recipientAddress,
        phone: formData.recipientPhone,
        email: formData.recipientEmail,
      },
      items,
      status: formData.status,
      carrier: formData.carrier,
      notes: formData.notes,
      shippingDate: initialData?.shippingDate,
      deliveryDate: initialData?.deliveryDate,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {initialData ? '発送情報を編集' : '新規発送を追加'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">追跡番号</label>
              <input
                type="text"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">配送業者</label>
              <select
                value={formData.carrier}
                onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">選択してください</option>
                <option value="ヤマト運輸">ヤマト運輸</option>
                <option value="佐川急便">佐川急便</option>
                <option value="日本郵便">日本郵便</option>
                <option value="その他">その他</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">配送先情報</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">氏名</label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">住所</label>
                <input
                  type="text"
                  value={formData.recipientAddress}
                  onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">電話番号</label>
                  <input
                    type="tel"
                    value={formData.recipientPhone}
                    onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">メールアドレス（任意）</label>
                  <input
                    type="email"
                    value={formData.recipientEmail}
                    onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">商品情報</h3>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-2 text-sm text-gray-600">× {item.quantity}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="flex gap-3">
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  placeholder="商品名"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  value={formData.itemQuantity}
                  onChange={(e) => setFormData({ ...formData, itemQuantity: parseInt(e.target.value) || 1 })}
                  min="1"
                  placeholder="数量"
                  className="w-24 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  追加
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">ステータス</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ShippingStatus })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="準備中">準備中</option>
                <option value="発送済み">発送済み</option>
                <option value="配送中">配送中</option>
                <option value="配達完了">配達完了</option>
                <option value="キャンセル">キャンセル</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">備考（任意）</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={items.length === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {initialData ? '更新' : '登録'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
