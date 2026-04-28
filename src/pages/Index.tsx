import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Dumbbell, Users, Zap, Trophy } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-20 lg:py-32"> {/* Adjusted vertical padding */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl -z-10" />

          <div className="container mx-auto px-4 text-center z-10">
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-foreground mb-4 sm:mb-6 leading-tight tracking-tight max-w-5xl mx-auto"> {/* Adjusted text size */}
              Sua Melhor <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-600">Performance</span> Começa Agora.
            </h1>
            
            <p className="text-base sm:text-lg lg:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed"> {/* Adjusted text size */}
              Na Malibu Exclusive, o treino é levado a outro nível. Equipamentos de elite, ambiente privativo e resultados reais.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"> {/* Adjusted gap */}
              <Link to="/agendar">
                <Button className="h-12 px-6 text-base sm:h-14 sm:px-8 sm:text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_10px_20px_-5px_rgba(249,115,22,0.4)] rounded-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 group"> {/* Adjusted button size */}
                  Agende Sua Visita
                  <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:translate-x-1" /> {/* Adjusted icon size */}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 sm:py-20 bg-muted/30"> {/* Adjusted vertical padding */}
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 sm:mb-16"> {/* Adjusted margin */}
              <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">O Padrão Malibu</h2> {/* Adjusted text size */}
              <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"> {/* Adjusted gap */}
              <div className="bg-card p-6 sm:p-8 rounded-3xl border border-border hover:shadow-xl transition-shadow group"> {/* Adjusted padding */}
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 sm:mb-6 group-hover:bg-primary group-hover:text-white transition-colors"> {/* Adjusted size */}
                  <Zap className="h-6 w-6 sm:h-8 sm:w-8" /> {/* Adjusted icon size */}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Tecnologia de Ponta</h3> {/* Adjusted text size */}
                <p className="text-sm text-muted-foreground">Equipamentos importados de última geração para maximizar cada movimento seu.</p>
              </div>

              <div className="bg-card p-6 sm:p-8 rounded-3xl border border-border hover:shadow-xl transition-shadow group">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 sm:mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Atendimento VIP</h3>
                <p className="text-sm text-muted-foreground">Treinadores altamente qualificados focados no seu objetivo individual.</p>
              </div>

              <div className="bg-card p-6 sm:p-8 rounded-3xl border border-border hover:shadow-xl transition-shadow group">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 sm:mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Trophy className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Ambiente Exclusivo</h3>
                <p className="text-sm text-muted-foreground">Esqueça filas e lotação. Aqui você treina com conforto e privacidade total.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;