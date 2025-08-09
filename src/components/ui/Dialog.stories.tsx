import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Button } from './button';

const meta: Meta<typeof Dialog> = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">
              Name
            </label>
            <input
              id="name"
              defaultValue="Pedro Duarte"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="username" className="text-right">
              Username
            </label>
            <input
              id="username"
              defaultValue="@peduarte"
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit">Save changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  ),
};

export const AgeVerification: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent className="max-w-md mx-auto bg-risevia-black border-risevia-purple">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-r from-risevia-purple to-risevia-teal rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">21+</span>
          </div>
          <DialogTitle className="text-2xl font-bold gradient-text">
            Age Verification Required
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="text-center text-gray-300">
            <p className="mb-4">
              You must be 21 years or older to access this website and purchase cannabis products.
            </p>
            <p className="text-sm text-gray-400">
              By entering this site, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button className="w-full neon-glow bg-gradient-to-r from-risevia-purple to-risevia-teal hover:from-risevia-teal hover:to-risevia-purple text-white font-semibold py-3 rounded-2xl">
              I am 21 or older
            </Button>
            
            <Button
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 py-3 rounded-2xl"
            >
              I am under 21
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  ),
};
