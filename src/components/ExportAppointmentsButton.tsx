import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { FormattedAppointment } from '@/utils/scheduling';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface ExportAppointmentsButtonProps {
  appointments: FormattedAppointment[];
}

const ExportAppointmentsButton: React.FC<ExportAppointmentsButtonProps> = ({ appointments }) => {
  const exportToCsv = () => {
    if (appointments.length === 0) {
      toast.info("Não há agendamentos para exportar.");
      return;
    }

    const headers = ["Data", "Hora", "Nome", "Número", "Compareceu", "Não Compareceu", "Comprou", "Reagendou"]; // Adicionado "Número"
    const csvRows = [
      headers.join(','),
      ...appointments.map(app => {
        const date = format(app.date, 'dd/MM/yyyy', { locale: ptBR });
        const time = app.time;
        const name = app.name ? `"${app.name.replace(/"/g, '""')}"` : ''; // Handle commas and quotes in names
        const numero = app.numero ? `"${app.numero.replace(/"/g, '""')}"` : ''; // Adicionado o número
        const compareceu = app.compareceu === "sim" ? "Sim" : "Não";
        const naoCompareceu = app.naoCompareceu === "nao" ? "Sim" : "Não";
        const comprou = app.comprou === "sim" ? "Sim" : "Não";
        const reagendou = app.reagendou === "sim" ? "Sim" : "Não";
        return [date, time, name, numero, compareceu, naoCompareceu, comprou, reagendou].join(','); // Incluído numero
      })
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `agendamentos_malibu_exclusive_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Agendamentos exportados com sucesso!");
  };

  return (
    <Button onClick={exportToCsv} className="bg-green-600 hover:bg-green-700 text-white shadow-md w-full sm:w-auto rounded-md h-10"> {/* Adjusted height */}
      <Download className="mr-2 h-4 w-4" /> Exportar CSV
    </Button>
  );
};

export default ExportAppointmentsButton;