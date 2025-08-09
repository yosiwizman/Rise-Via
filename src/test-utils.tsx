import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

const MockCustomerProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="mock-customer-provider">{children}</div>
}

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MockCustomerProvider>
      {children}
    </MockCustomerProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
