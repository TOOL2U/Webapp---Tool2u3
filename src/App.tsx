import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect } from 'react';
import { handleWebhookData } from './api/webhookHandler';

function App() {
  // Listen for webhook test events (for development purposes)
  useEffect(() => {
    // Create a function to handle test webhook events
    const handleTestWebhook = (event: MessageEvent) => {
      if (event.data && event.data.type === 'TEST_WEBHOOK') {
        console.log('Received test webhook data:', event.data.payload);
        handleWebhookData(event.data.payload)
          .then(result => {
            console.log('Processed test webhook data:', result);
          })
          .catch(error => {
            console.error('Error processing test webhook:', error);
          });
      }
    };

    // Add event listener for postMessage events
    window.addEventListener('message', handleTestWebhook);

    // Clean up
    return () => {
      window.removeEventListener('message', handleTestWebhook);
    };
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <OrdersPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <Layout>
            <OrdersPage />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
