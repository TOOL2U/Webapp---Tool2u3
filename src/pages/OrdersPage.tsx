import { useState, useEffect } from 'react';
import { subscribeToOrders, OrderData, processWebhookData } from '../services/webhookService';
import { useNotification } from '../contexts/NotificationContext';
import NotificationManager from '../components/NotificationManager';

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [testOrderData, setTestOrderData] = useState('');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notificationPermissionStatus } = useNotification();

  useEffect(() => {
    // Subscribe to orders from Firestore
    const unsubscribe = subscribeToOrders((newOrders) => {
      setOrders(newOrders);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTestResponse(null);
    
    try {
      // Parse the JSON input
      const orderData = JSON.parse(testOrderData);
      
      // Send to our local API endpoint
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/webhook/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const result = await response.json();
      setTestResponse(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResponse(`Error: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Orders Dashboard</h1>
      
      {/* Notification Manager Component */}
      <NotificationManager />
      
      {/* Webhook Information */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Webhook Integration</h2>
        <p className="mb-2">Use the following URL in your make.com webhook:</p>
        <div className="bg-gray-100 p-3 rounded-md mb-4 font-mono text-sm break-all">
          {import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/webhook/orders
        </div>
        
        {/* Test Form */}
        <h3 className="text-lg font-medium mb-2">Test Webhook</h3>
        <form onSubmit={handleTestSubmit} className="mb-4">
          <div className="mb-4">
            <label htmlFor="testData" className="block text-sm font-medium text-gray-700 mb-1">
              Order JSON Data:
            </label>
            <textarea
              id="testData"
              rows={5}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono text-sm"
              value={testOrderData}
              onChange={(e) => setTestOrderData(e.target.value)}
              placeholder='{"orderId": "123", "customer": "John Doe", "items": "Product A, Product B", "status": "New"}'
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Send Test Data'}
          </button>
        </form>
        
        {testResponse && (
          <div className="mt-4">
            <h4 className="text-md font-medium mb-2">Response:</h4>
            <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-auto max-h-40">
              {testResponse}
            </pre>
          </div>
        )}
      </div>
      
      {/* Orders List */}
      <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No orders found. New orders will appear here.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 truncate">
                      Order ID: {order.orderId || order.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      Customer: {order.customer || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Items: {order.items || 'Not specified'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Time: {order.timestamp?.toDate?.() 
                        ? order.timestamp.toDate().toLocaleString() 
                        : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        order.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'}`}>
                      {order.status || 'New'}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
