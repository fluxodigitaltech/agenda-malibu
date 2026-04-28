"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, parseISO, startOfDay, addDays, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { MAX_BOOKING_DATE_UPDATED_EVENT } from './CalendarPicker';

import { fetchMaxBookingDateFromNocoDB, saveMaxBookingDateToNocoDB } from '@/utils/nocodb';

const AdminCalendarSettings: React.FC = () => {
  const [selectedMaxDate, setSelectedMaxDate] = useState<Date | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadDate = async () => {
      const date = await fetchMaxBookingDateFromNocoDB();
      setSelectedMaxDate(date);
    };
    loadDate();
  }, []);

  const dispatchUpdateEvent = () => {
    window.dispatchEvent(new Event(MAX_BOOKING_DATE_UPDATED_EVENT));
  };

  const handleSave = async () => {
    if (selectedMaxDate) {
      setIsSaving(true);
      try {
        const dateISO = selectedMaxDate.toISOString();
        const success = await saveMaxBookingDateToNocoDB(dateISO);
        if (success) {
          toast.success("Data limite salva com sucesso!");
        } else {
          toast.error("Falha ao salvar data limite.");
        }
        dispatchUpdateEvent();
      } finally {
        setIsSaving(false);
      }
    } else {
      toast.error("Por favor, selecione uma data limite.");
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    try {
      const defaultDate = startOfDay(addDays(new Date(), 30));
      const success = await saveMaxBookingDateToNocoDB(defaultDate.toISOString());
      if (success) {
        setSelectedMaxDate(defaultDate);
        toast.info("Data limite resetada para o padrão.");
        dispatchUpdateEvent();
      } else {
        toast.error("Falha ao resetar data limite.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const today = startOfDay(new Date());

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Limite de Agendamento</h3>
      <p className="text-sm text-muted-foreground">Defina a data máxima futura que os clientes podem agendar.</p>
      <div className="flex flex-col items-start gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal border-border bg-input text-foreground hover:bg-accent hover:text-accent-foreground h-10 sm:h-11 rounded-xl", // Adjusted height
                !selectedMaxDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedMaxDate ? format(selectedMaxDate, "PPP", { locale: ptBR }) : <span>Escolha a data limite</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card border border-border" align="start">
            <Calendar
              mode="single"
              selected={selectedMaxDate}
              onSelect={setSelectedMaxDate}
              initialFocus
              locale={ptBR}
              disabled={(date) => isBefore(date, today)}
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium text-foreground",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 text-primary hover:bg-accent",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-foreground",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
                day_today: "bg-accent text-accent-foreground font-semibold",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-40 cursor-not-allowed",
              }}
            />
          </PopoverContent>
        </Popover>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full"> {/* Stack buttons on small screens */}
          <Button onClick={handleSave} disabled={isSaving} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10"> {/* Adjusted height */}
            <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar"}
          </Button>
          <Button onClick={handleReset} disabled={isSaving} variant="outline" className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground rounded-xl h-10"> {/* Adjusted height */}
            <RotateCcw className="mr-2 h-4 w-4" /> Resetar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminCalendarSettings;