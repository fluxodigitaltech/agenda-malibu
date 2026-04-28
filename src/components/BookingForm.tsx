import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cpf } from 'cpf-cnpj-validator';
import { toast } from 'sonner';

interface BookingFormProps {
  onBook: (name: string, numero: string, cpf: string) => void; // Updated signature to include cpf
  loading: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({ onBook, loading }) => {
  const [name, setName] = useState('');
  const [numero, setNumero] = useState('');
  const [inputCpf, setInputCpf] = useState('');
  const [cpfError, setCpfError] = useState('');

  const formatCpf = (value: string) => {
    // Remove tudo que não for dígito
    const digits = value.replace(/\D/g, '');
    // Aplica a máscara: XXX.XXX.XXX-XX
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatCpf(rawValue);
    setInputCpf(formattedValue);
    setCpfError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanCpf = inputCpf.replace(/\D/g, '');

    if (!name.trim() || !numero.trim() || !cleanCpf) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (!cpf.isValid(cleanCpf)) {
      setCpfError("CPF inválido. Verifique o número digitado.");
      toast.error("CPF inválido.");
      return;
    }

    onBook(name.trim(), numero.trim(), cleanCpf);
  };

  return (
    <Card className="shadow-lg border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Seus Dados</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name" className="text-muted-foreground">Seu Nome</Label>
            <Input
              type="text"
              id="name"
              placeholder="Nome Completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border-border bg-input text-foreground focus:border-primary focus:ring-primary h-10" // Adjusted height
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="numero" className="text-muted-foreground">Seu Número de Telefone</Label>
            <Input
              type="tel"
              id="numero"
              placeholder="(XX) XXXXX-XXXX"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              required
              className="border-border bg-input text-foreground focus:border-primary focus:ring-primary h-10" // Adjusted height
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="cpf" className="text-muted-foreground">Seu CPF</Label>
            <Input
              type="text"
              id="cpf"
              placeholder="000.000.000-00"
              value={inputCpf}
              onChange={handleCpfChange}
              maxLength={14}
              required
              className={cpfError ? "border-destructive bg-input text-foreground focus:border-destructive focus:ring-destructive h-10" : "border-border bg-input text-foreground focus:border-primary focus:ring-primary h-10"} // Adjusted height
            />
            {cpfError && <p className="text-sm text-destructive mt-1">{cpfError}</p>}
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md h-12" disabled={loading}> {/* Adjusted height */}
            {loading ? "Agendando..." : "Confirmar Agendamento"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;