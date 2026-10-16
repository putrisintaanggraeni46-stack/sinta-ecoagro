import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, Order, Customer, OrderStatus, StockMutation, UserAccount } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const CUSTOMERS_COLLECTION = 'customers';
const USERS_COLLECTION = 'users';
const STOCK_MUTATIONS_COLLECTION = 'stock_mutations';

/**
 * Recursively cleans any undefined values from an object or array,
 * replacing them with empty strings or removing them,
 * because Firestore addDoc / setDoc / updateDoc rejects `undefined`.
 */
export function sanitizeFirestoreData<T>(obj: T): T {
  if (obj === undefined) {
    return '' as unknown as T;
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeFirestoreData(item)) as unknown as T;
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      clean[key] = '';
    } else if (value !== null && typeof value === 'object') {
      clean[key] = sanitizeFirestoreData(value);
    } else {
      clean[key] = value;
    }
  }
  return clean as T;
}

// Seed 50 initial products if database collection has fewer than 40 items
export async function seedInitialProducts(force = false): Promise<void> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const existingSnap = await getDocs(productsRef);

    if (existingSnap.empty || existingSnap.size < 40 || force) {
      const batch = writeBatch(db);

      // If force reset or upgrading from old products
      if ((force || existingSnap.size < 40) && !existingSnap.empty) {
        existingSnap.docs.forEach((docItem) => {
          batch.delete(docItem.ref);
        });
      }

      // Add all 50 initial products
      INITIAL_PRODUCTS.forEach((item, index) => {
        const id = `eco-prod-${index + 1}`;
        const itemRef = doc(db, PRODUCTS_COLLECTION, id);
        batch.set(itemRef, {
          ...item,
          minStockAlert: 10,
          id,
        });
      });

      await batch.commit();
      console.log('Seeded 50 EcoAgro agricultural products successfully');
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, PRODUCTS_COLLECTION);
  }
}

// Subscribe to Products list in real-time
export function subscribeToProducts(
  onSuccess: (products: Product[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const products: Product[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || '',
          category: data.category || 'Benih & Bibit Unggul',
          price: Number(data.price) || 0,
          buyPrice: Number(data.buyPrice) || 0,
          profitRatio: Number(data.profitRatio) || 0,
          sku: data.sku || '',
          stock: Number(data.stock) || 0,
          minStockAlert: Number(data.minStockAlert) || 10,
          unit: data.unit || 'Pcs',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          rating: Number(data.rating) || 5,
          soldCount: Number(data.soldCount) || 0,
          featured: Boolean(data.featured),
          createdAt: data.createdAt || new Date().toISOString(),
        } as Product;
      });

      products.sort((a, b) => a.name.localeCompare(b.name));
      onSuccess(products);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, PRODUCTS_COLLECTION);
    }
  );
}

// Add or edit product
export async function saveProduct(product: Partial<Product> & { id?: string }): Promise<string> {
  try {
    const rawData = {
      name: product.name,
      category: product.category,
      price: Number(product.price) || 0,
      buyPrice: Number(product.buyPrice) || 0,
      profitRatio: Number(product.profitRatio) || 0,
      sku: product.sku || '',
      stock: Number(product.stock) || 0,
      minStockAlert: Number(product.minStockAlert || 10),
      unit: product.unit || 'Pcs',
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      featured: Boolean(product.featured),
      rating: Number(product.rating || 5),
      soldCount: Number(product.soldCount || 0),
    };

    const sanitizedData = sanitizeFirestoreData(rawData);

    if (product.id) {
      const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
      await updateDoc(docRef, sanitizedData);
      return product.id;
    } else {
      const newDocRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
        ...sanitizedData,
        createdAt: new Date().toISOString(),
      });
      return newDocRef.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, PRODUCTS_COLLECTION);
  }
}

// Batch update product pricing and profit ratios
export async function batchUpdatePricing(
  updates: { id: string; price: number; buyPrice?: number; profitRatio?: number }[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const u of updates) {
      const docRef = doc(db, PRODUCTS_COLLECTION, u.id);
      const updateData: Record<string, any> = {
        price: Number(u.price) || 0,
      };
      if (u.buyPrice !== undefined) updateData.buyPrice = Number(u.buyPrice) || 0;
      if (u.profitRatio !== undefined) updateData.profitRatio = Number(u.profitRatio) || 0;
      batch.update(docRef, sanitizeFirestoreData(updateData));
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, PRODUCTS_COLLECTION);
  }
}

// Update single product stock
export async function updateProductStock(productId: string, newStock: number): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, {
      stock: Math.max(0, newStock),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PRODUCTS_COLLECTION}/${productId}`);
  }
}

// Delete product
export async function deleteProduct(productId: string): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PRODUCTS_COLLECTION}/${productId}`);
  }
}

// Stock Mutation Management (Inventory Gudang)
export async function addStockMutation(mutation: Omit<StockMutation, 'id' | 'createdAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, STOCK_MUTATIONS_COLLECTION), {
      ...mutation,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, STOCK_MUTATIONS_COLLECTION);
  }
}

// Add Supplier Stock (Stok Masuk dari Supplier)
export async function addSupplierStock(
  productId: string, 
  productName: string, 
  quantityToAdd: number, 
  supplierName: string, 
  notes?: string
): Promise<void> {
  try {
    const prodRef = doc(db, PRODUCTS_COLLECTION, productId);
    let previousStock = 0;
    let newStock = 0;

    await runTransaction(db, async (transaction) => {
      const prodSnap = await transaction.get(prodRef);
      if (!prodSnap.exists()) {
        throw new Error('Produk tidak ditemukan');
      }
      previousStock = Number(prodSnap.data().stock) || 0;
      newStock = previousStock + quantityToAdd;
      transaction.update(prodRef, { stock: newStock });
    });

    // Record mutation document
    await addDoc(collection(db, STOCK_MUTATIONS_COLLECTION), {
      productId,
      productName,
      type: 'in',
      quantity: quantityToAdd,
      previousStock,
      newStock,
      supplierName: supplierName || 'Supplier Pertanian Resmi',
      reason: notes || `Penerimaan Barang Masuk: ${supplierName}`,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, STOCK_MUTATIONS_COLLECTION);
  }
}

// Manual Opname / Stock Adjustment
export async function adjustStockWithMutation(
  productId: string,
  productName: string,
  targetNewStock: number,
  reason: string
): Promise<void> {
  try {
    const prodRef = doc(db, PRODUCTS_COLLECTION, productId);
    let previousStock = 0;

    await runTransaction(db, async (transaction) => {
      const prodSnap = await transaction.get(prodRef);
      if (!prodSnap.exists()) throw new Error('Produk tidak ditemukan');
      previousStock = Number(prodSnap.data().stock) || 0;
      transaction.update(prodRef, { stock: Math.max(0, targetNewStock) });
    });

    const diff = targetNewStock - previousStock;
    await addDoc(collection(db, STOCK_MUTATIONS_COLLECTION), {
      productId,
      productName,
      type: diff >= 0 ? 'in' : 'out',
      quantity: Math.abs(diff),
      previousStock,
      newStock: Math.max(0, targetNewStock),
      reason: reason || 'Stock Opname Fisik Gudang',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, STOCK_MUTATIONS_COLLECTION);
  }
}

// Subscribe to Stock Mutations in real-time
export function subscribeToStockMutations(
  onSuccess: (mutations: StockMutation[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, STOCK_MUTATIONS_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const mutations: StockMutation[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          productId: d.productId || '',
          productName: d.productName || '',
          type: d.type || 'adjustment',
          quantity: Number(d.quantity) || 0,
          previousStock: Number(d.previousStock) || 0,
          newStock: Number(d.newStock) || 0,
          reason: d.reason || '',
          supplierName: d.supplierName || '',
          createdAt: d.createdAt || new Date().toISOString(),
        };
      });
      onSuccess(mutations);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, STOCK_MUTATIONS_COLLECTION);
    }
  );
}

// Subscribe to Orders in real-time
export function subscribeToOrders(
  onSuccess: (orders: Order[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, ORDERS_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const orders: Order[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          orderNumber: data.orderNumber,
          customerId: data.customerId || '',
          customerEmail: data.customerEmail || '',
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerAddress: data.customerAddress,
          notes: data.notes || '',
          items: data.items || [],
          subtotalAmount: Number(data.subtotalAmount) || Number(data.totalAmount) || 0,
          discountAmount: Number(data.discountAmount) || 0,
          discountReason: data.discountReason || '',
          couponCode: data.couponCode || '',
          shippingCourier: data.shippingCourier || 'kurir_toko',
          shippingFee: Number(data.shippingFee) || 0,
          totalAmount: Number(data.totalAmount) || 0,
          status: data.status as OrderStatus,
          paymentMethod: data.paymentMethod,
          paymentProofUrl: data.paymentProofUrl || '',
          paymentProofDate: data.paymentProofDate || '',
          adminNotes: data.adminNotes || '',
          trackingNumber: data.trackingNumber || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt || data.createdAt,
        };
      });
      onSuccess(orders);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, ORDERS_COLLECTION);
    }
  );
}

// Create new customer order with stock decrement & mutation logging
export async function createOrder(orderPayload: Omit<Order, 'id'>): Promise<string> {
  const rawOrderData = {
    ...orderPayload,
    orderSource: orderPayload.orderSource || 'online',
    cashierName: orderPayload.cashierName || '',
    cashPaidAmount: Number(orderPayload.cashPaidAmount) || 0,
    cashChangeAmount: Number(orderPayload.cashChangeAmount) || 0,
    totalCostAmount: Number(orderPayload.totalCostAmount) || 0,
    totalProfitAmount: Number(orderPayload.totalProfitAmount) || 0,
    systemDiscountAmount: Number(orderPayload.systemDiscountAmount) || 0,
    customerId: orderPayload.customerId || 'guest',
    customerEmail: orderPayload.customerEmail || '',
    notes: orderPayload.notes || '',
    discountReason: orderPayload.discountReason || '',
    couponCode: orderPayload.couponCode || '',
    paymentProofUrl: orderPayload.paymentProofUrl || '',
    paymentProofDate: orderPayload.paymentProofDate || '',
    adminNotes: orderPayload.adminNotes || '',
    trackingNumber: orderPayload.trackingNumber || '',
    createdAt: orderPayload.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sanitizedOrderData = sanitizeFirestoreData(rawOrderData);
  let orderId = '';

  // 1. Write order document to Firestore (with 6s timeout so UI never hangs)
  try {
    const addOrderPromise = addDoc(collection(db, ORDERS_COLLECTION), sanitizedOrderData);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Koneksi Firestore lambat, menyimpan data cadangan')), 6000)
    );
    const orderDocRef = await Promise.race([addOrderPromise, timeoutPromise]);
    orderId = orderDocRef.id;
  } catch (error) {
    console.warn('Firestore direct write warning:', error);
    // Fallback: generate local ID and backup to localStorage so order is never lost
    orderId = `ord-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    try {
      const localOrders = JSON.parse(localStorage.getItem('ecoagro_offline_orders') || '[]');
      localOrders.unshift({ ...sanitizedOrderData, id: orderId });
      localStorage.setItem('ecoagro_offline_orders', JSON.stringify(localOrders.slice(0, 100)));
    } catch {
      // ignore
    }
  }

  // 2. Background async execution: update product stocks, log mutations, and upsert customer
  // This is executed asynchronously so the checkout dialog completes instantly!
  (async () => {
    // Update product stocks and record stock out mutation
    for (const item of orderPayload.items) {
      if (item.productId) {
        try {
          const prodRef = doc(db, PRODUCTS_COLLECTION, item.productId);
          let prevStock = 0;
          let nextStock = 0;

          await runTransaction(db, async (transaction) => {
            const prodSnap = await transaction.get(prodRef);
            if (prodSnap.exists()) {
              prevStock = Number(prodSnap.data().stock) || 0;
              const currentSold = Number(prodSnap.data().soldCount) || 0;
              nextStock = Math.max(0, prevStock - item.quantity);
              transaction.update(prodRef, {
                stock: nextStock,
                soldCount: currentSold + item.quantity,
              });
            }
          });

          // Record stock-out mutation
          await addDoc(collection(db, STOCK_MUTATIONS_COLLECTION), sanitizeFirestoreData({
            productId: item.productId,
            productName: item.name,
            type: 'out',
            quantity: item.quantity,
            previousStock: prevStock,
            newStock: nextStock,
            reason: `Penjualan Pesanan #${orderPayload.orderNumber} (${orderPayload.customerName})`,
            createdAt: new Date().toISOString(),
          }));
        } catch (e) {
          console.warn('Stock update transaction error for item:', item.name, e);
        }
      }
    }

    // Upsert customer info
    try {
      const cleanPhone = (orderPayload.customerPhone || '').replace(/[^0-9]/g, '');
      if (cleanPhone) {
        const custDocId = `cust-${cleanPhone}`;
        const custRef = doc(db, CUSTOMERS_COLLECTION, custDocId);

        await runTransaction(db, async (transaction) => {
          const custSnap = await transaction.get(custRef);
          if (custSnap.exists()) {
            const prevData = custSnap.data();
            const currentTotalOrders = Number(prevData.totalOrders) || 0;
            const currentTotalSpent = Number(prevData.totalSpent) || 0;

            transaction.update(custRef, {
              name: orderPayload.customerName,
              address: orderPayload.customerAddress,
              email: orderPayload.customerEmail || prevData.email || '',
              totalOrders: currentTotalOrders + 1,
              totalSpent: currentTotalSpent + orderPayload.totalAmount,
              lastOrderDate: new Date().toISOString(),
            });
          } else {
            transaction.set(custRef, {
              name: orderPayload.customerName,
              phone: orderPayload.customerPhone,
              email: orderPayload.customerEmail || '',
              address: orderPayload.customerAddress,
              totalOrders: 1,
              totalSpent: orderPayload.totalAmount,
              lastOrderDate: new Date().toISOString(),
            });
          }
        });
      }
    } catch (e) {
      console.warn('Customer upsert error:', e);
    }
  })().catch((bgErr) => console.warn('Background order tasks error:', bgErr));

  return orderId;
}

// Upload/Submit Payment Proof by Customer
export async function submitPaymentProof(orderId: string, proofUrl: string): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      paymentProofUrl: proofUrl,
      paymentProofDate: new Date().toISOString(),
      status: 'proof_submitted' as OrderStatus,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Approve payment proof by Admin
export async function approvePaymentProof(orderId: string, adminNotes = 'Pembayaran terverifikasi valid oleh Admin Eco'): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      status: 'processing' as OrderStatus,
      adminNotes: adminNotes,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Reject payment proof by Admin
export async function rejectPaymentProof(orderId: string, reason: string): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      status: 'cancelled' as OrderStatus,
      adminNotes: reason || 'Bukti pembayaran tidak sesuai atau tidak terbaca',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Update order status (Menunggu Konfirmasi -> Diproses -> Dikirim -> Selesai)
export async function updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const updates: Record<string, unknown> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (trackingNumber !== undefined) {
      updates.trackingNumber = trackingNumber;
    }
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Subscribe to Customers in real-time
export function subscribeToCustomers(
  onSuccess: (customers: Customer[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, CUSTOMERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const customers: Customer[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          totalOrders: Number(data.totalOrders) || 0,
          totalSpent: Number(data.totalSpent) || 0,
          lastOrderDate: data.lastOrderDate || '',
        };
      });
      customers.sort((a, b) => b.totalSpent - a.totalSpent);
      onSuccess(customers);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, CUSTOMERS_COLLECTION);
    }
  );
}

// User Profile & Account Management (Role: customer vs admin)
export async function saveUserAccount(user: UserAccount): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(userRef, user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, USERS_COLLECTION);
  }
}

export function subscribeToUserAccounts(
  onSuccess: (users: UserAccount[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, USERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const users: UserAccount[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          email: d.email || '',
          name: d.name || '',
          phone: d.phone || '',
          address: d.address || '',
          role: d.role || 'customer',
          createdAt: d.createdAt || new Date().toISOString(),
        };
      });
      onSuccess(users);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, USERS_COLLECTION);
    }
  );
}
