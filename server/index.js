const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RiseViA Admin Backend is running' });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({
      success: true,
      token: 'admin123',
      user: { username: 'admin', role: 'ADMIN' }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.get('/api/admin/products', (req, res) => {
  res.json({
    success: true,
    data: {
      products: [],
      total: 0,
      page: 1,
      limit: 10
    }
  });
});

app.post('/api/admin/products', (req, res) => {
  res.json({
    success: true,
    message: 'Product created successfully',
    data: { id: 'new-product-id' }
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 RiseViA Admin Backend running on port ${PORT}`);
});
