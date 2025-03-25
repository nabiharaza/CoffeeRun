const API_URL = 'http://localhost:5001/api';

// Common fetch wrapper
const fetchWrapper = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Request failed');
    }

    return response.json();
  } catch (error) {
    console.error(`API Error: ${url}`, error);
    throw error;
  }
};

// User endpoints
export const fetchUsers = async () => fetchWrapper('/users');
export const createUser = async (userData) => fetchWrapper('/users', {
  method: 'POST',
  body: JSON.stringify(userData)
});
export const getUser = async (userId) => fetchWrapper(`/users/${userId}`);

// Group endpoints
export const fetchGroups = async () => fetchWrapper('/groups');
export const createGroup = async (groupData) => fetchWrapper('/groups', {
  method: 'POST',
  body: JSON.stringify(groupData)
});
export const getGroup = async (groupId) => fetchWrapper(`/groups/${groupId}`);
export const addGroupMember = async (groupId, userId) => fetchWrapper(`/groups/${groupId}/members`, {
  method: 'POST',
  body: JSON.stringify({ user_id: userId })
});

// Expense endpoints
export const createExpense = async (expenseData) => fetchWrapper('/expenses', {
  method: 'POST',
  body: JSON.stringify(expenseData)
});
export const updateExpensePayer = async (expenseId, payerData) => fetchWrapper(`/expenses/${expenseId}/update-payer`, {
  method: 'PATCH',
  body: JSON.stringify(payerData)
});

// Balance endpoints
export const getGroupBalances = async (groupId) => fetchWrapper(`/groups/${groupId}/balances`);
export const getDetailedDebts = async (groupId) => fetchWrapper(`/groups/${groupId}/detailed-debts`);
export const getTransactionHistory = async (groupId) => fetchWrapper(`/groups/${groupId}/transaction-history`);

// Next payer endpoint
export const getNextPayer = async (groupId) => fetchWrapper(`/groups/${groupId}/next-payer`);