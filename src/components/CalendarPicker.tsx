"use client";

import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from 'date-fns/locale';
import { isBefore, startOfDay, isAfter, endOfDay, parseISO, addDays, getDay } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

import { fetchMaxBookingDateFromNocoDB } from '@/utils/nocodb';
import { fetchWeeklySchedule } from '@/utils/scheduling';

export const MAX_BOOKING_DATE_UPDATED_EVENT = 'maxBookingDateUpdated';

interface CalendarPickerProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({ selectedDate, onSelectDate }) => {
  const today = startOfDay(new Date());
  const [maxBookingDate, setMaxBookingDate] = useState<Date>(endOfDay(addDays(new Date(), 30)));
  const [weeklySchedule, setWeeklySchedule] = useState<Record<number, { open: boolean; start: string; end: string }> | null>(null);

  const updateMaxBookingDateFromAPI = async () => {
    const date = await fetchMaxBookingDateFromNocoDB();
    setMaxBookingDate(endOfDay(date));
  };

  const updateWeeklyScheduleFromAPI = async () => {
    const schedule = await fetchWeeklySchedule();
    setWeeklySchedule(schedule);
  };

  useEffect(() => {
    updateMaxBookingDateFromAPI();
    updateWeeklyScheduleFromAPI();

    const handleSettingsUpdate = () => {
      updateMaxBookingDateFromAPI();
      updateWeeklyScheduleFromAPI();
    };

    window.addEventListener(MAX_BOOKING_DATE_UPDATED_EVENT, handleSettingsUpdate);
    window.addEventListener('storage', handleSettingsUpdate);

    return () => {
      window.removeEventListener(MAX_BOOKING_DATE_UPDATED_EVENT, handleSettingsUpdate);
      window.removeEventListener('storage', handleSettingsUpdate);
    };
  }, []);

  // Enquanto não carregou as configurações, desabilita todos os dias
  const isLoading = weeklySchedule === null;
  
  return (
    <Card className="shadow-lg border-none bg-transparent">
      <CardHeader className="p-0">
        <CardTitle className="text-lg font-semibold text-foreground sr-only">Selecione a Data</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          initialFocus
          locale={ptBR}
          disabled={(date) => {
            if (isLoading) return true; // Desabilita tudo enquanto carrega
            const dayOfWeek = getDay(date);
            const isClosed = !weeklySchedule[dayOfWeek]?.open;
            return isBefore(date, today) || isAfter(date, maxBookingDate) || isClosed;
          }}
          showOutsideDays={true}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            caption: "flex justify-center pt-1 relative items-center mb-4",
            caption_label: "text-xl sm:text-2xl font-bold text-foreground tracking-tight",
            nav_button: "h-9 w-9 sm:h-10 sm:w-10 bg-transparent p-0 opacity-80 hover:opacity-100 text-primary hover:bg-accent rounded-full",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            head_row: "flex justify-between mb-2",
            head_cell: "text-muted-foreground rounded-md w-10 sm:w-14 font-semibold text-xs sm:text-sm uppercase tracking-wider",
            row: "flex w-full mt-2",
            cell: "h-10 w-10 sm:h-14 sm:w-14 text-center text-sm sm:text-base p-0 relative",
            day: "h-10 w-10 sm:h-14 sm:w-14 p-0 font-normal text-foreground rounded-full hover:bg-accent transition-colors",
            day_selected: "bg-transparent border-2 border-primary text-primary hover:bg-accent rounded-full shadow-md",
            day_today: "bg-primary/10 text-primary font-bold border-2 border-primary/20 rounded-full",
            day_outside: "text-muted-foreground opacity-30",
            day_disabled: "text-muted-foreground opacity-20 cursor-not-allowed",
          }}
        />
      </CardContent>
    </Card>
  );
};

export default CalendarPicker;