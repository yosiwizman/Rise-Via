import React, { useState } from 'react'
import { emailService } from '../../services/emailService'
import { Send, Eye, RefreshCw } from 'lucide-react'

const EmailTester: React.FC = () => {
  const [testEmail, setTestEmail] = useState('')
  const [emailType, setEmailType] = useState('welcome')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')

  const emailTypes = [
    { id: 'welcome', name: 'Welcome Email' },
    { id: 'order_confirmation', name: 'Order Confirmation' },
    { id: 'order_status', name: 'Order Status Update' },
    { id: 'low_stock', name: 'Low Stock Alert' }
  ]

  const handleSendTest = async () => {
    if (!testEmail) {
      alert('Please enter a test email address')
      return
    }

    setSending(true)
    setResult(null)

    try {
      let response

      switch (emailType) {
        case 'welcome':
          response = await emailService.sendWelcomeEmail({
            email: testEmail,
            name: 'Test Customer'
          })
          break
        
        case 'order_confirmation':
          response = await emailService.sendOrderConfirmation({
            id: 'test-order-' + Date.now(),
            order_number: 'RV' + Date.now(),
            customer_email: testEmail,
            customer_name: 'Test Customer',
            total_amount: 129.97,
            created_at: new Date().toISOString(),
            items: [
              {
                product_name: 'Purple Haze',
                quantity: 2,
                price: 39.99
              },
              {
                product_name: 'Green Crack',
                quantity: 1,
                price: 49.99
              }
            ]
          })
          break
        
        case 'order_status':
          response = await emailService.sendOrderStatusUpdate(
            {
              id: 'test-order-123',
              order_number: 'RV123456789'
            },
            'shipped',
            testEmail
          )
          break
        
        case 'low_stock':
          response = await emailService.sendLowStockAlert([
            { name: 'Purple Haze', inventory_count: 2 },
            { name: 'White Widow', inventory_count: 1 },
            { name: 'Green Crack', inventory_count: 3 }
          ])
          break
      }

      setResult({
        success: true,
        data: response
      })
    } catch (error) {
      console.error('Email test failed:', error)
      setResult({
        success: false,
        error
      })
    } finally {
      setSending(false)
    }
  }

  const generatePreview = async () => {
    setShowPreview(true)
    
    try {
      let html = ''
      
      switch (emailType) {
        case 'welcome':
          html = `
            <h1>Welcome to Rise Via!</h1>
            <p>Hi Test Customer,</p>
            <p>Thank you for joining our community of cannabis enthusiasts!</p>
            <h3>Your Member Benefits:</h3>
            <ul>
              <li>🎁 100 bonus points (already added!)</li>
              <li>💰 Exclusive member discounts</li>
              <li>🚀 Early access to new products</li>
              <li>📦 Free shipping on orders over $100</li>
            </ul>
            <p><a href="https://risevia.com/shop">Start Shopping</a></p>
          `
          break
        
        case 'order_confirmation':
          html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <div style="background: #7c3aed; color: white; padding: 20px; text-align: center;">
                <h1>Order Confirmation</h1>
                <p>Thank you for your order!</p>
              </div>
              
              <div style="background: #f3f4f6; padding: 15px; margin: 20px 0;">
                <h2>Order #RV${Date.now()}</h2>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Total:</strong> $129.97</p>
              </div>
              
              <h3>Order Items:</h3>
              <div style="border-bottom: 1px solid #e5e7eb; padding: 10px 0;">
                <strong>Purple Haze</strong><br>
                Quantity: 2 × $39.99<br>
                Subtotal: $79.98
              </div>
              <div style="border-bottom: 1px solid #e5e7eb; padding: 10px 0;">
                <strong>Green Crack</strong><br>
                Quantity: 1 × $49.99<br>
                Subtotal: $49.99
              </div>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="https://risevia.com/account/orders/test-123" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View Order Details
                </a>
              </p>
              
              <div style="text-align: center; color: #6b7280; margin-top: 30px;">
                <p>Questions? Contact support@risevia.com</p>
                <p>Rise Via Hemp Co. | Premium THCa Products</p>
              </div>
            </div>
          `
          break
        
        case 'order_status':
          html = `
            <h1>Order Update</h1>
            <p>Your order is on the way!</p>
            <p>Order #RV123456789</p>
            <p>Tracking: Coming soon</p>
          `
          break
        
        case 'low_stock':
          html = `
            <h1>Low Stock Alert</h1>
            <p>The following products are running low:</p>
            <ul>
              <li>Purple Haze: 2 remaining</li>
              <li>White Widow: 1 remaining</li>
              <li>Green Crack: 3 remaining</li>
            </ul>
            <p><a href="https://risevia.com/admin">Manage Inventory</a></p>
          `
          break
      }
      
      setPreviewHtml(html)
    } catch (error) {
      console.error('Error generating preview:', error)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Email Tester</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold mb-4">Test Email Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Test Email Address</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email Type</label>
              <select
                value={emailType}
                onChange={(e) => setEmailType(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                {emailTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSendTest}
                disabled={sending}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center justify-center"
              >
                {sending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Test
              </button>
              
              <button
                onClick={generatePreview}
                className="flex-1 border border-purple-600 text-purple-600 px-4 py-2 rounded hover:bg-purple-50 flex items-center justify-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
            </div>
          </div>
          
          {result && (
            <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <p className="font-bold">{result.success ? 'Email Sent Successfully!' : 'Email Failed'}</p>
              {result.success ? (
                <p className="text-sm">Check your inbox and the Resend dashboard.</p>
              ) : (
                <p className="text-sm">Error: {result.error?.message || 'Unknown error'}</p>
              )}
            </div>
          )}
        </div>
        
        <div className="md:col-span-2 bg-white rounded-lg shadow">
          <div className="border-b p-4 flex justify-between items-center">
            <h3 className="font-bold">Email Preview</h3>
            {showPreview && (
              <button
                onClick={() => setShowPreview(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close Preview
              </button>
            )}
          </div>
          
          <div className="p-4 h-[500px] overflow-auto">
            {showPreview ? (
              <div 
                className="email-preview border rounded p-4"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Click "Preview" to see how the email will look</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
        <h3 className="font-bold mb-2">Email Testing Tips</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use a real email address that you can check</li>
          <li>Check the Resend dashboard to verify delivery: <a href="https://resend.com/emails" target="_blank" rel="noopener noreferrer" className="underline">https://resend.com/emails</a></li>
          <li>If emails aren't sending, verify the Resend API key in your .env file</li>
          <li>The "Low Stock Alert" email always goes to admin@risevia.com regardless of the test email you enter</li>
        </ul>
      </div>
    </div>
  )
}

export default EmailTester
