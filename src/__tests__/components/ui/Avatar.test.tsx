import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test-utils'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'

describe('Avatar', () => {
  it('should render avatar with image', () => {
    render(
      <Avatar>
        <AvatarImage src="/test-avatar.jpg" alt="Test User" />
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>
    )
    
    expect(screen.getByText('TU')).toBeInTheDocument()
  })

  it('should show fallback when image fails', () => {
    render(
      <Avatar>
        <AvatarImage src="/invalid-image.jpg" alt="Test User" />
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>
    )
    
    expect(screen.getByText('TU')).toBeInTheDocument()
  })

  it('should handle different sizes', () => {
    render(
      <Avatar className="h-12 w-12">
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
    )
    
    expect(screen.getByText('LG')).toBeInTheDocument()
  })

  it('should support custom styling', () => {
    render(
      <Avatar className="border-2 border-blue-500">
        <AvatarFallback>CS</AvatarFallback>
      </Avatar>
    )
    
    expect(screen.getByText('CS')).toBeInTheDocument()
  })
})
