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
    if (product.id) {
      const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
      await updateDoc(docRef, {
        name: product.name,
        category: product.category,
        price: Number(product.price),
        stock: Number(product.stock),
        minStockAlert: Number(product.minStockAlert || 10),
        unit: product.unit,
        description: product.description,
        imageUrl: product.imageUrl,
        featured: Boolean(product.featured),
        rating: Number(product.rating || 5),
        soldCount: Number(product.soldCount || 0),
      });
      return product.id;
    } else {
      const newDocRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
        name: product.name,
        category: product.category,
        price: Number(product.price),
        stock: Number(product.stock),
        minStockAlert: Number(product.minStockAlert || 10),
        unit: product.unit,
        description: product.description,
        imageUrl: product.imageUrl,
        rating: 5,
        soldCount: 0,
        featured: Boolean(product.featured),
        createdAt: new Date().toISOString(),
      });
      return newDocRef.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, PRODUCTS_COLLECTION);
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
  try {
    // Write new order doc
    const orderDocRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...orderPayload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

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
          await addDoc(collection(db, STOCK_MUTATIONS_COLLECTION), {
            productId: item.productId,
            productName: item.name,
            type: 'out',
            quantity: item.quantity,
            previousStock: prevStock,
            newStock: nextStock,
            reason: `Penjualan Pesanan #${orderPayload.orderNumber} (${orderPayload.customerName})`,
            createdAt: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Stock update transaction error for item:', item.name, e);
        }
      }
    }

    // Upsert customer info
    try {
      const cleanPhone = orderPayload.customerPhone.replace(/[^0-9]/g, '');
      const custDocId = `cust-${cleanPhone}`;
      const custRef = doc(db, CUSTOMERS_COLLECTION, custDocId);

      await runTransaction(db, async (transaction) => {
        const custSnap = await transaction.get(custRef);
        if (custSnap.exists()) {
          const currentTotalOrders = Number(custSnap.data().totalOrders) || 0;
          const currentTotalSpent = Number(custSnap.data().totalSpent) || 0;
          transaction.update(custRef, {
            name: orderPayload.customerName,
            address: orderPayload.customerAddress,
            email: orderPayload.customerEmail || custSnap.data().email || '',
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
    } catch (e) {
      console.warn('Customer upsert error:', e);
    }

    return orderDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, ORDERS_COLLECTION);
  }
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
