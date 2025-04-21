import React, { createContext, useContext, ReactNode } from 'react';

interface CustomerContextType {
  customerId: string | undefined;
  customerName: string | undefined;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{
  children: ReactNode;
  customerId: string | undefined;
  customerName: string | undefined;
}> = ({ children, customerId, customerName }) => {
  return (
    <CustomerContext.Provider value={{ customerId, customerName }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomerContext = (): CustomerContextType => {
  const context = useContext(CustomerContext);
  
  if (context === undefined) {
    throw new Error('useCustomerContext must be used within a CustomerProvider');
  }
  
  return context;
}; 