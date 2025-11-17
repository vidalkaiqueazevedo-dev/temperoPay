import { Badge } from "@/components/ui/badge";
import { type PaymentStatus } from "@shared/schema";

interface StatusBadgeProps {
  status: PaymentStatus;
  size?: "default" | "sm";
}

export function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  const variants: Record<PaymentStatus, { label: string; variant: "default" | "outline" | "secondary" }> = {
    pago: { label: "Pago", variant: "default" },
    fiado: { label: "Fiado", variant: "outline" },
    parcial: { label: "Parcial", variant: "secondary" },
  };

  const { label, variant } = variants[status];

  return (
    <Badge 
      variant={variant} 
      className={size === "sm" ? "text-xs" : ""}
      data-testid={`badge-status-${status}`}
    >
      {label}
    </Badge>
  );
}
