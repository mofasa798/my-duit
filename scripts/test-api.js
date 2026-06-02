const { spawn } = require('child_process');
const http = require('http');

const BASE_URL = 'http://127.0.0.1:3000';

const request = (path, options = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const body = options.body ? JSON.stringify(options.body) : null;

    const req = http.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data || '{}');
          resolve({ status: res.statusCode, body: parsed });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
};

const waitForServer = () => {
  const maxAttempts = 20;
  let attempts = 0;

  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const res = await request('/api/health');
        if (res.status === 200) {
          clearInterval(interval);
          resolve();
        }
      } catch (err) {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error('Server did not start within expected time'));
        }
      }
    }, 300);
  });
};

const run = async () => {
  console.log('Starting server...');
  const serverProcess = spawn('node', ['server.js'], {
    cwd: __dirname + '/..',
    stdio: ['ignore', 'inherit', 'inherit'],
  });

  process.on('exit', () => {
    serverProcess.kill();
  });

  try {
    await waitForServer();
    console.log('Server ready, running API tests...');

    const health = await request('/api/health');
    console.log('GET /api/health =>', health.status);

    const categoriesBefore = await request('/api/categories');
    console.log('GET /api/categories =>', categoriesBefore.status, categoriesBefore.body.data.length, 'categories');

    const newCategory = await request('/api/categories', {
      method: 'POST',
      body: { name: 'API Test Category', type: 'expense' },
    });
    console.log('POST /api/categories =>', newCategory.status, newCategory.body.data);

    const updateCategory = await request(`/api/categories/${newCategory.body.data.id}`, {
      method: 'PUT',
      body: { name: 'API Test Category Updated', type: 'expense' },
    });
    console.log('PUT /api/categories/:id =>', updateCategory.status);

    const createTransaction = await request('/api/transactions', {
      method: 'POST',
      body: {
        category_id: newCategory.body.data.id,
        amount: 123456,
        description: 'API test transaction',
        transaction_date: '2026-06-02',
      },
    });
    console.log('POST /api/transactions =>', createTransaction.status, createTransaction.body.data);

    const updateTransaction = await request(`/api/transactions/${createTransaction.body.data.id}`, {
      method: 'PUT',
      body: {
        category_id: newCategory.body.data.id,
        amount: 234567,
        description: 'API test transaction updated',
        transaction_date: '2026-06-02',
      },
    });
    console.log('PUT /api/transactions/:id =>', updateTransaction.status);

    const transactions = await request('/api/transactions');
    console.log('GET /api/transactions =>', transactions.status, transactions.body.data.length, 'transactions');

    const deleteTransaction = await request(`/api/transactions/${createTransaction.body.data.id}`, {
      method: 'DELETE',
    });
    console.log('DELETE /api/transactions/:id =>', deleteTransaction.status);

    const deleteCategory = await request(`/api/categories/${newCategory.body.data.id}`, {
      method: 'DELETE',
    });
    console.log('DELETE /api/categories/:id =>', deleteCategory.status);

    const dashboard = await request('/api/dashboard');
    console.log('GET /api/dashboard =>', dashboard.status, dashboard.body.data);

    console.log('\nAPI tests completed successfully!');
  } catch (error) {
    console.error('API tests failed:', error);
    process.exitCode = 1;
  } finally {
    serverProcess.kill();
  }
};

run();
