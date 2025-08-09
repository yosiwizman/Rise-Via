import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../../../test-utils'
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group'
import { Label } from '../../../components/ui/label'

describe('RadioGroup', () => {
  it('should render radio group with options', () => {
    render(
      <RadioGroup defaultValue="option1">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="r1" />
          <Label htmlFor="r1">Option 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="r2" />
          <Label htmlFor="r2">Option 2</Label>
        </div>
      </RadioGroup>
    )
    
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('should handle radio selection', () => {
    render(
      <RadioGroup>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="sativa" id="sativa" />
          <Label htmlFor="sativa">Sativa</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="indica" id="indica" />
          <Label htmlFor="indica">Indica</Label>
        </div>
      </RadioGroup>
    )
    
    const indicaOption = screen.getByLabelText('Indica')
    fireEvent.click(indicaOption)
    
    expect(indicaOption).toBeChecked()
  })

  it('should support disabled options', () => {
    render(
      <RadioGroup>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="available" id="available" />
          <Label htmlFor="available">Available</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="soldout" id="soldout" disabled />
          <Label htmlFor="soldout">Sold Out</Label>
        </div>
      </RadioGroup>
    )
    
    const soldOutOption = screen.getByLabelText('Sold Out')
    expect(soldOutOption).toBeDisabled()
  })

  it('should handle controlled state', () => {
    render(
      <RadioGroup value="hybrid">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="sativa" id="sativa" />
          <Label htmlFor="sativa">Sativa</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="hybrid" id="hybrid" />
          <Label htmlFor="hybrid">Hybrid</Label>
        </div>
      </RadioGroup>
    )
    
    const hybridOption = screen.getByLabelText('Hybrid')
    expect(hybridOption).toBeChecked()
  })
})
