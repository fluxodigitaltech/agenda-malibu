"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { MAX_BOOKING_DATE_UPDATED_EVENT } from './CalendarPicker';

interface DayConfig {
  open: boolean;
  start: string;
  end: string;
}

interface WeeklyConfig {
  [key: number]: DayConfig;
}

import { fetchWeeklyScheduleFromNocoDB, saveWeeklyScheduleToNocoDB } from '@/utils/nocodb';

const DEFAULT_SCHEDULE: WeeklyConfig = {
  1: { open: true, start: "08:30", end: "21:40" },
  2: { open: true, start: "08:30", end: "21:40" },
  3: { open: true, start: "08:30", end: "21:40" },
  4: { open: true, start: "08:30", end: "21:40" },
  5: { open: true, start: "08:30", end: "21:40" },
  6: { open: true, start: "09:00", end: "16:00" },
  0: { open: true, start: "09:00", end: "14:00" },
};

const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const AdminTimeSlotSettings: React.FC = () => {
  const [schedule, setSchedule] = useState<WeeklyConfig>(DEFAULT_SCHEDULE);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const scheduleData = await fetchWeeklyScheduleFromNocoDB();
        setSchedule(scheduleData);
      } catch (e) {
        console.error("Erro ao buscar schedule do NocoDB:", e);
        setSchedule(DEFAULT_SCHEDULE);
      }
    };
    loadSchedule();
  }, []);

  const handleUpdate = (dayIndex: number, field: keyof DayConfig, value: string | boolean) => {
    setSchedule(prev => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [field]: value,
      },
    }));
  };

  const dispatchUpdateEvent = () => {
    window.dispatchEvent(new Event(MAX_BOOKING_DATE_UPDATED_EVENT));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await saveWeeklyScheduleToNocoDB(schedule);
      if (success) {
        toast.success("Horários de funcionamento salvos com sucesso!");
      } else {
        toast.error("Falha ao salvar horários no sistema.");
      }
      
      dispatchUpdateEvent();
    } catch (e) {
      toast.error("Erro ao salvar horários.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    try {
      const success = await saveWeeklyScheduleToNocoDB(DEFAULT_SCHEDULE);
      if (success) {
        setSchedule(DEFAULT_SCHEDULE);
        toast.info("Horários resetados para o padrão.");
      } else {
        toast.error("Falha ao resetar horários.");
      }
      dispatchUpdateEvent();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Horários Semanais</h3>
      <p className="text-sm text-muted-foreground">Configure os horários de funcionamento para cada dia.</p>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-3 -mr-3">
        {dayNames.map((name, index) => {
          const dayConfig = schedule[index] || { open: false, start: "00:00", end: "00:00" };
          return (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3 sm:gap-4 p-2 border border-transparent rounded-xl transition-colors hover:bg-background/50"> {/* Adjusted grid for mobile */}
              <div className="col-span-1 flex items-center gap-3">
                <Switch
                  id={`day-switch-${index}`}
                  checked={dayConfig.open}
                  onCheckedChange={(checked) => handleUpdate(index, 'open', checked)}
                  className="data-[state=checked]:bg-primary"
                />
                <Label htmlFor={`day-switch-${index}`} className="font-semibold text-foreground truncate">
                  {name}
                </Label>
              </div>
              
              <div className="col-span-1 sm:col-span-2 flex items-center gap-2"> {/* Adjusted col-span for mobile */}
                <Input
                  id={`start-${index}`}
                  type="time"
                  value={dayConfig.start}
                  onChange={(e) => handleUpdate(index, 'start', e.target.value)}
                  disabled={!dayConfig.open}
                  className="h-9 bg-input border-border text-foreground w-full rounded-lg"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  id={`end-${index}`}
                  type="time"
                  value={dayConfig.end}
                  onChange={(e) => handleUpdate(index, 'end', e.target.value)}
                  disabled={!dayConfig.open}
                  className="h-9 bg-input border-border text-foreground w-full rounded-lg"
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-2 pt-4"> {/* Stack buttons on small screens */}
        <Button onClick={handleSave} disabled={isSaving} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-10"> {/* Adjusted height */}
          <Save className="mr-2 h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Horários"}
        </Button>
        <Button onClick={handleReset} disabled={isSaving} variant="outline" className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground rounded-xl h-10"> {/* Adjusted height */}
          <RotateCcw className="mr-2 h-4 w-4" /> Resetar Padrão
        </Button>
      </div>
    </div>
  );
};

export default AdminTimeSlotSettings;