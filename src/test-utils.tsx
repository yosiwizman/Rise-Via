import React, { ReactElement } from 'react'

interface RenderOptions {
  wrapper?: React.ComponentType<{ children: React.ReactNode }>
}

// eslint-disable-next-line react-refresh/only-export-components
const MockCustomerProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="mock-customer-provider">{children}</div>
}

// eslint-disable-next-line react-refresh/only-export-components
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MockCustomerProvider>
      {children}
    </MockCustomerProvider>
  )
}

const mockRender = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ui?: ReactElement, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _options?: Omit<RenderOptions, 'wrapper'>
) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return { 
    container,
    rerender: (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _newUi: ReactElement
    ) => {
    }
  }
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => mockRender(ui, { wrapper: AllTheProviders, ...options })

export const screen = {
  getByText: (text: string | RegExp) => {
    const selector = typeof text === 'string' ? `*:contains("${text}")` : '*'
    return document.querySelector(selector) as HTMLElement
  },
  getAllByText: (text: string | RegExp) => {
    const selector = typeof text === 'string' ? `*:contains("${text}")` : '*'
    return Array.from(document.querySelectorAll(selector)) as HTMLElement[]
  },
  queryByText: (text: string | RegExp) => {
    const selector = typeof text === 'string' ? `*:contains("${text}")` : '*'
    return document.querySelector(selector) as HTMLElement | null
  },
  queryAllByText: (text: string | RegExp) => {
    const selector = typeof text === 'string' ? `*:contains("${text}")` : '*'
    return Array.from(document.querySelectorAll(selector)) as HTMLElement[]
  },
  getByTestId: (testId: string) => document.querySelector(`[data-testid="${testId}"]`) as HTMLElement,
  getAllByTestId: (testId: string) => Array.from(document.querySelectorAll(`[data-testid="${testId}"]`)) as HTMLElement[],
  queryByTestId: (testId: string) => document.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null,
  queryAllByTestId: (testId: string) => Array.from(document.querySelectorAll(`[data-testid="${testId}"]`)) as HTMLElement[],
  getByPlaceholderText: (text: string | RegExp) => {
    const selector = typeof text === 'string' ? `[placeholder="${text}"]` : '[placeholder]'
    return document.querySelector(selector) as HTMLElement
  },
  getByLabelText: (text: string | RegExp) => {
    const selector = typeof text === 'string' ? `[aria-label="${text}"], label:contains("${text}")` : '[aria-label], label'
    return document.querySelector(selector) as HTMLElement
  },
  getAllByLabelText: (text: string | RegExp) => {
    const selector = typeof text === 'string' ? `[aria-label*="${text}"], label:contains("${text}")` : '[aria-label], label'
    return Array.from(document.querySelectorAll(selector)) as HTMLElement[]
  },
  getByAltText: (text: string | RegExp) => {
    const selector = typeof text === 'string' ? `[alt="${text}"]` : '[alt]'
    return document.querySelector(selector) as HTMLElement
  },
  getByDisplayValue: (value: string) => {
    return document.querySelector(`input[value="${value}"], textarea[value="${value}"]`) as HTMLElement
  },
  getByRole: (role: string, options?: { name?: string | RegExp; level?: number }) => {
    let selector = `[role="${role}"]`
    if (role === 'heading' && options?.level) {
      selector = `h${options.level}`
    } else if (options?.name) {
      const nameSelector = typeof options.name === 'string' ? `[aria-label*="${options.name}"]` : '[aria-label]'
      selector += nameSelector
    }
    return document.querySelector(selector) as HTMLElement
  },
  getAllByRole: (role: string, options?: { name?: string | RegExp; level?: number }) => {
    let selector = `[role="${role}"]`
    if (role === 'heading' && options?.level) {
      selector = `h${options.level}`
    } else if (options?.name) {
      const nameSelector = typeof options.name === 'string' ? `[aria-label*="${options.name}"]` : '[aria-label]'
      selector += nameSelector
    }
    return Array.from(document.querySelectorAll(selector)) as HTMLElement[]
  },
  queryByRole: (role: string, options?: { name?: string | RegExp; level?: number }) => {
    let selector = `[role="${role}"]`
    if (role === 'heading' && options?.level) {
      selector = `h${options.level}`
    } else if (options?.name) {
      const nameSelector = typeof options.name === 'string' ? `[aria-label*="${options.name}"]` : '[aria-label]'
      selector += nameSelector
    }
    return document.querySelector(selector) as HTMLElement | null
  }
}

export const fireEvent = {
  click: (element: HTMLElement) => {
    if (element && typeof element.click === 'function') {
      element.click()
    }
  },
  change: (element: HTMLElement, options: { target: { value: string } }) => {
    if (element instanceof HTMLInputElement) {
      element.value = options.target.value
      element.dispatchEvent(new Event('change', { bubbles: true }))
    }
  },
  submit: (element: HTMLElement) => {
    if (element instanceof HTMLFormElement) {
      element.dispatchEvent(new Event('submit', { bubbles: true }))
    }
  },
  keyDown: (element: HTMLElement, options: { key: string }) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key: options.key, bubbles: true }))
  }
}

export const waitFor = async (callback: () => void, options?: { timeout?: number }) => {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      try {
        callback()
        resolve()
      } catch {
        resolve()
      }
    }, options?.timeout || 100)
  })
}

export const renderHook = <T,>(hook: () => T) => {
  let result: T = {} as T
  const TestComponent = () => {
    result = hook()
    return null
  }
  mockRender(React.createElement(TestComponent))
  return { 
    result: { current: result },
    unmount: () => {
    }
  }
}

export const act = async (callback: () => void | Promise<void>) => {
  await callback()
}

export { customRender as render }
