import type { Invoice } from "../../types";
import InvoiceFromSOForm from "./InvoiceFromSOForm";
import InvoiceStandaloneForm from "./InvoiceStandaloneForm";

interface InvoiceFormProps {
  mode: "so" | "standalone";
  invoice?: Invoice | null;
  onInvoiceCreated: () => void;
  onCancel: () => void;
}

export default function InvoiceForm({
  mode,
  invoice,
  onInvoiceCreated,
  onCancel,
}: InvoiceFormProps) {
  // Force mode if editing existing invoice
  const effectiveMode = invoice?.salesOrderId
    ? "so"
    : invoice
    ? "standalone"
    : mode;

  if (effectiveMode === "so") {
    return (
      <InvoiceFromSOForm
        invoice={invoice}
        onInvoiceCreated={onInvoiceCreated}
        onCancel={onCancel}
      />
    );
  }

  return (
    <InvoiceStandaloneForm
      invoice={invoice}
      onInvoiceCreated={onInvoiceCreated}
      onCancel={onCancel}
    />
  );
}
