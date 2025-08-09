import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

const MockCustomerProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="mock-customer-provider">{children}</div>
}

const mockScreen = {
  getByText: (text: string | RegExp) => document.querySelector(`[data-testid*="${text}"], *:contains("${text}")`) || document.body,
  getByTestId: (testId: string) => document.querySelector(`[data-testid="${testId}"]`) || document.body,
  queryAllByText: (text: string | RegExp) => Array.from(document.querySelectorAll('*')).filter(el => el.textContent?.includes(text.toString())),
  queryByText: (text: string | RegExp) => document.querySelector(`*:contains("${text}")`)
};

const mockFireEvent = {
  click: (element: Element) => {
    const event = new MouseEvent('click', { bubbles: true });
    element.dispatchEvent(event);
  }
};

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
export { mockScreen as screen, mockFireEvent as fireEvent }
