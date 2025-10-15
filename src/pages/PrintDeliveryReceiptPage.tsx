// src/pages/PrintDeliveryReceiptPage.tsx
import { useEffect, useRef, useState } from "react";
import PrintableDeliveryReceipt from "@/components/prints/PrintableDeliveryReceipt";

export default function PrintDeliveryReceiptPage() {
  const [order, setOrder] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const orderId = window.location.pathname.split("/").pop();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/sales-orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => setOrder(data));
  }, [orderId]);

  useEffect(() => {
    if (order) setTimeout(() => window.print(), 500);
  }, [order]);

  if (!order) return <div>Loading...</div>;

  return <PrintableDeliveryReceipt ref={printRef} salesOrder={order} />;
}
