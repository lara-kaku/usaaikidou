import type { Store, Book, Inventory, Subscriber, Subscription, StoreOrder, SubscriptionDelivery } from '../types/bookstore';

export const stores: Store[] = [
  {
    id: 'hq-001',
    name: '本部',
    type: 'headquarters',
    address: '大分県大分市府内町1-1-1',
    phone: '097-1234-5678',
    managerName: '山田太郎',
  },
  ...Array.from({ length: 18 }, (_, i) => {
    const storeNames = ['大分', '別府', '中津', '日田', '佐伯', '臼杵', '津久見', '竹田', '豊後高田', '杵築', '宇佐', '豊後大野', '由布', '国東', '日出', '九重', '玖珠', '姫島'];
    const addresses = [
      '大分県大分市中央町1-1-1',
      '大分県別府市駅前町1-1-2',
      '大分県中津市中央町1-1-3',
      '大分県日田市三本松1-1-4',
      '大分県佐伯市中村南町1-1-5',
      '大分県臼杵市臼杵1-1-6',
      '大分県津久見市中央町1-1-7',
      '大分県竹田市会々1-1-8',
      '大分県豊後高田市是永町1-1-9',
      '大分県杵築市南杵築1-1-10',
      '大分県宇佐市上田1-1-11',
      '大分県豊後大野市三重町1-1-12',
      '大分県由布市挾間町1-1-13',
      '大分県国東市国東町1-1-14',
      '大分県速見郡日出町1-1-15',
      '大分県玖珠郡九重町1-1-16',
      '大分県玖珠郡玖珠町1-1-17',
      '大分県東国東郡姫島村1-1-18',
    ];
    return {
      id: `store-${String(i + 1).padStart(3, '0')}`,
      name: `${storeNames[i]}店`,
      type: 'store' as const,
      address: addresses[i],
      phone: `097-${String(2000 + i).padStart(4, '0')}-${String(5678 + i).padStart(4, '0')}`,
      managerName: `店長${i + 1}`,
    };
  }),
];

export const books: Book[] = [
  {
    id: 'book-001',
    isbn: '978-4-12-345678-0',
    title: 'プログラミング入門',
    author: '田中一郎',
    publisher: '技術出版',
    price: 2800,
    category: '技術書',
  },
  {
    id: 'book-002',
    isbn: '978-4-12-345679-7',
    title: 'データベース設計の基礎',
    author: '佐藤花子',
    publisher: '技術出版',
    price: 3200,
    category: '技術書',
  },
  {
    id: 'book-003',
    isbn: '978-4-12-345680-3',
    title: '小説・夏の記憶',
    author: '鈴木次郎',
    publisher: '文芸社',
    price: 1600,
    category: '小説',
  },
  {
    id: 'book-004',
    isbn: '978-4-12-345681-0',
    title: 'ビジネスマンのための時間管理術',
    author: '高橋三郎',
    publisher: 'ビジネス出版',
    price: 1800,
    category: 'ビジネス',
  },
  {
    id: 'book-005',
    isbn: '978-4-12-345682-7',
    title: '料理の基本100',
    author: '伊藤美咲',
    publisher: '生活出版',
    price: 1400,
    category: '料理',
  },
];

export const initialInventory: Inventory[] = stores.flatMap((store) =>
  books.map((book) => ({
    id: `inv-${store.id}-${book.id}`,
    bookId: book.id,
    storeId: store.id,
    quantity: store.type === 'headquarters'
      ? Math.floor(Math.random() * 500) + 100
      : Math.floor(Math.random() * 50) + 5,
    lastUpdated: new Date(),
  }))
);

export const initialSubscribers: Subscriber[] = [
  {
    id: 'sub-001',
    name: '山本太郎',
    email: 'yamamoto@example.com',
    phone: '090-1234-5678',
    address: '大分県大分市中央町2-3-4',
    registeredStoreId: 'store-001',
    registeredDate: new Date('2024-01-15'),
    status: 'active',
  },
  {
    id: 'sub-002',
    name: '田中花子',
    email: 'tanaka@example.com',
    phone: '090-2345-6789',
    address: '大分県別府市北浜3-4-5',
    registeredStoreId: 'store-002',
    registeredDate: new Date('2024-02-20'),
    status: 'active',
  },
  {
    id: 'sub-003',
    name: '佐藤一郎',
    email: 'sato@example.com',
    phone: '090-3456-7890',
    address: '大分県中津市豊田町4-5-6',
    registeredStoreId: 'store-003',
    registeredDate: new Date('2024-03-10'),
    status: 'active',
  },
];

export const initialSubscriptions: Subscription[] = [
  {
    id: 'subscription-001',
    subscriberId: 'sub-001',
    bookId: 'book-001',
    frequency: 'monthly',
    nextDeliveryDate: new Date('2026-06-01'),
    status: 'active',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'subscription-002',
    subscriberId: 'sub-002',
    bookId: 'book-003',
    frequency: 'monthly',
    nextDeliveryDate: new Date('2026-05-25'),
    status: 'active',
    createdAt: new Date('2024-02-20'),
  },
];

export const initialOrders: StoreOrder[] = [
  {
    id: 'order-001',
    orderNumber: 'ORD-2026-001',
    fromStoreId: 'store-001',
    toStoreId: 'hq-001',
    items: [
      { bookId: 'book-001', quantity: 10 },
      { bookId: 'book-002', quantity: 5 },
    ],
    status: 'approved',
    requestedDate: new Date('2026-05-01'),
    approvedDate: new Date('2026-05-02'),
    notes: '在庫補充のため',
  },
  {
    id: 'order-002',
    orderNumber: 'ORD-2026-002',
    fromStoreId: 'store-002',
    toStoreId: 'hq-001',
    items: [
      { bookId: 'book-003', quantity: 15 },
    ],
    status: 'pending',
    requestedDate: new Date('2026-05-08'),
    notes: '人気商品の追加発注',
  },
];

export const initialDeliveries: SubscriptionDelivery[] = [
  {
    id: 'delivery-001',
    subscriptionId: 'subscription-001',
    subscriberId: 'sub-001',
    bookId: 'book-001',
    scheduledDate: new Date('2026-05-01'),
    shippedDate: new Date('2026-05-01'),
    deliveredDate: new Date('2026-05-03'),
    trackingNumber: '1234-5678-9012',
    carrier: 'ヤマト運輸',
    status: 'delivered',
  },
  {
    id: 'delivery-002',
    subscriptionId: 'subscription-002',
    subscriberId: 'sub-002',
    bookId: 'book-003',
    scheduledDate: new Date('2026-05-25'),
    status: 'scheduled',
  },
];
