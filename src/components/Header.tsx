import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from './ThemeToggle'; // Import ThemeToggle

const Header = () => {
  const isMobile = useIsMobile();

  return (
    <header className="bg-card text-foreground p-4 shadow-lg border-b border-border flex justify-between items-center">
      <Link to="/" className="h-10 flex items-center">
        <img
          src="https://framerusercontent.com/images/hGJyQWRHAsnDQLAGF0vGRbNIkb0.png?scale-down-to=512"
          alt="Malibu Exclusive Logo"
          className="h-full object-contain"
        />
      </Link>
      <div className="flex items-center gap-4"> {/* Added a div to group nav and toggle */}
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary hover:bg-accent hover:text-primary-foreground">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px] bg-card p-6 border-l border-border">
              <nav className="flex flex-col gap-4 text-lg">
                <Link to="/agendar" className="text-foreground hover:text-primary transition-colors py-2" onClick={() => document.getElementById('sheet-close-button')?.click()}>
                  Agendar Visita
                </Link>
                {/* Ocultado: Link para Ver Agendamentos */}
                {/* <Link to="/admin" className="hover:text-orange-700 transition-colors py-2" onClick={() => document.getElementById('sheet-close-button')?.click()}>
                  Ver Agendamentos
                </Link> */}
              </nav>
              {/* Add a hidden button to close the sheet programmatically */}
              <Button id="sheet-close-button" className="hidden"></Button>
            </SheetContent>
          </Sheet>
        ) : (
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link to="/agendar" className="text-foreground hover:text-primary transition-colors text-base font-medium">
                  Agendar Visita
                </Link>
              </li>
              {/* Ocultado: Link para Ver Agendamentos */}
              {/* <li>
                <Link to="/admin" className="hover:text-orange-700 transition-colors text-base font-medium">
                  Ver Agendamentos
                </Link>
              </li> */}
            </ul>
          </nav>
        )}
        <ThemeToggle /> {/* Add ThemeToggle here */}
      </div>
    </header>
  );
};

export default Header;