import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Music, VolumeX, Volume2, Play, Pause } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AudioControlsProps {
  onToggleMusic: () => void;
  onVolumeChange: (volume: number) => void;
  isMusicPlaying: boolean;
}

export function AudioControls({ onToggleMusic, onVolumeChange, isMusicPlaying }: AudioControlsProps) {
  const [volume, setVolume] = useState([70]);
  const [isMuted, setIsMuted] = useState(false);

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(newVolume);
    setIsMuted(vol === 0);
    onVolumeChange(vol / 100);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume([70]);
      onVolumeChange(0.7);
      setIsMuted(false);
    } else {
      setVolume([0]);
      onVolumeChange(0);
      setIsMuted(true);
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-card/90 border-0 shadow-[var(--shadow-strong)] rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-1">
        <CardHeader className="pb-1 pt-2">
          <CardTitle className="text-base flex items-center gap-2 text-center justify-center">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Music className="w-3 h-3 text-white" />
            </div>
            Audio Experience
          </CardTitle>
        </CardHeader>
      </div>
      
      <CardContent className="p-3 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-center">
            <Button
              variant={isMusicPlaying ? "default" : "secondary"}
              size="sm"
              onClick={onToggleMusic}
              className={cn(
                "w-full max-w-36 h-8 rounded-full font-medium transition-all duration-300 text-xs",
                "shadow-[var(--shadow-medium)] hover:shadow-[var(--shadow-strong)]",
                isMusicPlaying 
                  ? "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" 
                  : "hover:bg-secondary/80"
              )}
            >
              {isMusicPlaying ? (
                <>
                  <Pause className="w-3 h-3 mr-1" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 mr-1" />
                  Reproducir
                </>
              )}
            </Button>
          </div>
          
          <div className="bg-secondary/30 rounded-lg p-2 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Volumen</span>
              <span>{volume[0]}%</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="w-6 h-6 rounded-full p-0 hover:bg-secondary/60 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-3 h-3" />
                ) : (
                  <Volume2 className="w-3 h-3" />
                )}
              </Button>
              
              <div className="flex-1">
                <Slider
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-full [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-primary [&_[role=slider]]:to-accent [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}