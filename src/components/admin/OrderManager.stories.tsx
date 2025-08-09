import type { Meta, StoryObj } from '@storybook/react'
import { OrderManager } from './OrderManager'

const meta: Meta<typeof OrderManager> = {
  title: 'Admin/OrderManager',
  component: OrderManager,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LoadingState: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Order Manager in loading state',
      },
    },
  },
}
