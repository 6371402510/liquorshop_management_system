import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Printer, Download } from 'lucide-react'
import { format } from 'date-fns'

const STORE_INFO = {
  name: 'Star Wines & Spirits',
  address: 'Shop No. 12, Main Market, Sector 5',
  city: 'Gurugram, Haryana - 122001',
  phone: '+91 98765 43210',
  email: 'contact@starwines.in',
  gstin: '06AABCS1234D1Z5',
  licenseNo: 'L-4/2024/HR/GGN-0012',
  fssaiNo: '12345678901234',
}

export default function GSTInvoice({ sale }) {
  const printRef = useRef()

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Invoice-${sale.invoice_number}`,
  })

  const items = sale.items || []
  const subtotal = Number(sale.subtotal)
  const gstAmount = Number(sale.gst_amount)
  const discount = Number(sale.discount || 0)
  const total = Number(sale.total_amount)

  const taxableValue = subtotal - gstAmount
  const cgst = gstAmount / 2
  const sgst = gstAmount / 2

  return (
    <div>
      <div className="flex gap-2 mb-4 no-print">
        <button onClick={handlePrint} className="btn-primary">
          <Printer className="w-4 h-4" /> Print Invoice
        </button>
      </div>

      <div ref={printRef} className="bg-white text-gray-900 p-8 max-w-2xl mx-auto shadow-lg rounded-lg print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="border-b-2 border-gray-800 pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{STORE_INFO.name}</h1>
              <p className="text-xs text-gray-600 mt-0.5">{STORE_INFO.address}</p>
              <p className="text-xs text-gray-600">{STORE_INFO.city}</p>
              <p className="text-xs text-gray-600">Ph: {STORE_INFO.phone}</p>
            </div>
            <div className="text-right">
              <h2 className="text-base font-bold text-gray-800 uppercase tracking-wider">Tax Invoice</h2>
              <p className="text-xs text-gray-600 mt-1">GSTIN: {STORE_INFO.gstin}</p>
              <p className="text-xs text-gray-600">License: {STORE_INFO.licenseNo}</p>
              <p className="text-xs text-gray-600">FSSAI: {STORE_INFO.fssaiNo}</p>
            </div>
          </div>
        </div>

        {/* Invoice details */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
          <div className="border border-gray-200 rounded p-3">
            <p className="font-semibold text-gray-600 mb-1 uppercase text-[10px]">Bill To</p>
            <p className="font-medium">{sale.customer_name || 'Walk-in Customer'}</p>
            {sale.customer_phone && <p className="text-gray-500">{sale.customer_phone}</p>}
          </div>
          <div className="border border-gray-200 rounded p-3">
            <div className="flex justify-between mb-1">
              <span className="text-gray-500">Invoice No:</span>
              <span className="font-semibold">{sale.invoice_number}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-500">Date:</span>
              <span className="font-semibold">{format(new Date(sale.created_at || new Date()), 'dd/MM/yyyy HH:mm')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment:</span>
              <span className="font-semibold">{sale.payment_mode}</span>
            </div>
          </div>
        </div>

        {/* Items table */}
        <table className="w-full text-xs mb-4">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="text-left py-2 font-semibold uppercase text-gray-600 text-[10px]">Description</th>
              <th className="text-center py-2 font-semibold uppercase text-gray-600 text-[10px] w-16">HSN</th>
              <th className="text-center py-2 font-semibold uppercase text-gray-600 text-[10px] w-10">Qty</th>
              <th className="text-right py-2 font-semibold uppercase text-gray-600 text-[10px] w-16">Rate</th>
              <th className="text-center py-2 font-semibold uppercase text-gray-600 text-[10px] w-12">GST%</th>
              <th className="text-right py-2 font-semibold uppercase text-gray-600 text-[10px] w-16">GST Amt</th>
              <th className="text-right py-2 font-semibold uppercase text-gray-600 text-[10px] w-16">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, i) => {
              const lineTotal = item.selling_price * item.quantity
              const gstAmt = (lineTotal * item.gst_rate) / (100 + item.gst_rate)
              return (
                <tr key={i}>
                  <td className="py-1.5 pr-2">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    {item.brand && <p className="text-gray-400 text-[10px]">{item.brand}</p>}
                  </td>
                  <td className="text-center py-1.5 text-gray-500">{item.hsn_code || '2208'}</td>
                  <td className="text-center py-1.5 font-medium">{item.quantity}</td>
                  <td className="text-right py-1.5">₹{Number(item.selling_price).toFixed(2)}</td>
                  <td className="text-center py-1.5">{item.gst_rate}%</td>
                  <td className="text-right py-1.5">₹{gstAmt.toFixed(2)}</td>
                  <td className="text-right py-1.5 font-medium">₹{lineTotal.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t-2 border-gray-800 pt-3">
          <div className="flex justify-end">
            <div className="w-56 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Taxable Value</span>
                <span>₹{(taxableValue).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">CGST</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">SGST</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm border-t border-gray-300 pt-1">
                <span>Grand Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amount in words */}
        <div className="mt-4 p-2 bg-gray-50 rounded text-xs">
          <span className="text-gray-500">Amount in words: </span>
          <span className="font-medium">Rupees {numberToWords(Math.round(total))} Only</span>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-dashed border-gray-300 text-center text-xs text-gray-400">
          <p>This is a computer-generated invoice and does not require a signature.</p>
          <p className="mt-1">Thank you for your purchase! Please drink responsibly.</p>
        </div>
      </div>
    </div>
  )
}

function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  if (num === 0) return 'Zero'
  if (num < 0) return 'Minus ' + numberToWords(-num)

  let words = ''

  if (num >= 10000000) {
    words += numberToWords(Math.floor(num / 10000000)) + ' Crore '
    num %= 10000000
  }
  if (num >= 100000) {
    words += numberToWords(Math.floor(num / 100000)) + ' Lakh '
    num %= 100000
  }
  if (num >= 1000) {
    words += numberToWords(Math.floor(num / 1000)) + ' Thousand '
    num %= 1000
  }
  if (num >= 100) {
    words += ones[Math.floor(num / 100)] + ' Hundred '
    num %= 100
  }
  if (num >= 20) {
    words += tens[Math.floor(num / 10)] + ' '
    num %= 10
  }
  if (num > 0) {
    words += ones[num] + ' '
  }

  return words.trim()
}
