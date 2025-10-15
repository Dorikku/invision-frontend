import React, { forwardRef } from "react";

interface PrintableDeliveryReceiptProps {
  salesOrder: any; // your SalesOrder type
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    logo?: string;
    registrationNumber?: string;
  };
}

const PrintableDeliveryReceipt = forwardRef<HTMLDivElement, PrintableDeliveryReceiptProps>(
  ({ salesOrder, companyInfo }, ref) => {
    const defaultCompanyInfo = {
      name: "PENTAMAX ELECTRICAL SUPPLY",
      address: "Arty 1 Subdivision Brgy. Talipapa Novaliches Quezon City",
      phone: "0916 453 8406",
      email: "pentamaxelectrical@gmail.com",
      website: "www.pentamax.com",
      registrationNumber: "314-359-848-00000",
      logo: "3.png",
    };

    const company = companyInfo || defaultCompanyInfo;

    const formatDate = (dateString?: string) =>
      dateString
        ? new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "—";

    const formatCurrency = (amount: number) =>
      `₱${amount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    return (
      <>
        <style>
          {`
            @media print {
              @page { size: A4; margin: 0; }
              body { -webkit-print-color-adjust: exact; }
              .print-container { width: 210mm; min-height: 297mm; padding: 15mm; margin: 0; box-shadow: none; }
              .no-print { display: none !important; }
            }
            @media screen {
              .print-container { box-shadow: 0 0 10px rgba(0,0,0,0.1); margin: 60px auto; }
            }
          `}
        </style>

        <div ref={ref} className="print-container bg-white p-8 max-w-[210mm] mx-auto">
          {/* Header */}
          <div className="mb-8 border-b-2 border-gray-800 pb-6 flex justify-between items-start">
            <div className="flex">
              {company.logo && <img src={company.logo} alt={company.name} className="h-24 mr-4" />}
              <div className="text-sm text-gray-600 space-y-1 mt-2">
                <div className="font-bold text-lg text-gray-900">{company.name}</div>
                <div>{company.address}</div>
                <div>Phone: {company.phone}</div>
                <div>Email: {company.email}</div>
                {company.registrationNumber && (
                  <div>TIN #: {company.registrationNumber}</div>
                )}
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">
                Delivery Receipt
              </h1>
              <div className="mt-4 space-y-1 text-sm text-gray-600">
                <div><strong>DR No:</strong> {salesOrder.orderNumber}</div>
                <div><strong>Date:</strong> {formatDate(salesOrder.deliveryDate || salesOrder.date)}</div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Delivered To:</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <div className="font-semibold text-base">{salesOrder.customerName}</div>
                {salesOrder.customerAddress && (
                  <div className="whitespace-pre-line">{salesOrder.customerAddress}</div>
                )}
                {salesOrder.customerEmail && <div>{salesOrder.customerEmail}</div>}
                {salesOrder.customerContactPerson && (
                  <div>Attn: {salesOrder.customerContactPerson}</div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Sales Info:</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <div><strong>Salesperson:</strong> {salesOrder.salesPersonName || "—"}</div>
                <div><strong>Shipment Status:</strong> {salesOrder.shipmentStatus}</div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse mb-8">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="text-left py-3 px-2 text-sm font-bold text-gray-900 uppercase">Item</th>
                <th className="text-right py-3 px-2 text-sm font-bold text-gray-900 uppercase w-24">Qty</th>
                <th className="text-right py-3 px-2 text-sm font-bold text-gray-900 uppercase w-32">Unit Price</th>
                <th className="text-right py-3 px-2 text-sm font-bold text-gray-900 uppercase w-32">Amount</th>
              </tr>
            </thead>
            <tbody>
              {salesOrder.items && salesOrder.items.length > 0 ? (
                salesOrder.items.map((item: any, i: number) => (
                  <tr key={i} className="border-b border-gray-300">
                    <td className="py-3 px-2 text-sm text-gray-700">{item.productName}</td>
                    <td className="py-3 px-2 text-sm text-gray-700 text-right">{item.shippedQuantity || item.quantity}</td>
                    <td className="py-3 px-2 text-sm text-gray-700 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 px-2 text-sm text-gray-700 text-right font-medium">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500 text-sm">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Signature Section */}
          <div className="grid grid-cols-2 gap-16 mt-16">
            <div>
              <div className="text-sm text-gray-600 mb-2">Delivered by:</div>
              <div className="border-t border-gray-400 w-64 mt-8"></div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-2">Received by:</div>
              <div className="border-t border-gray-400 w-64 mt-8"></div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 mt-16">
            This serves as proof of delivery for Sales Order #{salesOrder.orderNumber}
          </div>
        </div>
      </>
    );
  }
);

PrintableDeliveryReceipt.displayName = "PrintableDeliveryReceipt";

export default PrintableDeliveryReceipt;
