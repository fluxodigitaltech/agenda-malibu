import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; // Import Card components

interface TimeSlotPickerProps {
  slots: { time: string; availableSlots: number; isPast: boolean }[];
  selectedTime: string | undefined;
  onSelectTime: (time: string) => void;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ slots, selectedTime, onSelectTime }) => {
  return (
    <Card className="shadow-lg border-none bg-transparent">
      <CardHeader className="p-0">
        <CardTitle className="text-lg font-semibold text-foreground sr-only">Horários Disponíveis</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {slots.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Nenhum horário disponível para este dia.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2"> {/* Adjusted grid for mobile */}
            {slots.map((slot) => (
              <Button
                key={slot.time}
                variant={selectedTime === slot.time ? "default" : "outline"}
                onClick={() => onSelectTime(slot.time)}
                disabled={slot.availableSlots <= 0 || slot.isPast}
                className={cn(
                  "flex flex-col h-auto py-3 px-2 text-base rounded-xl transition-all duration-200 ease-in-out transform hover:scale-105",
                  selectedTime === slot.time 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                    : "border-border text-foreground hover:bg-accent hover:border-primary",
                  (slot.availableSlots <= 0 || slot.isPast) && "opacity-40 cursor-not-allowed bg-muted text-muted-foreground border-border hover:scale-100"
                )}
              >
                <span className="font-bold tracking-wider">{slot.time}</span>
                <span className="text-xs mt-1 font-medium opacity-80">
                  {slot.availableSlots > 0 ? `${slot.availableSlots} vagas` : "Esgotado"}
                </span>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeSlotPicker;