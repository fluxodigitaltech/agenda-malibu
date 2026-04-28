"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ShoppingCart, Percent } from 'lucide-react';
import { FormattedAppointment } from '@/utils/scheduling';

interface AdminMetricsCardProps {
  appointments: FormattedAppointment[];
}

const AdminMetricsCard: React.FC<AdminMetricsCardProps> = ({ appointments }) => {
  const totalAttended = appointments.filter(app => app.compareceu === "sim").length;
  const totalBought = appointments.filter(app => app.comprou === "sim").length;

  const conversionRate = totalAttended > 0 ? (totalBought / totalAttended) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Card className="shadow-md border border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Compareceram</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{totalAttended}</div>
          <p className="text-xs text-muted-foreground">Total de agendamentos que compareceram</p>
        </CardContent>
      </Card>

      <Card className="shadow-md border border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Compraram</CardTitle>
          <ShoppingCart className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{totalBought}</div>
          <p className="text-xs text-muted-foreground">Total de agendamentos que compraram</p>
        </CardContent>
      </Card>

      <Card className="shadow-md border border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
          <Percent className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{conversionRate.toFixed(2)}%</div>
          <p className="text-xs text-muted-foreground">Compraram / Compareceram</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMetricsCard;