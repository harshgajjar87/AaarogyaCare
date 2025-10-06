
import axios from '../utils/axios';

// Base URL for API requests
const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function for retrying failed requests
const retryRequest = async (requestFn, retries = MAX_RETRIES) => {
  try {
    return await requestFn();
  } catch (error) {
    if (retries > 0 && 
        (error.code === 'ECONNABORTED' || 
         error.code === 'NETWORK_ERROR' || 
         error.response?.status >= 500)) {
      console.warn(`🔄 Retrying request... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryRequest(requestFn, retries - 1);
    }
    throw error;
  }
};

// Enhanced error handler
const handleApiError = (error, context) => {
  console.error(`❌ Error ${context}:`, error.response?.data || error.message);
  
  // Provide more specific error messages
  let errorMessage = error.response?.data?.msg || error.message;
  
  // Handle specific chat-related error cases
  if (error.response?.status === 404 && error.response?.data?.msg?.includes('No active chats found')) {
    errorMessage = 'No active chats found for your approved appointments. Please contact the doctor to extend the chat if needed.';
  } else if (error.response?.status === 404 && error.response?.data?.hasApprovedAppointments === false) {
    errorMessage = 'You don\'t have any approved appointments yet. Please wait for your appointments to be approved.';
  } else if (error.response?.status === 404 && error.response?.data?.allChatsExpired) {
    errorMessage = 'All your chat sessions have expired. Please contact the doctor to extend the chat if needed.';
  } else if (error.response?.status === 401) {
    errorMessage = 'Authentication failed. Please log in again.';
  } else if (error.response?.status === 403) {
    errorMessage = 'Access denied. You are not authorized to perform this action.';
  } else if (error.response?.status === 404) {
    errorMessage = 'Resource not found.';
  } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
    errorMessage = 'Network error. Please check your connection and try again.';
  } else if (error.response?.status >= 500) {
    errorMessage = 'Server error. Please try again later.';
  }
  
  const enhancedError = new Error(errorMessage);
  enhancedError.originalError = error;
  enhancedError.statusCode = error.response?.status;
  enhancedError.responseData = error.response?.data;
  
  throw enhancedError;
};

// Create or access chats for approved appointments
// If appointmentId is provided, access that specific chat
// If no appointmentId is provided, automatically access all available chats
export const createOrAccessChat = async (appointmentId = null) => {
  try {
    const requestData = appointmentId ? { appointmentId } : {};
    const response = await retryRequest(() => 
      axios.post(`/chat`, requestData)
    );
    console.log('✅ Chat created/accessed successfully:', response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'creating/accessing chat');
  }
};

export const getUserChats = async () => {
  try {
    const response = await retryRequest(() => 
      axios.get(`/chat`)
    );
    console.log('✅ Chats fetched successfully:', response.data);
    return {
      activeChats: response.data.active,
      archivedChats: response.data.archived
    };
  } catch (error) {
    return handleApiError(error, 'fetching user chats');
  }
};

// Get a specific chat by ID
export const getChatById = async (chatId) => {
  try {
    const response = await retryRequest(() => 
      axios.get(`/chat/${chatId}`)
    );
    console.log('✅ Chat fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'fetching chat');
  }
};

// Send a message in a specific chat
export const sendMessage = async (chatId, message) => {
  try {
    const response = await retryRequest(() => 
      axios.post(`/chat/${chatId}/messages`, { message })
    );
    console.log('✅ Message sent successfully:', response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'sending message');
  }
};

// Extend chat expiration
export const extendChatExpiration = async (chatId) => {
  try {
    const response = await retryRequest(() => 
      axios.put(`/chat/${chatId}/extend`, {})
    );
    console.log('✅ Chat expiration extended successfully:', response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'extending chat expiration');
  }
};

// End chat (doctor only)
export const endChat = async (chatId) => {
  try {
    const response = await retryRequest(() => 
      axios.put(`/chat/${chatId}/end`, {})
    );
    console.log('✅ Chat ended successfully:', response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'ending chat');
  }
};

// Debug function: Check if user has approved appointments
export const checkApprovedAppointments = async () => {
  try {
    const response = await retryRequest(() => 
      axios.get(`/chat/debug/approved-appointments`)
    );
    console.log('✅ Approved appointments check:', response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'checking approved appointments');
  }
};

// Debug function: Create test chat (development only)
export const createTestChatDebug = async (appointmentId) => {
  try {
    const response = await retryRequest(() => 
      axios.post(`/chat/debug/test-chat`, { appointmentId })
    );
    console.log('✅ Test chat created:', response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'creating test chat');
  }
};

// Debug function to check API connectivity
export const checkChatApiHealth = async () => {
  try {
    const response = await axios.get(`/chat/health`);
    return response.data;
  } catch (error) {
    console.warn('⚠️ Chat API health check failed:', error.message);
    return { status: 'unhealthy', error: error.message };
  }
};
