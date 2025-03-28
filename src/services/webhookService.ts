import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, query, orderBy, limit as firestoreLimit, onSnapshot, DocumentData } from 'firebase/firestore';

// Interface for order data
export interface OrderData {
  id?: string;
  orderId?: string;
  customer?: string;
  items?: string;
  status?: string;
  timestamp?: any;
  [key: string]: any; // Allow for additional fields from webhook
}

// Store orders in Firestore
export const storeOrder = async (orderData: OrderData): Promise<string> => {
  try {
    // Add timestamp if not provided
    const orderWithTimestamp = {
      ...orderData,
      status: orderData.status || 'New',
      timestamp: orderData.timestamp || serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'orders'), orderWithTimestamp);
    console.log('Order stored with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error storing order:', error);
    throw error;
  }
};

// Listen for new orders in Firestore
export const subscribeToOrders = (
  callback: (orders: OrderData[]) => void,
  limitCount = 50
) => {
  const ordersQuery = query(
    collection(db, 'orders'),
    orderBy('timestamp', 'desc'),
    firestoreLimit(limitCount)
  );

  return onSnapshot(ordersQuery, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data() as DocumentData
    })) as OrderData[];
    
    callback(orders);
  }, (error) => {
    console.error('Error subscribing to orders:', error);
  });
};

// Function to handle webhook data
export const processWebhookData = async (data: any): Promise<string> => {
  try {
    // Validate and transform webhook data
    const orderData: OrderData = {
      orderId: data.orderId || data.id || `order-${Date.now()}`,
      customer: data.customer || data.customerName || 'Unknown Customer',
      items: data.items || data.products || data.orderItems || 'Items not specified',
      status: data.status || 'New',
      // Store the original data as well
      rawData: data,
      // Add any other fields you expect from the webhook
      ...data
    };
    
    // Store in Firestore
    return await storeOrder(orderData);
  } catch (error) {
    console.error('Error processing webhook data:', error);
    throw error;
  }
};
