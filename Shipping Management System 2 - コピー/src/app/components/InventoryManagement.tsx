import { useState, useMemo } from 'react';
import { Search, Package, AlertTriangle } from 'lucide-react';
import type { Book, Inventory, Store } from '../types/bookstore';

interface InventoryManagementProps {
  inventory: Inventory[];
  books: Book[];
  stores: Store[];
  currentStoreId: string;
  onUpdateInventory: (inventoryId: string, newQuantity: number) => void;
}

export function InventoryManagement({
  inventory,
  books,
  stores,
  currentStoreId,
  onUpdateInventory,
}: InventoryManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  const currentStore = stores.find((s) => s.id === currentStoreId);
  const isHeadquarters = currentStore?.type === 'headquarters';

  const filteredBooks = useMemo(() => {
    return books.filter(
      (book) =>
        searchQuery === '' ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.includes(searchQuery)
    );
  }, [books, searchQuery]);

  const getInventoryByBook = (bookId: string) => {
    return inventory.filter((inv) => inv.bookId === bookId);
  };

  const getStoreInventory = (bookId: string, storeId: string) => {
    return inventory.find((inv) => inv.bookId === bookId && inv.storeId === storeId);
  };

  const getTotalStock = (bookId: string) => {
    return inventory
      .filter((inv) => inv.bookId === bookId)
      .reduce((sum, inv) => sum + inv.quantity, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">在庫管理</h2>
        <div className="text-sm text-gray-600">
          現在の拠点: <span className="font-medium">{currentStore?.name}</span>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="書籍名、著者、ISBNで検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid gap-4">
        {filteredBooks.map((book) => {
          const bookInventory = getInventoryByBook(book.id);
          const currentStoreStock = getStoreInventory(book.id, currentStoreId);
          const totalStock = getTotalStock(book.id);
          const isExpanded = selectedBook === book.id;
          const isLowStock = currentStoreStock && currentStoreStock.quantity < 10;

          return (
            <div key={book.id} className="bg-white rounded-lg border shadow-sm">
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedBook(isExpanded ? null : book.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{book.title}</h3>
                      {isLowStock && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          在庫少
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>著者: {book.author} | 出版社: {book.publisher}</p>
                      <p>ISBN: {book.isbn} | カテゴリ: {book.category}</p>
                      <p className="font-medium">価格: ¥{book.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {currentStoreStock?.quantity || 0}
                    </div>
                    <div className="text-sm text-gray-500">当店在庫</div>
                    {isHeadquarters && (
                      <div className="text-sm text-gray-500 mt-1">
                        全体: {totalStock}冊
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && isHeadquarters && (
                <div className="border-t p-4 bg-gray-50">
                  <h4 className="font-medium mb-3">全店舗在庫状況</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stores.map((store) => {
                      const storeStock = getStoreInventory(book.id, store.id);
                      return (
                        <div
                          key={store.id}
                          className="bg-white p-3 rounded border flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-sm">{store.name}</div>
                            <div className="text-xs text-gray-500">{store.type === 'headquarters' ? '本部' : '店舗'}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="font-bold">{storeStock?.quantity || 0}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isExpanded && !isHeadquarters && (
                <div className="border-t p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">在庫数を更新:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={currentStoreStock?.quantity || 0}
                        onChange={(e) => {
                          if (currentStoreStock) {
                            onUpdateInventory(currentStoreStock.id, parseInt(e.target.value) || 0);
                          }
                        }}
                        className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-sm text-gray-600">冊</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>該当する書籍が見つかりません</p>
        </div>
      )}
    </div>
  );
}
