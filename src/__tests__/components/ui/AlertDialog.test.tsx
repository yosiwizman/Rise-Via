import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../../../test-utils'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '../../../components/ui/alert-dialog'

describe('AlertDialog', () => {
  it('should render alert dialog trigger', () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open Alert</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>Are you sure?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    
    expect(screen.getByText('Open Alert')).toBeInTheDocument()
  })

  it('should open dialog when trigger is clicked', () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete Item</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Confirmation</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    
    const trigger = screen.getByText('Delete Item')
    fireEvent.click(trigger)
    
    expect(screen.getByText('Delete Confirmation')).toBeInTheDocument()
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
  })

  it('should handle cancel action', () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Warning</AlertDialogTitle>
            <AlertDialogDescription>Proceed with caution.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction>Proceed</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    
    expect(screen.getByText('Go Back')).toBeInTheDocument()
    expect(screen.getByText('Proceed')).toBeInTheDocument()
  })

  it('should support destructive actions', () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Destructive Action</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete your data.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600">Delete Forever</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
    
    expect(screen.getByText('Delete Forever')).toBeInTheDocument()
  })
})
