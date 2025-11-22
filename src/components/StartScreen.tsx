import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StartScreenProps {
  onStartGame: () => void;
}

export function StartScreen({ onStartGame }: StartScreenProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 scan-line pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
      
      <div className="relative z-10 text-center space-y-8">
        <h1 className="text-7xl font-bold neon-text glitch mb-4">CYBER ROYALE 3D</h1>
        <p className="text-2xl text-muted-foreground mb-8">3D Battle Royale в киберпанк мире</p>
        
        <Card className="bg-card/80 backdrop-blur border-primary/30 p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Управление</h2>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 px-3 py-2 rounded border border-primary/50 font-bold">W A S D</div>
              <span>Движение 3D</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 px-3 py-2 rounded border border-primary/50 font-bold">Мышь</div>
              <span>Камера + атака</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 px-3 py-2 rounded border border-primary/50 font-bold">1-5</div>
              <span>Выбор оружия</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 px-3 py-2 rounded border border-primary/50 font-bold">E</div>
              <span>Использовать</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 px-3 py-2 rounded border border-primary/50 font-bold">R</div>
              <span>Перезарядка</span>
            </div>
          </div>
        </Card>

        <Button 
          onClick={onStartGame}
          className="h-16 px-12 text-2xl font-bold neon-border bg-primary hover:bg-primary/80 transition-all"
        >
          <Icon name="Zap" size={32} className="mr-3" />
          НАЧАТЬ ИГРУ
        </Button>
      </div>
    </div>
  );
}
