import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  benefits?: string[];
}

const defaultBenefits = [
  'Comparações ilimitadas',
  'Favoritos sem limite',
  'Histórico completo de comparações',
  'Análises de IA por tema',
  'Acesso prioritário a novas funcionalidades',
];

const PremiumGate = ({
  open,
  onOpenChange,
  title = 'Atingiste o limite gratuito',
  description = 'Faz upgrade para Premium e desbloqueia tudo o que o Be+Politic oferece.',
  benefits = defaultBenefits,
}: PremiumGateProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center font-display text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 py-4">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              onOpenChange(false);
              navigate('/pricing');
            }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Ver planos Premium
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            Talvez mais tarde
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumGate;
