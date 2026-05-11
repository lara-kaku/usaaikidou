import { useState } from 'react';
import { Plus, ShoppingCart, CheckCircle, XCircle, Clock, Package as PackageIcon, Truck } from 'lucide-react';
import type { StoreOrder, OrderStatus, Book, Store, Inventory } from '../types/bookstore';

interface OrderManagementProps {
  orders: StoreOrder[];
  books: Book[];
  stores: Store[];
  inventory: Inventory[];
  currentStoreId: string;
  onCreateOrder: (order: Omit<StoreOrder, 'id' | 'orderNumber' | 'requestedDate'>) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, date?: Date) => void;
}

const statusConfig: Record<OrderStatus, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
  pending: { icon: <Clock className="w-5 h-5" />, color: 'text-yellow-700', bgColor: 'bg-yellow-100', label: '承認待ち' },
  approved: { icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-700', bgColor: 'bg-green-100', label: '承認済み' },
  shipped: { icon: <Truck className="w-5 h-5" />, color: 'text-blue-700', bgColor: 'bg-blue-100', label: '発送済み' },
  received: { icon: <PackageIcon className="w-5 h-5" />, color: 'text-purple-700', bgColor: 'bg-purple-100', label: '受領済み' },
  cancelled: { icon: <XCircle className="w-5 h-5" />, color: 'text-red-700', bgColor: 'bg-red-100', label: 'キャンセル' },
};

export function OrderManagement({
  orders,
  books,
  stores,
  inventory,
  currentStoreId,
  onCreateOrder,
  onUpdateOrderStatus,
}: OrderManagementProps) {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderItems, setOrderItems] = useState<{ bookId: string; quantity: number }[]>([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const currentStore = stores.find((s) => s.id === currentStoreId);
  const isHeadquarters = currentStore?.type === 'headquarters';
  const headquarters = stores.find((s) => s.type === 'headquarters');

  const filteredOrders = isHeadquarters
    ? orders
    : orders.filter((o) => o.fromStoreId === currentStoreId);

  const getBookById = (bookId: string) => books.find((b) => b.id === bookId);
  const getStoreById = (storeId: string) => stores.find((s) => s.id === storeId);

  const getHQInventory = (bookId: string) => {
    return inventory.find((inv) => inv.bookId === bookId && inv.storeId === headquarters?.id);
  };

  const handleAddItem = () => {
    if (selectedBookId && quantity > 0) {
      const existing = orderItems.find((item) => item.bookId === selectedBookId);
      if (existing) {
        setOrderItems(
          orderItems.map((item) =>
            item.bookId === selectedBookId ? { ...item, quantity: item.quantity + quantity } : item
          )
        );
      } else {
        setOrderItems([...orderItems, { bookId: selectedBookId, quantity }]);
      }
      setSelectedBookId('');
      setQuantity(1);
    }
  };

  const handleRemoveItem = (bookId: string) => {
    setOrderItems(orderItems.filter((item) => item.bookId !== bookId));
  };

  const handleSubmitOrder = () => {
    if (orderItems.length > 0 && headquarters) {
      onCreateOrder({
        fromStoreId: currentStoreId,
        toStoreId: headquarters.id,
        items: orderItems,
        status: 'pending',
        notes,
      });
      setOrderItems([]);
      setNotes('');
      setShowOrderForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {isHeadquarters ? '発注管理（本部）' : '発注管理'}
        </h2>
        {!isHeadquarters && (
          <button
            onClick={() => setShowOrderForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            新規発注
          </button>
        )}
      </div>

      {showOrderForm && (
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">新規発注作成</h3>

          <div className="space-y-4">
            <div className="flex gap-3">
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">書籍を選択</option>
                {books.map((book) => {
                  const hqStock = getHQInventory(book.id);
                  return (
                    <option key={book.id} value={book.id}>
                      {book.title} - {book.author} (本部在庫: {hqStock?.quantity || 0})
                    </option>
                  );
                })}
              </select>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-24 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="数量"
              />
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                追加
              </button>
            </div>

            {orderItems.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">発注内容</h4>
                <div className="space-y-2">
                  {orderItems.map((item) => {
                    const book = getBookById(item.bookId);
                    return (
                      <div
                        key={item.bookId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{book?.title}</div>
                          <div className="text-sm text-gray-600">
                            {item.quantity}冊 × ¥{book?.price.toLocaleString()} = ¥
                            {((book?.price || 0) * item.quantity).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.bookId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t text-right">
                  <span className="font-bold text-lg">
                    合計: ¥
                    {orderItems
                      .reduce((sum, item) => {
                        const book = getBookById(item.bookId);
                        return sum + (book?.price || 0) * item.quantity;
                      }, 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">備考</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="発注に関する備考を入力..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitOrder}
                disabled={orderItems.length === 0}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                発注を送信
              </button>
              <button
                onClick={() => {
                  setShowOrderForm(false);
                  setOrderItems([]);
                  setNotes('');
                }}
                className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const fromStore = getStoreById(order.fromStoreId);
          const statusInfo = statusConfig[order.status];

          return (
            <div key={order.id} className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>発注元: {fromStore?.name}</p>
                      <p>発注日: {new Date(order.requestedDate).toLocaleDateString('ja-JP')}</p>
                      {order.approvedDate && (
                        <p>承認日: {new Date(order.approvedDate).toLocaleDateString('ja-JP')}</p>
                      )}
                      {order.shippedDate && (
                        <p>発送日: {new Date(order.shippedDate).toLocaleDateString('ja-JP')}</p>
                      )}
                      {order.receivedDate && (
                        <p>受領日: {new Date(order.receivedDate).toLocaleDateString('ja-JP')}</p>
                      )}
                    </div>
                  </div>
                  {isHeadquarters && (
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'approved', new Date())}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                          >
                            承認
                          </button>
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'cancelled')}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                          >
                            却下
                          </button>
                        </>
                      )}
                      {order.status === 'approved' && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'shipped', new Date())}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          発送完了
                        </button>
                      )}
                    </div>
                  )}
                  {!isHeadquarters && order.status === 'shipped' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'received', new Date())}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                    >
                      受領確認
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-medium mb-3">発注商品</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => {
                    const book = getBookById(item.bookId);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{book?.title}</div>
                          <div className="text-sm text-gray-600">{book?.author}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{item.quantity}冊</div>
                          <div className="text-sm text-gray-600">
                            ¥{((book?.price || 0) * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {order.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">備考:</span> {order.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>発注データがありません</p>
          {!isHeadquarters && (
            <p className="text-sm mt-2">右上のボタンから新規発注を作成してください</p>
          )}
        </div>
      )}
    </div>
  );
}
