import { startOfDay, addDays, parseISO } from 'date-fns';

const NOCODB_API_BASE = "https://app.nocodb.com/api/v2/tables/mxt3sdfcmwsihnn/records";
const NOCODB_TOKEN = "nrUcWLti4g7sq9DDozerYytubAt8_7lvFEw0Ek6H";

interface NocoDBRecord {
  Id: number;
  Title: string;
  aberto: boolean | null;
  hora_inicio: string | null;
  hora_fim: string | null;
  valor: string | null;
}

export interface DayConfig {
  open: boolean;
  start: string;
  end: string;
}

export interface WeeklyConfig {
  [key: number]: DayConfig;
}

export const fetchNocoDBRecords = async (): Promise<NocoDBRecord[]> => {
  try {
    const urlWithCacheBuster = `${NOCODB_API_BASE}?limit=100&_=${new Date().getTime()}`;
    const response = await fetch(urlWithCacheBuster, {
      headers: {
        'xc-token': NOCODB_TOKEN
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.list || [];
  } catch (error) {
    console.error("❌ Erro ao buscar configurações do NocoDB:", error);
    return [];
  }
};

export const updateNocoDBRecord = async (id: number, fields: Partial<NocoDBRecord>): Promise<boolean> => {
   try {
    const response = await fetch(NOCODB_API_BASE, {
      method: 'PATCH',
      headers: {
        'xc-token': NOCODB_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Id: id,
        ...fields
      }),
    });
    return response.ok;
  } catch (error) {
    console.error(`❌ Erro ao atualizar registro NocoDB ${id}:`, error);
    return false;
  }
}

export const createNocoDBRecord = async (fields: Partial<NocoDBRecord>): Promise<boolean> => {
   try {
    const response = await fetch(NOCODB_API_BASE, {
      method: 'POST',
      headers: {
        'xc-token': NOCODB_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fields),
    });
    return response.ok;
  } catch (error) {
    console.error(`❌ Erro ao criar registro NocoDB:`, error);
    return false;
  }
}

const DEFAULT_SCHEDULE: WeeklyConfig = {
  1: { open: true, start: "08:30", end: "21:40" },
  2: { open: true, start: "08:30", end: "21:40" },
  3: { open: true, start: "08:30", end: "21:40" },
  4: { open: true, start: "08:30", end: "21:40" },
  5: { open: true, start: "08:30", end: "21:40" },
  6: { open: true, start: "09:00", end: "16:00" },
  0: { open: true, start: "09:00", end: "14:00" },
};

// Lê o estado aberto/fechado do campo "valor" (texto), pois o checkbox do NocoDB não atualiza via API
export const fetchWeeklyScheduleFromNocoDB = async (): Promise<WeeklyConfig> => {
  const records = await fetchNocoDBRecords();
  const schedule: WeeklyConfig = { ...DEFAULT_SCHEDULE };

  let foundAny = false;
  for (let i = 0; i <= 6; i++) {
    const key = `schedule_${i}`;
    const record = records.find(r => r.Title === key);
    if (record) {
      foundAny = true;
      // Usa campo "valor" para aberto/fechado. Se ainda não foi salvo (null), usa o checkbox "aberto" como fallback
      const isOpen = record.valor !== null ? record.valor === "sim" : record.aberto === true;
      schedule[i] = {
        open: isOpen,
        start: record.hora_inicio || DEFAULT_SCHEDULE[i].start,
        end: record.hora_fim || DEFAULT_SCHEDULE[i].end,
      };
    }
  }
  return foundAny ? schedule : DEFAULT_SCHEDULE;
};

// Salva o estado aberto/fechado no campo "valor" (texto) em vez do checkbox "aberto"
export const saveWeeklyScheduleToNocoDB = async (schedule: WeeklyConfig): Promise<boolean> => {
  try {
    const records = await fetchNocoDBRecords();
    let allOk = true;

    for (let i = 0; i <= 6; i++) {
      const key = `schedule_${i}`;
      const config = schedule[i];
      const record = records.find(r => r.Title === key);

      const fields = {
        Title: key,
        valor: config.open ? "sim" : "nao",
        hora_inicio: config.start,
        hora_fim: config.end
      };

      if (record) {
        const ok = await updateNocoDBRecord(record.Id, fields);
        if (!ok) allOk = false;
      } else {
        const ok = await createNocoDBRecord(fields);
        if (!ok) allOk = false;
      }
    }
    return allOk;
  } catch (e) {
    return false;
  }
};

export const fetchMaxBookingDateFromNocoDB = async (): Promise<Date> => {
  const records = await fetchNocoDBRecords();
  const record = records.find(r => r.Title === "max_booking_date");
  if (record && record.valor) {
    return startOfDay(parseISO(record.valor));
  }
  return startOfDay(addDays(new Date(), 30));
};

export const saveMaxBookingDateToNocoDB = async (dateISO: string): Promise<boolean> => {
  try {
    const records = await fetchNocoDBRecords();
    const record = records.find(r => r.Title === "max_booking_date");

    const fields = {
      Title: "max_booking_date",
      valor: dateISO
    };

    if (record) {
      return await updateNocoDBRecord(record.Id, fields);
    } else {
      return await createNocoDBRecord(fields);
    }
  } catch (e) {
    return false;
  }
}
