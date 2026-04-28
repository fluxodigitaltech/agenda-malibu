"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CalendarPicker from '@/components/CalendarPicker';
import TimeSlotPicker from '@/components/TimeSlotPicker';
import BookingForm from '@/components/BookingForm';
import {
  fetchAppointments,
  createAppointment,
  getAvailableSlotsForDay,
  formatToApiDate,
} from '@/utils/scheduling';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, UserCheck, PartyPopper } from 'lucide-react';
import { Link } from 'react-router-dom';

const BookingPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastBooking, setLastBooking] = useState<{name: string, date: Date, time: string} | null>(null);

  const loadAppointments = async () => {
    setLoading(true);
    const fetchedAppointments = await fetchAppointments();
    setAllAppointments(fetchedAppointments);
    setLoading(false);
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const slots = getAvailableSlotsForDay(selectedDate, allAppointments);
      setAvailableSlots(slots);
      setSelectedTime(undefined);
    }
  }, [selectedDate, allAppointments]);

  const handleBook = async (name: string, numero: string, cpf: string) => {
    if (!selectedDate || !selectedTime) {
      showError("Por favor, selecione uma data e um horário primeiro.");
      return;
    }

    setLoading(true);
    const newAppointment = {
      dia: formatToApiDate(selectedDate),
      hora: selectedTime,
      nome: name,
      numero: numero,
      cpf: cpf, // Adicionando CPF
    };

    const success = await createAppointment(newAppointment);
    if (success) {
      setLastBooking({name, date: selectedDate, time: selectedTime});
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showError("Ops! Ocorreu um erro ao agendar sua visita.");
    }
    setLoading(false);
  };

  if (isSuccess && lastBooking) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto p-4 flex items-center justify-center">
          <div className="max-w-md w-full bg-card border border-border p-8 rounded-[2.5rem] shadow-2xl text-center space-y-6 animate-in zoom-in duration-500">
            <div className="h-24 w-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="h-12 w-12" />
            </div>
            <h1 className="text-3xl font-black text-foreground">Visita Agendada!</h1>
            <p className="text-muted-foreground">Olá <span className="text-foreground font-bold">{lastBooking.name}</span>, sua visita à Malibu foi confirmada.</p>
            
            <div className="bg-muted/50 p-6 rounded-3xl space-y-4 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Data da Visita:</span>
                <span className="font-bold">{format(lastBooking.date, "dd 'de' MMMM", { locale: ptBR })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Horário:</span>
                <span className="font-bold">{lastBooking.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Local:</span>
                <span className="font-bold text-xs">Unidade Malibu Exclusive</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Link to="/">
                <Button className="w-full h-14 rounded-2xl bg-primary text-lg font-bold">Voltar para o Início</Button>
              </Link>
              <p className="text-xs text-muted-foreground">Te esperamos para uma experiência única.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD] dark:bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-4 tracking-tight">
            Agende sua <span className="text-primary">Visita</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Venha conhecer a estrutura mais moderna de São Paulo. Agende sua visita agora.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12"> {/* Adjusted gap for mobile */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 text-primary font-black text-lg sm:text-xl border border-primary/20 shadow-sm transition-transform group-hover:scale-110">1</div> {/* Adjusted size */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Escolha o Dia
                </h2>
                <p className="text-sm text-muted-foreground">Selecione o melhor dia para sua visita.</p>
              </div>
            </div>
            <div className="bg-white dark:bg-card rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/50">
              <CalendarPicker selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            </div>
          </section>

          <div className="flex flex-col gap-8 sm:gap-12"> {/* Adjusted gap for mobile */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 text-primary font-black text-lg sm:text-xl border border-primary/20 shadow-sm transition-transform group-hover:scale-110">2</div> {/* Adjusted size */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Escolha o Horário
                  </h2>
                  <p className="text-sm text-muted-foreground">Consulte a disponibilidade de vagas.</p>
                </div>
              </div>
              <div className="bg-white dark:bg-card rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/50">
                <TimeSlotPicker
                  slots={availableSlots}
                  selectedTime={selectedTime}
                  onSelectTime={setSelectedTime}
                />
              </div>
            </section>

            {selectedTime && (
              <section className="space-y-6 animate-in slide-in-from-bottom-6 duration-500">
                <div className="flex items-center gap-4 group">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 text-primary font-black text-lg sm:text-xl border border-primary/20 shadow-sm transition-transform group-hover:scale-110">3</div> {/* Adjusted size */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-primary" />
                      Confirme seus Dados
                    </h2>
                    <p className="text-sm text-muted-foreground">Preencha para garantir sua vaga no horário {selectedTime}.</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-card rounded-3xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.08)] border-2 border-primary/20">
                  <BookingForm onBook={handleBook} loading={loading} />
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingPage;