import { format, parseISO, isBefore, startOfDay, addMinutes, isSameDay, isWithinInterval, setHours, setMinutes, getDay, parse } from 'date-fns';
import { fetchWeeklyScheduleFromNocoDB, WeeklyConfig } from './nocodb';

// Nova URL da API do Sheety
const API_BASE_URL = "https://api.sheety.co/d2c4ecf84f2a11c796effcbd102687ad/agendamento/agenda";
const MAX_PEOPLE_PER_SLOT = 3;

// Cache global para configurações
let cachedSettings: WeeklyConfig | null = null;

const DEFAULT_SCHEDULE: WeeklyConfig = {
  1: { open: true, start: "08:30", end: "21:40" }, // Seg
  2: { open: true, start: "08:30", end: "21:40" }, // Ter
  3: { open: true, start: "08:30", end: "21:40" }, // Qua
  4: { open: true, start: "08:30", end: "21:40" }, // Qui
  5: { open: true, start: "08:30", end: "21:40" }, // Sex
  6: { open: true, start: "09:00", end: "16:00" }, // Sáb
  0: { open: true, start: "09:00", end: "14:00" }, // Dom
};

// Função para inicializar configurações globais
export const initializeSettings = async () => {
  cachedSettings = await fetchWeeklyScheduleFromNocoDB();
};

// Função assíncrona para buscar a configuração semanal SEMPRE da API
export const fetchWeeklySchedule = async (): Promise<WeeklyConfig> => {
  try {
    const schedule = await fetchWeeklyScheduleFromNocoDB();
    cachedSettings = schedule;
    return schedule;
  } catch (e) {
    console.error("Erro ao buscar schedule da API, usando fallback.");
  }
  return DEFAULT_SCHEDULE;
};

// Função síncrona para carregar a configuração semanal (usa cache)
export const getWeeklySchedule = (): WeeklyConfig => {
  if (cachedSettings) return cachedSettings;
  return DEFAULT_SCHEDULE;
};


// Interface para os dados internos da aplicação (sem o espaço no 'dia' e usando "" para não-definido)
interface Appointment {
  dia: string; // "DD/MM/YYYY"
  hora: string; // "HH:MM"
  nome: string; // Name is now mandatory
  numero: string; // New mandatory field for phone number
  cpf: string; // New mandatory field for CPF
  compareceu?: "sim" | ""; // Alterado para ""
  naoCompareceu?: "nao" | ""; // Alterado para ""
  comprou?: "sim" | ""; // Alterado para ""
  reagendou?: "sim" | ""; // Alterado para ""
}

// Interface para o payload enviado/recebido da API (com o espaço no 'dia' e usando "" para não-definido)
export interface ApiAppointmentPayload { // Exportado para uso em AdminPage
  id?: number; // Sheety Object ID
  dia: string | null; // Corrigido: sem espaço no final
  hora: string;
  nome: string; // Tornando nome obrigatório
  numero: string; // Tornando numero obrigatório
  cpf: string; // Tornando CPF obrigatório
  compareceu?: "sim" | ""; // Alterado para ""
  naoCompareceu?: "nao" | ""; // Alterado para ""
  comprou?: "sim" | ""; // Alterado para ""
  reagendou?: "sim" | ""; // Alterado para ""
}

export interface FormattedAppointment {
  id: number; // Este ID deve vir da API do Sheety
  date: Date;
  time: string;
  name: string; // Name is now mandatory
  numero: string; // New mandatory field for phone number
  cpf: string; // New mandatory field for CPF
  compareceu: "sim" | ""; // Alterado para ""
  naoCompareceu: "nao" | ""; // Alterado para ""
  comprou: "sim" | ""; // Alterado para ""
  reagendou: "sim" | ""; // Alterado para ""
}

// Helper to parse API date string "DD/MM/YYYY" to Date object
const parseApiDate = (dateString: string, timeString: string): Date => {
  const [day, month, year] = dateString.split('/').map(Number);
  const [hours, minutes] = timeString.split(':').map(Number);
  // Note: Month is 0-indexed in Date constructor
  return new Date(year, month - 1, day, hours, minutes);
};

// Helper to format Date object to API date string "DD/MM/YYYY"
const formatToApiDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy');
};

// Helper to format Date object to API time string "HH:MM"
const formatToApiTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

export const fetchAppointments = async (): Promise<FormattedAppointment[]> => {
  try {
    const urlWithCacheBuster = `${API_BASE_URL}?_=${new Date().getTime()}`;
    const response = await fetch(urlWithCacheBuster);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const rawData: ApiAppointmentPayload[] = data.agenda; // Acessa a propriedade 'agenda'

    const cleanedData: FormattedAppointment[] = rawData
      .filter(item => 
        // Apenas exige que 'dia' e 'id' estejam presentes e sejam válidos
        item.hasOwnProperty("dia") && item.dia !== null && String(item.dia).trim() !== '' &&
        item.hasOwnProperty("id") && typeof item.id === 'number'
      ) 
      .map((item) => {
        return {
          id: item.id!, // O ID deve vir da API do Sheety
          date: parseApiDate(String(item.dia).trim(), item.hora.trim()), // Corrigido: item.dia
          time: item.hora.trim(),
          name: item.nome ? item.nome.trim() : '', // Trata nome como opcional, default para string vazia
          numero: item.numero ? item.numero.trim() : '', // Trata numero como opcional, default para string vazia
          cpf: item.cpf ? item.cpf.trim() : '', // Adicionado CPF
          compareceu: item.compareceu === "sim" ? "sim" : "", // Alterado para ""
          naoCompareceu: item.naoCompareceu === "nao" ? "nao" : "", // Alterado para ""
          comprou: item.comprou === "sim" ? "sim" : "", // Alterado para ""
          reagendou: item.reagendou === "sim" ? "sim" : "", // Alterado para ""
        };
      });
    
    // Deduplicar por Sheety ID e também por conteúdo lógico (data, hora, nome, numero)
    // Prioriza o primeiro agendamento encontrado para um conjunto lógico de dia/hora/nome/numero
    const seenLogicalAppointments = new Map<string, FormattedAppointment>();
    cleanedData.forEach(app => {
      const logicalKey = `${format(app.date, 'yyyy-MM-dd')}-${app.time}-${app.name.toLowerCase()}-${app.numero}-${app.cpf}`;
      if (!seenLogicalAppointments.has(logicalKey)) {
        seenLogicalAppointments.set(logicalKey, app);
      } else {
        // console.warn("⚠️ Agendamento lógico duplicado encontrado e filtrado durante o fetch:", app); // Removido console.warn
      }
    });

    const uniqueAppointments = Array.from(seenLogicalAppointments.values());
    return uniqueAppointments;
  } catch (error) {
    console.error("❌ Erro ao buscar agendamentos:", error);
    return [];
  }
};

export const createAppointment = async (appointment: Appointment): Promise<boolean> => {
  try {
    const payload: ApiAppointmentPayload = {
      dia: appointment.dia, // Corrigido: sem espaço
      hora: appointment.hora,
      nome: appointment.nome, // Name is now mandatory
      numero: appointment.numero, // Numero is now mandatory
      cpf: appointment.cpf, // CPF is now mandatory
      compareceu: appointment.compareceu === "sim" ? "sim" : "", // Alterado para ""
      naoCompareceu: appointment.naoCompareceu === "nao" ? "nao" : "", // Alterado para ""
      comprou: appointment.comprou === "sim" ? "sim" : "", // Alterado para ""
      reagendou: appointment.reagendou === "sim" ? "sim" : "", // Alterado para ""
    };
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agenda: payload }), // Envolve o payload em 'agenda'
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error Response (POST):", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    const responseData = await response.json();
    return true;
  } catch (error) {
    console.error("❌ Erro ao criar agendamento:", error);
    return false;
  }
};

export const updateAppointment = async (
  id: number, // Sheety Object ID
  set: Partial<ApiAppointmentPayload> // Payload direto para a API
): Promise<boolean> => {
  try {
    const url = `${API_BASE_URL}/${id}`; // Constrói a URL para o método PUT
    const payload = { agenda: set }; // Envolve o payload em 'agenda'

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error Response (PUT):", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    const responseData = await response.json();
    return true;
  } catch (error: any) {
    console.error('❌ Erro na atualização:', error.message);
    return false;
  }
};

export const deleteAppointment = async (id: number): Promise<boolean> => {
  try {
    const url = `${API_BASE_URL}/${id}`; // Constrói a URL para o método DELETE
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error Response (DELETE):", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    // Sheety DELETE geralmente retorna um objeto vazio ou o ID do item excluído
    // Não há necessidade de parsear o JSON se a resposta for 204 No Content
    return true;
  } catch (error: any) {
    console.error('❌ Erro na exclusão:', error.message);
    return false;
  }
};

// Helper para adicionar um atraso (mantido, mas não usado em deleteAllAppointments)
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const deleteAllAppointments = async (): Promise<boolean> => {
  try {
    const all = await fetchAppointments();
    if (all.length === 0) {
      console.log("Nenhum agendamento para excluir.");
      return true;
    }

    let allSuccessful = true;
    for (const app of all) {
      const success = await deleteAppointment(app.id);
      if (!success) {
        allSuccessful = false;
        console.error(`Falha ao excluir agendamento com ID: ${app.id}`);
      }
      // await delay(0); // Atraso removido
    }

    if (!allSuccessful) {
      console.error("Alguns agendamentos não puderam ser excluídos.");
    }
    return allSuccessful;
  } catch (error) {
    console.error("Erro ao excluir todos os agendamentos:", error);
    return false;
  }
};

export const generateTimeSlots = (date: Date): Date[] => {
  const slots: Date[] = [];
  const intervalMinutes = 20;
  const dayOfWeek = getDay(date); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  const schedule = getWeeklySchedule();
  const config = schedule[dayOfWeek];

  if (!config || !config.open) {
    return []; // Dia fechado
  }

  const [startHour, startMinute] = config.start.split(':').map(Number);
  const [endHour, endMinute] = config.end.split(':').map(Number);

  let currentTime = setMinutes(setHours(startOfDay(date), startHour), startMinute);
  const endTime = setMinutes(setHours(startOfDay(date), endHour), endMinute);

  // Generate slots until the current time is past the end time
  // Add 1 minute to endTime to ensure the last slot (e.g., 21:40) is included if it's exactly the end time.
  while (isBefore(currentTime, addMinutes(endTime, 1))) { 
    slots.push(currentTime);
    currentTime = addMinutes(currentTime, intervalMinutes);
  }
  return slots;
};

export const getAvailableSlotsForDay = (
  selectedDate: Date,
  allAppointments: FormattedAppointment[]
): { time: string; availableSlots: number; isPast: boolean }[] => {
  const generatedSlots = generateTimeSlots(selectedDate);
  const now = new Date();

  const slotsWithAvailability = generatedSlots.map(slotDate => {
    const timeString = format(slotDate, 'HH:mm');
    const bookingsForSlot = allAppointments.filter(app =>
      isSameDay(app.date, selectedDate) && app.time === timeString
    ).length;

    const isPast = isBefore(slotDate, now);

    return {
      time: timeString,
      availableSlots: MAX_PEOPLE_PER_SLOT - bookingsForSlot,
      isPast,
    };
  });

  return slotsWithAvailability;
};

export const getBookedAppointmentsForDay = (
  selectedDate: Date,
  allAppointments: FormattedAppointment[]
): FormattedAppointment[] => {
  return allAppointments.filter(app => isSameDay(app.date, selectedDate));
};

export { formatToApiDate, formatToApiTime };