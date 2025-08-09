import type { Meta, StoryObj } from '@storybook/react'
import { ProductManager } from './ProductManager'

const meta: Meta<typeof ProductManager> = {
  title: 'Admin/ProductManager',
  component: ProductManager,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithMockData: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Product Manager with sample data loaded from products.json',
      },
    },
  },
}
