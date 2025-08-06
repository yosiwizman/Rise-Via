export const mockStorage = {
  getCustomers: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return JSON.parse(localStorage.getItem('rise-via-customers') || '[]');
    }
    return [];
  },
  
  saveCustomer: (customer) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const customers = mockStorage.getCustomers();
      customers.push(customer);
      localStorage.setItem('rise-via-customers', JSON.stringify(customers));
    }
  },
  
  findCustomerByEmail: (email) => {
    const customers = mockStorage.getCustomers();
    return customers.find(c => c.email === email);
  },
  
  updateCustomer: (customerId, updates) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const customers = mockStorage.getCustomers();
      const index = customers.findIndex(c => c.id === customerId);
      if (index !== -1) {
        customers[index] = { ...customers[index], ...updates };
        localStorage.setItem('rise-via-customers', JSON.stringify(customers));
      }
    }
  }
};
