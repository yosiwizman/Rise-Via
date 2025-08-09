# Rise-Via Admin Guide

## Overview

This guide provides comprehensive instructions for Rise-Via administrators to manage the platform, customers, orders, and compliance operations.

## Admin Access

### Login Credentials

**Default Admin Access:**
- Username: `admin`
- Password: `admin123`

**Security Note:** Change default credentials immediately after first login.

### Admin Dashboard

Access the admin dashboard at `/admin` to manage:
- Customer accounts and profiles
- Order processing and fulfillment
- Product inventory and pricing
- Activity logs and compliance monitoring
- System analytics and reporting

## Customer Management

### Customer Overview

The customer management section provides:
- Complete customer database
- Search and filtering capabilities
- Customer profile management
- Order history and analytics
- Communication tools

### Customer Operations

#### Viewing Customer Details

1. Navigate to the "Customers" tab
2. Use search to find specific customers by:
   - Email address
   - Name (first or last)
   - Phone number
   - Customer ID

3. Click on a customer to view:
   - Personal information
   - Order history
   - Wishlist items
   - Loyalty points
   - Communication preferences

#### Creating New Customers

1. Click "Add New Customer"
2. Fill in required information:
   - Email address (unique)
   - First and last name
   - Phone number
   - Date of birth
   - Shipping address

3. Set initial preferences:
   - Communication preferences
   - Loyalty program enrollment
   - Marketing consent

#### Updating Customer Information

1. Select customer from the list
2. Click "Edit Customer"
3. Modify any field except:
   - Customer ID (system generated)
   - Creation date
   - Email (requires special process)

4. Save changes and notify customer if needed

#### Customer Search and Filtering

**Search Options:**
- Email address (exact or partial match)
- Name (first, last, or full name)
- Phone number
- Customer ID

**Filter Options:**
- Registration date range
- Order count (0, 1-5, 5+)
- Total spent ranges
- Loyalty tier
- State/location
- Active/inactive status

### Customer Analytics

#### Key Metrics

Monitor customer performance through:
- **Total Customers**: Current customer count
- **New Registrations**: Daily/weekly/monthly new customers
- **Customer Lifetime Value**: Average spending per customer
- **Retention Rate**: Percentage of returning customers
- **Geographic Distribution**: Customer locations by state

#### Customer Insights

- **Top Customers**: Highest spending customers
- **Recent Activity**: Latest registrations and orders
- **Inactive Customers**: Customers with no recent activity
- **Loyalty Program**: Points distribution and tier analysis

## Order Management

### Order Processing Workflow

#### Order Statuses

1. **Pending**: New order awaiting processing
2. **Processing**: Order being prepared for shipment
3. **Shipped**: Order dispatched with tracking
4. **Delivered**: Order confirmed delivered
5. **Cancelled**: Order cancelled (before shipping)
6. **Returned**: Order returned by customer

#### Order Processing Steps

1. **Review New Orders**
   - Check order details and customer information
   - Verify shipping address and state compliance
   - Confirm payment processing
   - Flag any suspicious orders

2. **Inventory Check**
   - Verify product availability
   - Reserve items for the order
   - Handle backorders if necessary
   - Update inventory levels

3. **Prepare for Shipping**
   - Print shipping labels
   - Package items securely
   - Include compliance documentation
   - Update order status to "Processing"

4. **Ship Order**
   - Generate tracking number
   - Update order status to "Shipped"
   - Send tracking notification to customer
   - Log shipping details

### Order Operations

#### Viewing Orders

1. Navigate to "Orders" tab
2. View orders by status:
   - All orders
   - Pending orders
   - Processing orders
   - Shipped orders
   - Problem orders

3. Use filters to find specific orders:
   - Date range
   - Customer name/email
   - Order number
   - Order status
   - Payment status

#### Order Details

Each order displays:
- **Customer Information**: Name, email, phone, address
- **Order Items**: Products, quantities, prices
- **Payment Details**: Method, amount, transaction ID
- **Shipping Information**: Method, address, tracking
- **Order Timeline**: Status changes and timestamps
- **Notes**: Internal notes and customer communications

#### Modifying Orders

**Before Shipping:**
- Add or remove items
- Update quantities
- Change shipping address
- Apply discounts or refunds
- Update customer information

**After Shipping:**
- Add tracking information
- Update delivery status
- Process returns or exchanges
- Handle customer service issues

#### Order Communication

**Automated Notifications:**
- Order confirmation emails
- Shipping notifications with tracking
- Delivery confirmations
- Status update emails

**Manual Communication:**
- Send custom emails to customers
- Add internal notes for team reference
- Log phone conversations
- Track customer service interactions

## Product Management

### Product Catalog

#### Product Information

Each product includes:
- **Basic Details**: Name, description, category
- **Pricing**: Base price, sale price, bulk pricing
- **Inventory**: Stock levels, reorder points
- **Compliance**: Lab results, potency, legal status
- **Media**: Images, videos, documents
- **SEO**: Meta tags, descriptions, keywords

#### Product Operations

**Adding New Products:**
1. Click "Add Product"
2. Fill in all required fields
3. Upload product images
4. Set pricing and inventory
5. Add compliance documentation
6. Publish or save as draft

**Updating Products:**
1. Select product from catalog
2. Edit any field
3. Update inventory levels
4. Modify pricing
5. Save changes

**Bulk Operations:**
- Import products via CSV
- Bulk price updates
- Inventory adjustments
- Category assignments
- Status changes (active/inactive)

### Inventory Management

#### Stock Tracking

Monitor inventory through:
- **Current Stock**: Real-time inventory levels
- **Reserved Stock**: Items in pending orders
- **Available Stock**: Items available for sale
- **Reorder Points**: Automatic low stock alerts
- **Supplier Information**: Vendor details and lead times

#### Inventory Operations

**Stock Adjustments:**
- Manual inventory updates
- Damage/loss reporting
- Receiving new shipments
- Quality control holds
- Expiration date tracking

**Automated Alerts:**
- Low stock warnings
- Out of stock notifications
- Expiration date reminders
- Reorder suggestions
- Supplier communication

## Compliance Management

### Age Verification

#### Monitoring Age Verification

Track age verification through:
- **Verification Attempts**: Total attempts and success rate
- **Failed Verifications**: Underage attempts and blocks
- **Risk Scoring**: High-risk verification patterns
- **Fraud Detection**: Suspicious verification attempts

#### Age Verification Reports

Generate reports for:
- Daily verification statistics
- Failed verification analysis
- Risk score distributions
- Geographic verification patterns
- Compliance audit trails

### State Compliance

#### State Restrictions

Monitor state compliance through:
- **Blocked States**: Current list of restricted states
- **Access Attempts**: Blocked access attempts by state
- **Shipping Restrictions**: State-specific shipping rules
- **Legal Updates**: Changes in state regulations

#### Compliance Reporting

**Required Reports:**
- Monthly compliance summaries
- State restriction enforcement
- Age verification compliance
- Shipping compliance logs
- Audit trail documentation

### Activity Logging

#### Admin Activity Tracking

All admin actions are logged including:
- **User Actions**: Login, logout, password changes
- **Customer Operations**: Create, update, delete customers
- **Order Operations**: Status changes, modifications
- **Product Operations**: Inventory updates, price changes
- **System Operations**: Configuration changes, backups

#### Activity Log Analysis

Review activity logs for:
- **Security Monitoring**: Unusual access patterns
- **Compliance Auditing**: Regulatory requirement tracking
- **Performance Analysis**: System usage patterns
- **Error Tracking**: System errors and issues
- **User Training**: Identifying training needs

## Analytics and Reporting

### Sales Analytics

#### Key Performance Indicators

Monitor business performance through:
- **Revenue Metrics**: Daily, weekly, monthly sales
- **Order Metrics**: Order count, average order value
- **Customer Metrics**: New customers, retention rate
- **Product Metrics**: Best sellers, inventory turnover
- **Geographic Metrics**: Sales by state/region

#### Sales Reports

Generate reports for:
- **Daily Sales Summary**: Revenue, orders, customers
- **Product Performance**: Best/worst selling products
- **Customer Analysis**: Top customers, buying patterns
- **Geographic Analysis**: Sales by location
- **Trend Analysis**: Growth patterns and seasonality

### Customer Analytics

#### Customer Insights

Analyze customer behavior through:
- **Acquisition**: How customers find the platform
- **Engagement**: Site usage and interaction patterns
- **Retention**: Repeat purchase behavior
- **Lifetime Value**: Customer value over time
- **Segmentation**: Customer groups and preferences

#### Customer Reports

**Standard Reports:**
- Customer acquisition reports
- Retention and churn analysis
- Lifetime value calculations
- Segmentation analysis
- Loyalty program performance

### Operational Analytics

#### System Performance

Monitor platform performance through:
- **Site Performance**: Load times, uptime, errors
- **User Experience**: Navigation patterns, conversion rates
- **Mobile Performance**: Mobile usage and performance
- **Search Performance**: Search queries and results
- **Checkout Performance**: Conversion funnel analysis

#### Operational Reports

**Key Reports:**
- System performance summaries
- Error logs and resolution
- User experience metrics
- Conversion funnel analysis
- Mobile usage statistics

## System Administration

### User Management

#### Admin User Roles

**Super Admin:**
- Full system access
- User management
- System configuration
- Compliance oversight

**Order Manager:**
- Order processing
- Customer service
- Inventory management
- Shipping coordination

**Customer Service:**
- Customer support
- Order inquiries
- Returns processing
- Basic reporting

#### User Operations

**Adding Admin Users:**
1. Navigate to "Admin Users"
2. Click "Add New User"
3. Set username and temporary password
4. Assign appropriate role
5. Configure permissions
6. Send login credentials

**Managing Permissions:**
- Role-based access control
- Feature-specific permissions
- Data access restrictions
- Audit trail requirements

### System Configuration

#### Platform Settings

Configure platform through:
- **General Settings**: Site name, contact information
- **Payment Settings**: Payment processors, methods
- **Shipping Settings**: Carriers, rates, restrictions
- **Email Settings**: SMTP configuration, templates
- **Security Settings**: Password policies, session timeouts

#### Compliance Configuration

**Age Verification Settings:**
- Verification requirements
- Risk scoring parameters
- Fraud detection rules
- Audit logging configuration

**State Compliance Settings:**
- Blocked state lists
- Shipping restrictions
- Legal disclaimers
- Compliance reporting

### Backup and Security

#### Data Backup

**Backup Schedule:**
- Daily database backups
- Weekly full system backups
- Monthly archive backups
- Real-time transaction logging

**Backup Verification:**
- Regular restore testing
- Data integrity checks
- Recovery time testing
- Disaster recovery planning

#### Security Monitoring

**Security Measures:**
- SSL certificate management
- Firewall configuration
- Intrusion detection
- Access logging
- Vulnerability scanning

**Security Reports:**
- Access attempt logs
- Security incident reports
- Vulnerability assessments
- Compliance security audits

## Troubleshooting

### Common Issues

#### Customer Issues

**Account Problems:**
- Password reset assistance
- Email verification issues
- Profile update problems
- Login difficulties

**Order Issues:**
- Payment processing problems
- Shipping address errors
- Order modification requests
- Delivery problems

#### System Issues

**Performance Problems:**
- Slow page loading
- Database connection issues
- Payment gateway problems
- Email delivery failures

**Data Issues:**
- Inventory discrepancies
- Customer data inconsistencies
- Order processing errors
- Reporting inaccuracies

### Support Procedures

#### Customer Support Workflow

1. **Issue Identification**
   - Gather customer information
   - Understand the problem
   - Check system status
   - Review customer history

2. **Problem Resolution**
   - Apply standard solutions
   - Escalate if necessary
   - Document resolution
   - Follow up with customer

3. **Issue Documentation**
   - Log all interactions
   - Update customer records
   - Create knowledge base entries
   - Report system issues

#### Escalation Procedures

**Level 1 Support:**
- Basic customer service
- Order status inquiries
- Account assistance
- Standard troubleshooting

**Level 2 Support:**
- Technical issues
- Complex order problems
- System configuration
- Advanced troubleshooting

**Level 3 Support:**
- System administration
- Database issues
- Security incidents
- Compliance problems

## Best Practices

### Customer Service

- Respond to inquiries within 2 hours during business hours
- Maintain professional and helpful communication
- Document all customer interactions
- Follow up on resolved issues
- Proactively communicate order updates

### Order Processing

- Process orders within 24 hours
- Verify all information before shipping
- Use proper packaging for cannabis products
- Include all required compliance documentation
- Update tracking information promptly

### Compliance

- Verify age for every customer interaction
- Enforce state restrictions consistently
- Maintain detailed audit trails
- Stay updated on regulatory changes
- Report compliance issues immediately

### Security

- Use strong passwords and change regularly
- Log out when leaving workstation
- Verify customer identity for sensitive operations
- Report security incidents immediately
- Follow data protection protocols

---

*This guide is updated regularly. For the latest procedures and policies, refer to the internal documentation system or contact the IT department.*
