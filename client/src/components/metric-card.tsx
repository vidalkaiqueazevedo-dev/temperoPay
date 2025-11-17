import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  testId?: string;
}

export function MetricCard({ title, value, icon: Icon, trend, testId }: MetricCardProps) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-mono font-medium" data-testid={`${testId}-value`}>
          {value}
        </div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className={trend.isPositive ? "text-chart-4" : "text-destructive"}>
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
            {" "}vs. mês anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
}
