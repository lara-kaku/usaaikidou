import { useState } from 'react';
import { UserPlus, Calendar, Package, X, Edit2, Trash2 } from 'lucide-react';
import type { Subscriber, Subscription, Book, Store } from '../types/bookstore';

interface SubscriptionManagementProps {
  subscribers: Subscriber[];
  subscriptions: Subscription[];
  books: Book[];
  stores: Store[];
  currentStoreId: string;
  onAddSubscriber: (subscriber: Omit<Subscriber, 'id' | 'registeredDate'>) => void;
  onAddSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt'>) => void;
  onUpdateSubscription: (id: string, status: Subscription['status']) => void;
  onDeleteSubscriber: (id: string) => void;
}

export function SubscriptionManagement({
  subscribers,
  subscriptions,
  books,
  stores,
  currentStoreId,
  onAddSubscriber,
  onAddSubscription,
  onUpdateSubscription,
  onDeleteSubscriber,
}: SubscriptionManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [subscriptionFormData, setSubscriptionFormData] = useState({
    bookId: '',
    frequency: 'monthly' as 'weekly' | 'monthly' | 'quarterly',
  });

  const currentStore = stores.find((s) => s.id === currentStoreId);
  const isHeadquarters = currentStore?.type === 'headquarters';

  const filteredSubscribers = isHeadquarters
    ? subscribers
    : subscribers.filter((s) => s.registeredStoreId === currentStoreId);

  const getSubscriberSubscriptions = (subscriberId: string) => {
    return subscriptions.filter((sub) => sub.subscriberId === subscriberId);
  };

  const getBookById = (bookId: string) => {
    return books.find((b) => b.id === bookId);
  };

  const getStoreById = (storeId: string) => {
    return stores.find((s) => s.id === storeId);
  };

  const handleAddSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSubscriber({
      ...formData,
      registeredStoreId: currentStoreId,
      status: 'active',
    });
    setFormData({ name: '', email: '', phone: '', address: '' });
    setShowAddForm(false);
  };

  const handleAddSubscription = (e: React.FormEvent, subscriberId: string) => {
    e.preventDefault();
    const nextDelivery = new Date();
    if (subscriptionFormData.frequency === 'weekly') {
      nextDelivery.setDate(nextDelivery.getDate() + 7);
    } else if (subscriptionFormData.frequency === 'monthly') {
      nextDelivery.setMonth(nextDelivery.getMonth() + 1);
    } else {
      nextDelivery.setMonth(nextDelivery.getMonth() + 3);
    }

    onAddSubscription({
      subscriberId,
      bookId: subscriptionFormData.bookId,
      frequency: subscriptionFormData.frequency,
      nextDeliveryDate: nextDelivery,
      status: 'active',
    });
    setSubscriptionFormData({ bookId: '', frequency: 'monthly' });
    setShowSubscriptionForm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">定期購読管理</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          新規購読者登録
        </button>
      </div>

      <div className="grid gap-4">
        {filteredSubscribers.map((subscriber) => {
          const subs = getSubscriberSubscriptions(subscriber.id);
          const registeredStore = getStoreById(subscriber.registeredStoreId);

          return (
            <div key={subscriber.id} className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{subscriber.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          subscriber.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : subscriber.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {subscriber.status === 'active' ? '有効' : subscriber.status === 'paused' ? '一時停止' : 'キャンセル'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📧 {subscriber.email} | 📞 {subscriber.phone}</p>
                      <p>📍 {subscriber.address}</p>
                      <p>🏪 登録店舗: {registeredStore?.name}</p>
                      <p className="text-xs text-gray-500">
                        登録日: {new Date(subscriber.registeredDate).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteSubscriber(subscriber.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    定期購読書籍
                  </h4>
                  <button
                    onClick={() => setShowSubscriptionForm(subscriber.id)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + 購読追加
                  </button>
                </div>

                {showSubscriptionForm === subscriber.id && (
                  <form
                    onSubmit={(e) => handleAddSubscription(e, subscriber.id)}
                    className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select
                        value={subscriptionFormData.bookId}
                        onChange={(e) =>
                          setSubscriptionFormData({ ...subscriptionFormData, bookId: e.target.value })
                        }
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">書籍を選択</option>
                        {books.map((book) => (
                          <option key={book.id} value={book.id}>
                            {book.title} - {book.author}
                          </option>
                        ))}
                      </select>
                      <select
                        value={subscriptionFormData.frequency}
                        onChange={(e) =>
                          setSubscriptionFormData({
                            ...subscriptionFormData,
                            frequency: e.target.value as any,
                          })
                        }
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="weekly">週次</option>
                        <option value="monthly">月次</option>
                        <option value="quarterly">四半期</option>
                      </select>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        追加
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSubscriptionForm(null)}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        キャンセル
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {subs.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">定期購読なし</p>
                  ) : (
                    subs.map((sub) => {
                      const book = getBookById(sub.bookId);
                      return (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{book?.title}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              {sub.frequency === 'weekly' ? '週次' : sub.frequency === 'monthly' ? '月次' : '四半期'} |
                              次回配送: {new Date(sub.nextDeliveryDate).toLocaleDateString('ja-JP')}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                sub.status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : sub.status === 'paused'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {sub.status === 'active' ? '有効' : sub.status === 'paused' ? '一時停止' : 'キャンセル'}
                            </span>
                            {sub.status === 'active' && (
                              <button
                                onClick={() => onUpdateSubscription(sub.id, 'paused')}
                                className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
                              >
                                一時停止
                              </button>
                            )}
                            {sub.status === 'paused' && (
                              <button
                                onClick={() => onUpdateSubscription(sub.id, 'active')}
                                className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
                              >
                                再開
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSubscribers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <UserPlus className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>購読者データがありません</p>
          <p className="text-sm mt-2">右上のボタンから新規登録してください</p>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">新規購読者登録</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubscriber} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">氏名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">メールアドレス</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">電話番号</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">住所</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  登録
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
