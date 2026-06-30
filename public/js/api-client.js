/**
 * public/js/api-client.js
 *
 * HTTP client untuk communicate dengan backend API
 * Menghandle:
 * - GET, POST, PUT, DELETE requests
 * - Error handling
 * - Response parsing
 */

class ApiClient {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  /**
   * Ambil token dari localStorage
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Simpan token ke localStorage
   */
  setToken(token) {
    localStorage.setItem('token', token);
  }

  /**
   * Hapus token dari localStorage
   */
  clearToken() {
    localStorage.removeItem('token');
  }

  /**
   * Cek apakah user sudah login
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Membuat HTTP request
   * @param {string} endpoint - API endpoint (e.g. /transactions)
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
   * @param {object} data - Request body (untuk POST/PUT)
   * @param {boolean} auth - Whether to include auth token
   */
  async request(endpoint, method = 'GET', data = null, auth = false) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Attach token if needed
    if (auth) {
      const token = this.getToken();
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`API Error [${method} ${url}]:`, error);
      throw error;
    }
  }

  // ==================== AUTH ====================

  async register(email, password) {
    return this.request('/auth/register', 'POST', { email, password });
  }

  async login(email, password) {
    return this.request('/auth/login', 'POST', { email, password });
  }

  // ==================== CATEGORIES ====================

  async getCategories() {
    return this.request('/categories');
  }

  async createCategory(name, type) {
    return this.request('/categories', 'POST', { name, type });
  }

  async updateCategory(id, name, type) {
    return this.request(`/categories/${id}`, 'PUT', { name, type });
  }

  async deleteCategory(id) {
    return this.request(`/categories/${id}`, 'DELETE');
  }

  // ==================== TRANSACTIONS ====================

  async getTransactions(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/transactions?${params}`);
  }

  async createTransaction(categoryId, amount, description, transactionDate) {
    return this.request('/transactions', 'POST', {
      category_id: categoryId,
      amount,
      description,
      transaction_date: transactionDate,
    });
  }

  async updateTransaction(
    id,
    categoryId,
    amount,
    description,
    transactionDate
  ) {
    return this.request(`/transactions/${id}`, 'PUT', {
      category_id: categoryId,
      amount,
      description,
      transaction_date: transactionDate,
    });
  }

  async deleteTransaction(id) {
    return this.request(`/transactions/${id}`, 'DELETE');
  }

  // ==================== DASHBOARD ====================

  async getDashboard() {
    return this.request('/dashboard');
  }

  // ==================== REPORTS ====================

  async getReports() {
    return this.request('/reports');
  }

  async runWeeklyReport(data = null) {
    return this.request('/reports/weekly/run', 'POST', data);
  }

  async runMonthlyReport(data = null) {
    return this.request('/reports/monthly/run', 'POST', data);
  }

  // ==================== EXPORT ====================

  exportTransactionsCSV() {
    window.open(`${this.baseURL}/export/transactions/csv`, '_self');
  }

  exportReportsCSV() {
    window.open(`${this.baseURL}/export/reports/csv`, '_self');
  }
}

// Create global instance
const apiClient = new ApiClient();
