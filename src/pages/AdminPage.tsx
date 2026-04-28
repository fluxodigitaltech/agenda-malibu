"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import { fetchAppointments, updateAppointment, deleteAppointment, deleteAllAppointments, FormattedAppointment } from '@/utils/scheduling';
import { format, isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar as CalendarIcon, X, Phone, Trash2, UserCircle, LayoutDashboard, UserX, Download, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import ExportAppointmentsButton from '@/components/ExportAppointmentsButton';
import AdminCalendarSettings from '@/components/AdminCalendarSettings';
import AdminTimeSlotSettings from '@/components/AdminTimeSlotSettings';
import AdminMetricsCard from '@/components/AdminMetricsCard';
import { ApiAppointmentPayload } from '@/utils/scheduling';
import { DateRange } from "react-day-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminPage = () => {
  const [appointments, setAppointments] = useState<FormattedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [onlyAbsentees, setOnlyAbsentees] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const loadAppointments = async () => {
    setLoading(true);
    const fetchedAppointments = await fetchAppointments();
    fetchedAppointments.sort((a, b) => a.date.getTime() - b.date.getTime());
    setAppointments(fetchedAppointments);
    setLoading(false);
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const uniqueFilteredAppointments = useMemo(() => {
    let currentAppointments = appointments;

    // Filtro de Busca (Nome ou Telefone)
    if (searchTerm) {
      currentAppointments = currentAppointments.filter(app =>
        app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.numero?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de Período (Data Inicial e Final)
    if (dateRange?.from) {
      const start = startOfDay(dateRange.from);
      const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
      
      currentAppointments = currentAppointments.filter(app => 
        isWithinInterval(app.date, { start, end })
      );
    }

    // Filtro de Faltas (Remarketing)
    if (onlyAbsentees) {
      currentAppointments = currentAppointments.filter(app => app.naoCompareceu === "nao");
    }

    const seen = new Set<string>();
    return currentAppointments.filter(app => {
      const key = `${app.name}-${app.numero}-${format(app.date, 'yyyyMMdd')}-${app.time}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [appointments, searchTerm, dateRange, onlyAbsentees]);

  const handleUpdateAppointment = async (
    app: FormattedAppointment,
    field: 'compareceu' | 'naoCompareceu' | 'comprou' | 'reagendou',
    value: boolean
  ) => {
    if (app.id === undefined) return;
    const setPayload: Partial<ApiAppointmentPayload> = {
      [field]: value ? (field === 'naoCompareceu' ? "nao" : "sim") : ""
    };
    const success = await updateAppointment(app.id, setPayload);
    if (success) {
      toast.success("Atualizado!");
      await loadAppointments();
    } else {
      toast.error("Erro ao salvar.");
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    const success = await deleteAppointment(id);
    if (success) {
      toast.success("Agendamento removido.");
      await loadAppointments();
    } else {
      toast.error("Erro ao excluir.");
    }
  };

  const handleClearAllAppointments = async () => {
    setIsDeletingAll(true);
    const success = await deleteAllAppointments();
    if (success) {
      toast.success("Todos os agendamentos foram removidos.");
      await loadAppointments();
    } else {
      toast.error("Erro ao remover todos os agendamentos.");
    }
    setIsDeletingAll(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB] dark:bg-background">
      <Header />
      <main className="flex-grow container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              Painel de Controle
            </h1>
            <p className="text-muted-foreground mt-1">Gestão inteligente da sua academia Malibu Exclusive.</p>
          </div>
        </div>

        {/* Agenda Settings Section */}
        <Card className="mb-8 shadow-lg border-border/50 rounded-3xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              Configurações da Agenda
            </CardTitle>
            <p className="text-muted-foreground">Ajuste os limites de data e os horários de funcionamento da academia.</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-5 gap-8 pt-2">
            <div className="lg:col-span-2 p-4 rounded-2xl bg-muted/30">
              <AdminCalendarSettings />
            </div>
            <div className="lg:col-span-3 p-4 rounded-2xl bg-muted/30">
              <AdminTimeSlotSettings />
            </div>
          </CardContent>
        </Card>

        {/* Resumo de Métricas */}
        <AdminMetricsCard appointments={uniqueFilteredAppointments} />

        {/* Barra de Ferramentas Reforçada */}
        <div className="bg-white dark:bg-card p-4 sm:p-6 rounded-3xl border border-border/50 shadow-sm mb-6 space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou celular..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-muted/30 border-none rounded-2xl text-base focus-visible:ring-primary"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn(
                    "h-12 px-5 rounded-2xl border-dashed border-2 flex-grow md:flex-grow-0",
                    dateRange && "border-primary text-primary bg-primary/5"
                  )}>
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM")} - {format(dateRange.to, "dd/MM")}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      "Selecionar Período"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar 
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              
              {(dateRange || searchTerm || onlyAbsentees) && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setDateRange(undefined);
                    setSearchTerm('');
                    setOnlyAbsentees(false);
                  }} 
                  className="h-12 w-12 p-0 rounded-2xl hover:bg-destructive/10 text-destructive"
                  title="Limpar Filtros"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/50">
            <div className="flex items-center gap-4">
              <Button
                variant={onlyAbsentees ? "default" : "outline"}
                onClick={() => setOnlyAbsentees(!onlyAbsentees)}
                className={cn(
                  "h-10 rounded-xl gap-2 transition-all",
                  onlyAbsentees ? "bg-red-600 hover:bg-red-700" : "hover:border-red-500 hover:text-red-500"
                )}
              >
                <UserX className="h-4 w-4" />
                Filtrar Faltas (Remarketing)
              </Button>
              {onlyAbsentees && (
                <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                  {uniqueFilteredAppointments.length} leads para contato
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <ExportAppointmentsButton appointments={uniqueFilteredAppointments} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="bg-destructive hover:bg-destructive/90 text-white shadow-md w-full sm:w-auto rounded-md h-10"
                    disabled={isDeletingAll || appointments.length === 0}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> 
                    {isDeletingAll ? "Excluindo..." : "Excluir Todos"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl border-none">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente todos os agendamentos da sua base de dados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAllAppointments} className="bg-destructive hover:bg-destructive/90 rounded-xl">Sim, excluir todos</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Tabela de Agendamentos (Desktop) */}
        <Card className="rounded-3xl border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden hidden md:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30 border-b border-border/50">
                  <TableRow className="h-14">
                    <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-widest px-4 md:px-8">Cliente</TableHead>
                    <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-widest text-center px-4">Horário</TableHead>
                    <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-widest text-center px-4">Status Presença</TableHead>
                    <TableHead className="font-bold text-muted-foreground uppercase text-xs tracking-widest text-center px-4">Venda</TableHead>
                    <TableHead className="text-right px-4 md:px-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}><TableCell colSpan={5} className="py-8 px-4 md:px-8"><Skeleton className="h-12 w-full rounded-xl" /></TableCell></TableRow>
                    ))
                  ) : uniqueFilteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-24 text-muted-foreground">
                        <UserCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">Nenhum lead encontrado para estes filtros.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    uniqueFilteredAppointments.map((app) => (
                      <TableRow key={app.id} className="group hover:bg-primary/[0.02] transition-colors border-b border-border/30 last:border-0 h-auto min-h-24 py-2">
                        <TableCell className="px-4 md:px-8 py-4">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-base sm:text-lg shadow-sm flex-shrink-0">
                              {app.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground text-base sm:text-lg uppercase leading-tight">{app.name}</span>
                              <span className="text-muted-foreground text-xs sm:text-sm flex items-center gap-1 mt-1 font-medium">
                                <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {app.numero}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center px-4 py-4">
                          <div className="flex flex-col items-center">
                            <span className="text-xs sm:text-sm font-semibold text-muted-foreground mb-1">{format(app.date, 'dd/MM/yyyy')}</span>
                            <Badge className="bg-primary hover:bg-primary font-black px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm shadow-sm rounded-lg">{app.time}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                            <label className={cn(
                              "flex items-center gap-2 cursor-pointer px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl border-2 transition-all w-full sm:w-auto justify-center",
                              app.compareceu === "sim" ? "bg-green-500/10 border-green-500/50 text-green-700" : "bg-muted/20 border-transparent hover:border-muted-foreground/20"
                            )}>
                              <Checkbox
                                checked={app.compareceu === "sim"}
                                onCheckedChange={(c) => handleUpdateAppointment(app, 'compareceu', c as boolean)}
                                className="w-4 h-4 sm:w-5 sm:h-5 border-green-600 data-[state=checked]:bg-green-600 rounded-md"
                              />
                              <span className="text-xs font-black uppercase tracking-wider">Presente</span>
                            </label>
                            <label className={cn(
                              "flex items-center gap-2 cursor-pointer px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl border-2 transition-all w-full sm:w-auto justify-center",
                              app.naoCompareceu === "nao" ? "bg-red-500/10 border-red-500/50 text-red-700" : "bg-muted/20 border-transparent hover:border-muted-foreground/20"
                            )}>
                              <Checkbox
                                checked={app.naoCompareceu === "nao"}
                                onCheckedChange={(c) => handleUpdateAppointment(app, 'naoCompareceu', c as boolean)}
                                className="w-4 h-4 sm:w-5 sm:h-5 border-red-600 data-[state=checked]:bg-red-600 rounded-md"
                              />
                              <span className="text-xs font-black uppercase tracking-wider">Faltou</span>
                            </label>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <div className="flex justify-center">
                            <label className={cn(
                              "flex items-center gap-2 cursor-pointer px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl border-2 transition-all",
                              app.comprou === "sim" ? "bg-blue-500/10 border-blue-500/50 text-blue-700" : "bg-muted/20 border-transparent hover:border-muted-foreground/20"
                            )}>
                              <Checkbox
                                checked={app.comprou === "sim"}
                                onCheckedChange={(c) => handleUpdateAppointment(app, 'comprou', c as boolean)}
                                className="w-4 h-4 sm:w-5 sm:h-5 border-blue-600 data-[state=checked]:bg-blue-600 rounded-md"
                              />
                              <span className="text-xs font-black uppercase tracking-wider">Venda</span>
                            </label>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-4 md:px-8 py-4">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 h-10 w-10">
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-3xl border-none">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover Agendamento?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Isso apagará permanentemente os dados de <strong>{app.name}</strong>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteAppointment(app.id!)} className="bg-destructive hover:bg-destructive/90 rounded-xl">Sim, remover</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Agendamentos (Mobile) */}
        <div className="md:hidden space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i} className="p-4 rounded-2xl shadow-sm border border-border/50 bg-card">
                <Skeleton className="h-24 w-full rounded-xl" />
              </Card>
            ))
          ) : uniqueFilteredAppointments.length === 0 ? (
            <Card className="p-8 rounded-2xl shadow-sm border border-border/50 bg-card text-center text-muted-foreground">
              <UserCircle className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-base font-medium">Nenhum lead encontrado para estes filtros.</p>
            </Card>
          ) : (
            uniqueFilteredAppointments.map((app) => (
              <Card key={app.id} className="p-4 rounded-2xl shadow-sm border border-border/50 bg-card">
                <CardHeader className="flex flex-row items-center justify-between p-0 pb-3 border-b border-border/30 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-base shadow-sm flex-shrink-0">
                      {app.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <CardTitle className="font-bold text-foreground text-base uppercase leading-tight">{app.name}</CardTitle>
                      <span className="text-muted-foreground text-xs flex items-center gap-1 mt-1 font-medium">
                        <Phone className="h-3 w-3" /> {app.numero}
                      </span>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl border-none">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover Agendamento?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Isso apagará permanentemente os dados de <strong>{app.name}</strong>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteAppointment(app.id!)} className="bg-destructive hover:bg-destructive/90 rounded-xl">Sim, remover</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Data:</span>
                    <span className="font-semibold text-foreground">{format(app.date, 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Horário:</span>
                    <Badge className="bg-primary hover:bg-primary font-black px-2 py-0.5 text-xs shadow-sm rounded-lg">{app.time}</Badge>
                  </div>
                  <div className="flex flex-col gap-2 pt-3 border-t border-border/30 mt-3">
                    <label className={cn(
                      "flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border-2 transition-all w-full justify-center",
                      app.compareceu === "sim" ? "bg-green-500/10 border-green-500/50 text-green-700" : "bg-muted/20 border-transparent hover:border-muted-foreground/20"
                    )}>
                      <Checkbox
                        checked={app.compareceu === "sim"}
                        onCheckedChange={(c) => handleUpdateAppointment(app, 'compareceu', c as boolean)}
                        className="w-4 h-4 border-green-600 data-[state=checked]:bg-green-600 rounded-md"
                      />
                      <span className="text-xs font-black uppercase tracking-wider">Presente</span>
                    </label>
                    <label className={cn(
                      "flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border-2 transition-all w-full justify-center",
                      app.naoCompareceu === "nao" ? "bg-red-500/10 border-red-500/50 text-red-700" : "bg-muted/20 border-transparent hover:border-muted-foreground/20"
                    )}>
                      <Checkbox
                        checked={app.naoCompareceu === "nao"}
                        onCheckedChange={(c) => handleUpdateAppointment(app, 'naoCompareceu', c as boolean)}
                        className="w-4 h-4 border-red-600 data-[state=checked]:bg-red-600 rounded-md"
                      />
                      <span className="text-xs font-black uppercase tracking-wider">Faltou</span>
                    </label>
                    <label className={cn(
                      "flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border-2 transition-all w-full justify-center",
                      app.comprou === "sim" ? "bg-blue-500/10 border-blue-500/50 text-blue-700" : "bg-muted/20 border-transparent hover:border-muted-foreground/20"
                    )}>
                      <Checkbox
                        checked={app.comprou === "sim"}
                        onCheckedChange={(c) => handleUpdateAppointment(app, 'comprou', c as boolean)}
                        className="w-4 h-4 border-blue-600 data-[state=checked]:bg-blue-600 rounded-md"
                      />
                      <span className="text-xs font-black uppercase tracking-wider">Venda</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;