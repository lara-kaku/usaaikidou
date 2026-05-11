import { useState, useMemo } from 'react';
import { Calendar, Package, Truck, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import type { SubscriptionDelivery, Subscriber, Book, Subscription } from '../types/bookstore';

interface DeliveryScheduleProps {
  deliveries: SubscriptionDelivery[];
  subscribers: Subscriber[];
  subscriptions: Subscription[];
  books: Book[];
  onUpdateDeliveryStatus: (
    deliveryId: string,
    status: SubscriptionDelivery['status'],
    data?: { trackingNumber?: string; carrier?: string; date?: Date }
  ) => void;
}

const statusConfig = {
  scheduled: { icon: <Clock className="w-4 h-4" />, color: 'text-gray-700', bgColor: 'bg-gray-100', label: '予定' },
  preparing: { icon: <Package className="w-4 h-4" />, color: 'text-yellow-700', bgColor: 'bg-yellow-100', label: '準備中' },
  shipped: { icon: <Truck className="w-4 h-4" />, color: 'text-blue-700', bgColor: 'bg-blue-100', label: '発送済み' },
  delivered: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-700', bgColor: 'bg-green-100', label: '配達完了' },
  failed: { icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-700', bgColor: 'bg-red-100', label: '配達失敗' },
};

export function DeliverySchedule({
  deliveries,
  subscribers,
  subscriptions,
  books,
  onUpdateDeliveryStatus,
}: DeliveryScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showShipForm, setShowShipForm] = useState<string | null>(null);
  const [shipFormData, setShipFormData] = useState({ trackingNumber: '', carrier: 'ヤマト運輸' });

  const getSubscriberById = (id: string) => subscribers.find((s) => s.id === id);
  const getBookById = (id: string) => books.find((b) => b.id === id);

  const dateOptions = useMemo(() => {
    const dates = new Set<string>();
    deliveries.forEach((d) => {
      dates.add(new Date(d.scheduledDate).toLocaleDateString('ja-JP'));
    });
    return Array.from(dates).sort();
  }, [deliveries]);

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((delivery) => {
      const matchesDate =
        selectedDate === 'all' ||
        new Date(delivery.scheduledDate).toLocaleDateString('ja-JP') === selectedDate;
      const matchesStatus = selectedStatus === 'all' || delivery.status === selectedStatus;
      return matchesDate && matchesStatus;
    });
  }, [deliveries, selectedDate, selectedStatus]);

  const sortedDeliveries = useMemo(() => {
    return [...filteredDeliveries].sort((a, b) => {
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    });
  }, [filteredDeliveries]);

  const upcomingDeliveries = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return deliveries.filter((d) => {
      const scheduleDate = new Date(d.scheduledDate);
      return scheduleDate >= today && scheduleDate <= nextWeek && d.status === 'scheduled';
    }).length;
  }, [deliveries]);

  const handleShip = (deliveryId: string) => {
    if (shipFormData.trackingNumber && shipFormData.carrier) {
      onUpdateDeliveryStatus(deliveryId, 'shipped', {
        trackingNumber: shipFormData.trackingNumber,
        carrier: shipFormData.carrier,
        date: new Date(),
      });
      setShowShipForm(null);
      setShipFormData({ trackingNumber: '', carrier: 'ヤマト運輸' });
    }
  };

  const statusCounts = useMemo(() => {
    const counts = {
      all: deliveries.length,
      scheduled: 0,
      preparing: 0,
      shipped: 0,
      delivered: 0,
      failed: 0,
    };
    deliveries.forEach((d) => {
      counts[d.status]++;
    });
    return counts;
  }, [deliveries]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">配送スケジュール</h2>
          <p className="text-sm text-gray-600 mt-1">
            今後7日間の配送予定: <span className="font-bold text-blue-600">{upcomingDeliveries}件</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {(['scheduled', 'preparing', 'shipped', 'delivered', 'failed'] as const).map((status) => {
          const config = statusConfig[status];
          return (
            <div
              key={status}
              className={`bg-white rounded-lg border p-4 cursor-pointer transition-all ${
                selectedStatus === status ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedStatus(selectedStatus === status ? 'all' : status)}
            >
              <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs ${config.bgColor} ${config.color} mb-2`}>
                {config.icon}
                {config.label}
              </div>
              <div className="text-2xl font-bold text-gray-900">{statusCounts[status]}</div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4">
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="all">すべての日付</option>
          {dateOptions.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>

        {selectedStatus !== 'all' && (
          <button
            onClick={() => setSelectedStatus('all')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            フィルタをクリア
          </button>
        )}
      </div>

      <div className="space-y-4">
        {sortedDeliveries.map((delivery) => {
          const subscriber = getSubscriberById(delivery.subscriberId);
          const book = getBookById(delivery.bookId);
          const config = statusConfig[delivery.status];
          const isOverdue =
            delivery.status === 'scheduled' &&
            new Date(delivery.scheduledDate) < new Date();

          return (
            <div
              key={delivery.id}
              className={`bg-white rounded-lg border shadow-sm ${isOverdue ? 'border-red-300' : ''}`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
                        {config.icon}
                        {config.label}
                      </span>
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          遅延
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg">{subscriber?.name}</h3>
                    <p className="text-sm text-gray-600">{subscriber?.address}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">配送予定日</div>
                    <div className="font-bold">
                      {new Date(delivery.scheduledDate).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">配送書籍</div>
                    <div className="font-medium">{book?.title}</div>
                    <div className="text-sm text-gray-600">{book?.author}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">連絡先</div>
                    <div className="text-sm">📞 {subscriber?.phone}</div>
                    <div className="text-sm">📧 {subscriber?.email}</div>
                  </div>
                </div>

                {delivery.trackingNumber && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">追跡番号:</span>
                        <span className="ml-2 font-mono font-medium">{delivery.trackingNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">配送業者:</span>
                        <span className="ml-2 font-medium">{delivery.carrier}</span>
                      </div>
                    </div>
                  </div>
                )}

                {delivery.notes && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium">備考:</span> {delivery.notes}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {delivery.status === 'scheduled' && (
                    <button
                      onClick={() => onUpdateDeliveryStatus(delivery.id, 'preparing')}
                      className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700"
                    >
                      準備開始
                    </button>
                  )}
                  {delivery.status === 'preparing' && (
                    <>
                      {showShipForm === delivery.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={shipFormData.trackingNumber}
                            onChange={(e) =>
                              setShipFormData({ ...shipFormData, trackingNumber: e.target.value })
                            }
                            placeholder="追跡番号"
                            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                          <select
                            value={shipFormData.carrier}
                            onChange={(e) =>
                              setShipFormData({ ...shipFormData, carrier: e.target.value })
                            }
                            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="ヤマト運輸">ヤマト運輸</option>
                            <option value="佐川急便">佐川急便</option>
                            <option value="日本郵便">日本郵便</option>
                          </select>
                          <button
                            onClick={() => handleShip(delivery.id)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                          >
                            発送
                          </button>
                          <button
                            onClick={() => setShowShipForm(null)}
                            className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50"
                          >
                            キャンセル
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowShipForm(delivery.id)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          発送処理
                        </button>
                      )}
                    </>
                  )}
                  {delivery.status === 'shipped' && (
                    <button
                      onClick={() =>
                        onUpdateDeliveryStatus(delivery.id, 'delivered', { date: new Date() })
                      }
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                      配達完了
                    </button>
                  )}
                  {(delivery.status === 'scheduled' || delivery.status === 'preparing') && (
                    <button
                      onClick={() => onUpdateDeliveryStatus(delivery.id, 'failed')}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                    >
                      配達失敗
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedDeliveries.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>該当する配送予定がありません</p>
        </div>
      )}
    </div>
  );
}
