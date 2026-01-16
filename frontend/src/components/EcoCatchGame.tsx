import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Zap, Leaf, Trophy } from "lucide-react";
import { useUser } from "../contexts/UserContext";

interface Orb {
  id: number;
  x: number;
  y: number;
  type: 'green' | 'gold' | 'blue';
  scale: number;
}

interface EcoCatchGameProps {
  onClose: () => void;
}

export function EcoCatchGame({ onClose }: EcoCatchGameProps) {
  const { setReward } = useUser();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const nextOrbId = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const startGame = () => {
    setScore(0);
    setTimeLeft(10);
    setGameState('playing');
    setOrbs([]);
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const spawnInterval = setInterval(() => {
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        const typeRand = Math.random();
        const type = typeRand > 0.9 ? 'gold' : typeRand > 0.7 ? 'blue' : 'green';
        
        const newOrb: Orb = {
          id: nextOrbId.current++,
          x: Math.random() * (rect.width - 60) + 30,
          y: Math.random() * (rect.height - 60) + 30,
          type,
          scale: 0,
        };
        
        setOrbs((prev) => [...prev, newOrb]);

        // Remove orb after 1.5 seconds if not caught
        setTimeout(() => {
          setOrbs((prev) => prev.filter((o) => o.id !== newOrb.id));
        }, 1500);
      }
    }, 600);

    return () => {
      clearInterval(timer);
      clearInterval(spawnInterval);
    };
  }, [gameState]);

  const catchOrb = (id: number, type: Orb['type']) => {
    let points = 1;
    if (type === 'gold') points = 3;
    if (type === 'blue') points = 2;
    
    setScore((prev) => prev + points);
    setOrbs((prev) => prev.filter((o) => o.id !== id));
  };

  const handleFinish = () => {
    let discount = 0;
    let multiplier = 1;

    if (score >= 20) {
      discount = 0.25;
      multiplier = 1.2;
    } else if (score >= 12) {
      discount = 0.15;
      multiplier = 1.1;
    } else if (score >= 6) {
      discount = 0.10;
      multiplier = 1.0;
    }

    if (discount > 0 || multiplier > 1) {
      setReward({
        discount,
        multiplier,
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-background rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
        <div className="p-4 border-b flex justify-between items-center bg-green-900/10">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h2 className="font-bold">Eco Catch</h2>
          </div>
          {gameState === 'playing' ? (
            <Badge variant="outline" className="text-lg font-mono px-3 py-1">
              {timeLeft}s
            </Badge>
          ) : (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="flex-1 relative overflow-hidden" ref={gameAreaRef}>
          {gameState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <Leaf className="h-12 w-12 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Boost Your Impact!</h3>
                <p className="text-sm text-muted-foreground">
                  Catch as many floating Eco-Orbs as you can in 10 seconds to earn discounts and impact multipliers.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 w-full text-xs">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-green-500" />
                  <span>Common</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-blue-500" />
                  <span>Rare (2x)</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-yellow-500" />
                  <span>Ultra (3x)</span>
                </div>
              </div>
              <Button onClick={startGame} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
                Start Game
              </Button>
            </div>
          )}

          {gameState === 'playing' && (
            <>
              <div className="absolute top-4 left-4 z-10">
                <p className="text-3xl font-black text-green-600 drop-shadow-sm">
                  {score}
                </p>
              </div>
              {orbs.map((orb) => (
                <button
                  key={orb.id}
                  onClick={() => catchOrb(orb.id, orb.type)}
                  className={`absolute w-14 h-14 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-200 animate-in zoom-in-50 active:scale-95 ${
                    orb.type === 'green' ? 'bg-green-500 shadow-green-500/50' :
                    orb.type === 'blue' ? 'bg-blue-500 shadow-blue-500/50' :
                    'bg-yellow-500 shadow-yellow-500/50'
                  }`}
                  style={{
                    left: orb.x,
                    top: orb.y,
                  }}
                >
                  {orb.type === 'gold' && <Zap className="h-6 w-6 text-white" />}
                  {orb.type === 'green' && <Leaf className="h-6 w-6 text-white" />}
                  {orb.type === 'blue' && <Zap className="h-5 w-5 text-white/80" />}
                </button>
              ))}
            </>
          )}

          {gameState === 'finished' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6 bg-white/95 z-20">
              <div className="text-center">
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Game Over</p>
                <h3 className="text-5xl font-black text-green-600 mt-2">{score}</h3>
                <p className="text-muted-foreground mt-1">Total Points</p>
              </div>

              <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200 w-full space-y-4">
                <h4 className="font-bold text-green-900">Your Reward:</h4>
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {score >= 20 ? '25%' : score >= 12 ? '15%' : score >= 6 ? '10%' : '0%'}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase">Discount</p>
                  </div>
                  <div className="h-8 w-px bg-green-200" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {score >= 20 ? '1.2x' : score >= 12 ? '1.1x' : '1.0x'}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase">Impact</p>
                  </div>
                </div>
                {score < 6 && (
                  <p className="text-xs text-muted-foreground italic">Try again to earn rewards!</p>
                )}
              </div>

              <div className="flex gap-3 w-full">
                <Button variant="outline" onClick={startGame} className="flex-1">
                  Try Again
                </Button>
                <Button onClick={handleFinish} className="flex-1 bg-green-600 hover:bg-green-700 font-bold">
                  Claim Reward
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
