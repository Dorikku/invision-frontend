// components/PrintableInvoice.tsx
import React, { forwardRef } from "react";
import type { SalesOrder } from "@/types";

interface Props {
  salesOrder: SalesOrder;
}

const PrintableInvoice = forwardRef<HTMLDivElement, Props>(({ salesOrder }, ref) => {
  return (
    <div ref={ref} className="p-8 font-sans text-sm text-black bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">INVOICE</h1>
          <p className="text-gray-600">Invoice #: {salesOrder.orderNumber}</p>
          <p className="text-gray-600">
            Date: {new Date(salesOrder.date).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-semibold">Your Company Name</h2>
          <p>123 Business Street</p>
          <p>City, Country</p>
          <p>Email: info@company.com</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-6">
        <h3 className="font-semibold mb-1">Bill To:</h3>
        <p>{salesOrder.customerName}</p>
        {salesOrder.customerAddress && <p>{salesOrder.customerAddress}</p>}
        {salesOrder.customerEmail && <p>{salesOrder.customerEmail}</p>}
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="text-left p-2">Item</th>
            <th className="text-right p-2">Qty</th>
            <th className="text-right p-2">Unit Price</th>
            <th className="text-right p-2">Tax</th>
            <th className="text-right p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {salesOrder.items.map((item, i) => (
            <tr key={i} className="border-b">
              <td className="p-2">{item.productName}</td>
              <td className="p-2 text-right">{item.quantity}</td>
              <td className="p-2 text-right">₱ {item.unitPrice.toFixed(2)}</td>
              <td className="p-2 text-right">{(item.taxRate * 100).toFixed(0)}%</td>
              <td className="p-2 text-right">₱ {item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-1/3 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₱ {salesOrder.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>₱ {salesOrder.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>₱ {salesOrder.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {salesOrder.notes && (
        <div>
          <h3 className="font-semibold mb-1">Notes:</h3>
          <p>{salesOrder.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-gray-500 text-xs mt-12">
        Thank you for your business!
      </div>
    </div>
  );
});

export default PrintableInvoice;
