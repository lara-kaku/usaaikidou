import { useState } from 'react';
import { Building2, Store as StoreIcon, Package, Users, ShoppingCart, Calendar } from 'lucide-react';
import { InventoryManagement } from './components/InventoryManagement';
import { SubscriptionManagement } from './components/SubscriptionManagement';
import { OrderManagement } from './components/OrderManagement';
import { DeliverySchedule } from './components/DeliverySchedule';
import { stores, books, initialInventory, initialSubscribers, initialSubscriptions, initialOrders, initialDeliveries } from './data/mockData';
import type { Store, Inventory, Subscriber, Subscription, StoreOrder, SubscriptionDelivery, OrderStatus } from './types/bookstore';

type TabType = 'inventory' | 'subscriptions' | 'orders' | 'deliveries';

export default function App() {
  const [currentStoreId, setCurrentStoreId] = useState('hq-001');
  const [activeTab, setActiveTab] = useState<TabType>('inventory');
  const [inventory, setInventory] = useState<Inventory[]>(initialInventory);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [orders, setOrders] = useState<StoreOrder[]>(initialOrders);
  const [deliveries, setDeliveries] = useState<SubscriptionDelivery[]>(initialDeliveries);

  const currentStore = stores.find((s) => s.id === currentStoreId);
  const isHeadquarters = currentStore?.type === 'headquarters';

  const handleUpdateInventory = (inventoryId: string, newQuantity: number) => {
    setInventory(
      inventory.map((inv) =>
        inv.id === inventoryId ? { ...inv, quantity: newQuantity, lastUpdated: new Date() } : inv
      )
    );
  };

  const handleAddSubscriber = (data: Omit<Subscriber, 'id' | 'registeredDate'>) => {
    const newSubscriber: Subscriber = {
      ...data,
      id: `sub-${Date.now()}`,
      registeredDate: new Date(),
    };
    setSubscribers([...subscribers, newSubscriber]);
  };

  const handleAddSubscription = (data: Omit<Subscription, 'id' | 'createdAt'>) => {
    const newSubscription: Subscription = {
      ...data,
      id: `subscription-${Date.now()}`,
      createdAt: new Date(),
    };
    setSubscriptions([...subscriptions, newSubscription]);

    const newDelivery: SubscriptionDelivery = {
      id: `delivery-${Date.now()}`,
      subscriptionId: newSubscription.id,
      subscriberId: data.subscriberId,
      bookId: data.bookId,
      scheduledDate: data.nextDeliveryDate,
      status: 'scheduled',
    };
    setDeliveries([...deliveries, newDelivery]);
  };

  const handleUpdateSubscription = (id: string, status: Subscription['status']) => {
    setSubscriptions(
      subscriptions.map((sub) => (sub.id === id ? { ...sub, status } : sub))
    );
  };

  const handleDeleteSubscriber = (id: string) => {
    if (confirm('この購読者を削除しますか？関連する定期購読も削除されます。')) {
      setSubscribers(subscribers.filter((s) => s.id !== id));
      setSubscriptions(subscriptions.filter((sub) => sub.subscriberId !== id));
      setDeliveries(deliveries.filter((d) => d.subscriberId !== id));
    }
  };

  const handleCreateOrder = (data: Omit<StoreOrder, 'id' | 'orderNumber' | 'requestedDate'>) => {
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
    const newOrder: StoreOrder = {
      ...data,
      id: `order-${Date.now()}`,
      orderNumber,
      requestedDate: new Date(),
    };
    setOrders([...orders, newOrder]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus, date?: Date) => {
    setOrders(
      orders.map((order) => {
        if (order.id !== orderId) return order;

        const updates: Partial<StoreOrder> = { status };
        if (status === 'approved') updates.approvedDate = date;
        if (status === 'shipped') updates.shippedDate = date;
        if (status === 'received') updates.receivedDate = date;

        return { ...order, ...updates };
      })
    );

    if (status === 'received') {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setInventory(
          inventory.map((inv) => {
            const orderItem = order.items.find((item) => item.bookId === inv.bookId);
            if (orderItem && inv.storeId === order.fromStoreId) {
              return {
                ...inv,
                quantity: inv.quantity + orderItem.quantity,
                lastUpdated: new Date(),
              };
            }
            return inv;
          })
        );
      }
    }
  };

  const handleUpdateDeliveryStatus = (
    deliveryId: string,
    status: SubscriptionDelivery['status'],
    data?: { trackingNumber?: string; carrier?: string; date?: Date }
  ) => {
    setDeliveries(
      deliveries.map((delivery) => {
        if (delivery.id !== deliveryId) return delivery;

        const updates: Partial<SubscriptionDelivery> = { status };
        if (data?.trackingNumber) updates.trackingNumber = data.trackingNumber;
        if (data?.carrier) updates.carrier = data.carrier;
        if (status === 'shipped') updates.shippedDate = data?.date || new Date();
        if (status === 'delivered') updates.deliveredDate = data?.date || new Date();

        return { ...delivery, ...updates };
      })
    );
  };

  const tabs = [
    { id: 'inventory' as TabType, label: '在庫管理', icon: <Package className="w-5 h-5" />, show: true },
    { id: 'subscriptions' as TabType, label: '定期購読管理', icon: <Users className="w-5 h-5" />, show: true },
    { id: 'orders' as TabType, label: '発注管理', icon: <ShoppingCart className="w-5 h-5" />, show: true },
    { id: 'deliveries' as TabType, label: '配送スケジュール', icon: <Calendar className="w-5 h-5" />, show: isHeadquarters },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {isHeadquarters ? (
                <Building2 className="w-8 h-8 text-blue-600" />
              ) : (
                <StoreIcon className="w-8 h-8 text-green-600" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">書店発送・在庫管理システム</h1>
                <p className="text-sm text-gray-600">{currentStore?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">拠点切替:</label>
              <select
                value={currentStoreId}
                onChange={(e) => setCurrentStoreId(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <optgroup label="本部">
                  {stores
                    .filter((s) => s.type === 'headquarters')
                    .map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="店舗">
                  {stores
                    .filter((s) => s.type === 'store')
                    .map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {tabs.filter((tab) => tab.show).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'inventory' && (
          <InventoryManagement
            inventory={inventory}
            books={books}
            stores={stores}
            currentStoreId={currentStoreId}
            onUpdateInventory={handleUpdateInventory}
          />
        )}
        {activeTab === 'subscriptions' && (
          <SubscriptionManagement
            subscribers={subscribers}
            subscriptions={subscriptions}
            books={books}
            stores={stores}
            currentStoreId={currentStoreId}
            onAddSubscriber={handleAddSubscriber}
            onAddSubscription={handleAddSubscription}
            onUpdateSubscription={handleUpdateSubscription}
            onDeleteSubscriber={handleDeleteSubscriber}
          />
        )}
        {activeTab === 'orders' && (
          <OrderManagement
            orders={orders}
            books={books}
            stores={stores}
            inventory={inventory}
            currentStoreId={currentStoreId}
            onCreateOrder={handleCreateOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}
        {activeTab === 'deliveries' && isHeadquarters && (
          <DeliverySchedule
            deliveries={deliveries}
            subscribers={subscribers}
            subscriptions={subscriptions}
            books={books}
            onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
          />
        )}
      </main>
    </div>
  );
}