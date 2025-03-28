import { processWebhookData } from '../services/webhookService';

// The webhook URL from make.com
export const WEBHOOK_URL = 'https://hook.eu2.make.com/vu3s7gc6ao5gmun1o1t976566txn5t1c';

// Function to simulate sending data to the webhook (for testing)
export const sendTestDataToWebhook = async (testData: any) => {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Test data sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending test data to webhook:', error);
    throw error;
  }
};

// Function to handle incoming webhook data
export const handleWebhookData = async (requestData: any) => {
  try {
    console.log('Received webhook data:', requestData);
    
    // Process the webhook data
    const orderId = await processWebhookData(requestData);
    
    return {
      success: true,
      message: 'Webhook data processed successfully',
      orderId
    };
  } catch (error) {
    console.error('Error handling webhook data:', error);
    return {
      success: false,
      message: 'Error processing webhook data',
      error: (error instanceof Error) ? error.message : String(error)
    };
  }
};
