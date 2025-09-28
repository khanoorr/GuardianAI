"use client";

import { useState } from "react";
import { Loader2, Clapperboard, BotMessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createDemoVideo, CreateDemoVideoOutput } from "@/ai/flows/create-demo-video";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const defaultScript = `Scene: Opening shot with the GuardianAI logo, a modern shield with an eye in the center, animating subtly. Text overlay: "GuardianAI: Your Shield Against Digital Deception."

Scene: A split screen. On one side, an authentic image of a politician giving a speech. On the other, a deepfaked version with exaggerated expressions. The GuardianAI interface is shown analyzing the image, highlighting manipulated areas with a red heatmap. A green checkmark appears on the authentic image.

Scene: A user interface showing a news article being pasted into the GuardianAI text analysis tool. The credibility score gauge animates, landing on a low score. The AI summary points out biased language and contradictions.

Scene: An audio waveform is displayed. A voice says "I did not say those words." The waveform is analyzed, and the UI flags it as "Voice Cloning Detected." The analysis details pop up, showing spectral anomalies.

Scene: A fast-paced montage of different media types (images, videos, articles) being analyzed by GuardianAI, all resulting in "Authentic" or "Manipulation Detected" labels.

Scene: Closing shot with the GuardianAI logo and tagline. Text overlay: "GuardianAI: See the Truth."
`;

export default function DemoVideo() {
  const [script, setScript] = useState(defaultScript);
  const [result, setResult] = useState<CreateDemoVideoOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!script) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const generationResult = await createDemoVideo({ script });
      setResult(generationResult);
    } catch (e: any) {
      const errorMessage = e.message || "An unknown error occurred.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Video Generation Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline tracking-tight">
          <Clapperboard className="h-6 w-6" />
          <span>Demo Video Generator</span>
        </CardTitle>
        <CardDescription>
          Create a demo video for your project. Write a script and let the AI generate a video. 
          Note: Video generation can take up to 2 minutes.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-4">
            <Textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Enter your video script here..."
              className="min-h-[300px] resize-y font-code text-sm"
            />
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full font-semibold">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Demo Video...
                </>
              ) : (
                "Generate Demo Video"
              )}
            </Button>
          </div>
          <div className="min-h-[300px] rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/20">
            {isLoading && (
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Generating video... this may take a minute or two.</p>
                <p className="text-xs text-muted-foreground/80">Please do not navigate away from this page.</p>
              </div>
            )}
            {error && (
              <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result?.videoUrl && (
              <div className="p-4 w-full grid gap-4">
                <h3 className="font-headline text-xl font-semibold text-center mb-2">Generated Video</h3>
                <video src={result.videoUrl} controls className="w-full rounded-lg" />
                <p className="text-sm text-center text-muted-foreground">
                    Right-click the video and choose "Save video as..." to download.
                </p>
              </div>
            )}
            {!isLoading && !result && !error && (
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-8 text-center">
                <BotMessageSquare className="h-10 w-10" />
                <p className="font-medium">Your generated video will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
