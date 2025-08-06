const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword, generateToken, verifyToken, generateReferralCode, authMiddleware } = require('./utils/auth');
const { calculateTier, calculateCustomerSegment, calculatePoints, updateCustomerProfile, MEMBERSHIP_TIERS } = require('./utils/membership');
require('dotenv').config();

const prisma = new PrismaClient();

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

app.post('/api/customers/register', async (req, res) => {
  try {
    const { email, firstName, lastName, password, phone, dateOfBirth, referredBy } = req.body;
    
    const existingCustomer = await prisma.customer.findUnique({ where: { email } });
    if (existingCustomer) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    const hashedPassword = await hashPassword(password);
    const referralCode = generateReferralCode(firstName, lastName);
    
    const customer = await prisma.customer.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        profile: {
          create: {
            referralCode,
            membershipTier: 'GREEN',
            segment: 'New',
            referredBy
          }
        }
      },
      include: { profile: true }
    });
    
    if (referredBy) {
      const referrer = await prisma.customerProfile.findFirst({
        where: { referralCode: referredBy }
      });
      if (referrer) {
        await prisma.customerProfile.update({
          where: { id: referrer.id },
          data: { totalReferrals: { increment: 1 } }
        });
        
        await prisma.loyaltyTransaction.create({
          data: {
            customerId: referrer.customerId,
            type: 'BONUS',
            points: 100,
            description: 'Referral bonus points'
          }
        });
        
        await prisma.customerProfile.update({
          where: { id: referrer.id },
          data: { loyaltyPoints: { increment: 100 } }
        });
      }
    }
    
    const token = generateToken({ customerId: customer.id, email: customer.email });
    res.json({ success: true, token, customer: { ...customer, password: undefined } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

app.post('/api/customers/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const customer = await prisma.customer.findUnique({
      where: { email },
      include: { profile: true }
    });
    
    if (!customer || !await comparePassword(password, customer.password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = generateToken({ customerId: customer.id, email: customer.email });
    res.json({ success: true, token, customer: { ...customer, password: undefined } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

app.get('/api/customers/profile', authMiddleware, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.user.customerId },
      include: { 
        profile: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { items: { include: { product: true } } }
        },
        loyaltyTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    res.json({ 
      success: true, 
      customer: { ...customer, password: undefined },
      membershipTier: MEMBERSHIP_TIERS[customer.profile?.membershipTier || 'GREEN']
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile', error: error.message });
  }
});

app.post('/api/customers/points/redeem', authMiddleware, async (req, res) => {
  try {
    const { points, description } = req.body;
    const customerId = req.user.customerId;
    
    const profile = await prisma.customerProfile.findUnique({
      where: { customerId }
    });
    
    if (!profile || profile.loyaltyPoints < points) {
      return res.status(400).json({ success: false, message: 'Insufficient points' });
    }
    
    await prisma.loyaltyTransaction.create({
      data: {
        customerId,
        type: 'REDEEMED',
        points: -points,
        description: description || 'Points redeemed'
      }
    });
    
    await prisma.customerProfile.update({
      where: { customerId },
      data: { loyaltyPoints: { decrement: points } }
    });
    
    res.json({ success: true, message: 'Points redeemed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to redeem points', error: error.message });
  }
});

app.get('/api/admin/customers', async (req, res) => {
  try {
    const { search, segment, isB2B, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const where = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } }
      ];
    }
    
    if (segment && segment !== 'all') {
      where.profile = { segment };
    }
    
    if (isB2B === 'true') {
      where.profile = { ...where.profile, isB2B: true };
    }
    
    const customers = await prisma.customer.findMany({
      where,
      include: { profile: true },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });
    
    const total = await prisma.customer.count({ where });
    
    res.json({
      success: true,
      customers: customers.map(c => ({ ...c, password: undefined })),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch customers', error: error.message });
  }
});

app.get('/api/admin/customers/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        profile: true,
        orders: {
          include: { items: { include: { product: true } } },
          orderBy: { createdAt: 'desc' }
        },
        loyaltyTransactions: {
          orderBy: { createdAt: 'desc' }
        },
        communications: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    res.json({ success: true, customer: { ...customer, password: undefined } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer', error: error.message });
  }
});

app.put('/api/admin/customers/:id', async (req, res) => {
  try {
    const { notes, tags, segment, isB2B, businessName, businessLicense, wholesaleTier } = req.body;
    
    const updatedProfile = await prisma.customerProfile.update({
      where: { customerId: req.params.id },
      data: {
        notes,
        tags: tags ? JSON.stringify(tags) : undefined,
        segment,
        isB2B,
        businessName,
        businessLicense,
        wholesaleTier
      }
    });
    
    res.json({ success: true, profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update customer', error: error.message });
  }
});

app.post('/api/b2b/register', async (req, res) => {
  try {
    const { 
      email, firstName, lastName, password, phone,
      businessName, businessLicense, taxExemptId 
    } = req.body;
    
    const existingCustomer = await prisma.customer.findUnique({ where: { email } });
    if (existingCustomer) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    const hashedPassword = await hashPassword(password);
    const referralCode = generateReferralCode(firstName, lastName);
    
    const customer = await prisma.customer.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        phone,
        profile: {
          create: {
            referralCode,
            membershipTier: 'GREEN',
            segment: 'New',
            isB2B: true,
            businessName,
            businessLicense,
            taxExemptId,
            wholesaleTier: 'WHOLESALE'
          }
        }
      },
      include: { profile: true }
    });
    
    res.json({ 
      success: true, 
      message: 'B2B registration submitted for approval',
      customer: { ...customer, password: undefined }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'B2B registration failed', error: error.message });
  }
});

app.get('/api/b2b/pricing', authMiddleware, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.user.customerId },
      include: { profile: true }
    });
    
    if (!customer?.profile?.isB2B) {
      return res.status(403).json({ success: false, message: 'B2B access required' });
    }
    
    const pricing = await prisma.b2BPricing.findMany({
      where: { tier: customer.profile.wholesaleTier },
      include: { product: true }
    });
    
    res.json({ success: true, pricing });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch B2B pricing', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 RiseViA Admin Backend running on port ${PORT}`);
});
