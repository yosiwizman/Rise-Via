import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test-utils'
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableFooter, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../components/ui/table'

describe('Table', () => {
  it('should render table with headers and data', () => {
    render(
      <Table>
        <TableCaption>Product Inventory</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Blue Dream</TableCell>
            <TableCell>$29.99</TableCell>
            <TableCell>50</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>OG Kush</TableCell>
            <TableCell>$34.99</TableCell>
            <TableCell>25</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    
    expect(screen.getByText('Product Inventory')).toBeInTheDocument()
    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByText('Blue Dream')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
  })

  it('should handle table footer', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Product A</TableCell>
            <TableCell>2</TableCell>
            <TableCell>$59.98</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell>$59.98</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    )
    
    expect(screen.getAllByText('Total')).toHaveLength(2)
    expect(screen.getAllByText('$59.98')).toHaveLength(2)
  })

  it('should support responsive tables', () => {
    render(
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[100px]">Name</TableHead>
              <TableHead className="min-w-[100px]">Type</TableHead>
              <TableHead className="min-w-[100px]">THC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Purple Haze</TableCell>
              <TableCell>Sativa</TableCell>
              <TableCell>20%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
    
    expect(screen.getByText('Purple Haze')).toBeInTheDocument()
  })

  it('should handle empty table state', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={2} className="text-center">
              No products found
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    
    expect(screen.getByText('No products found')).toBeInTheDocument()
  })
})
