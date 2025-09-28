'use client';

import {useState} from 'react';
import {Loader2, Wand, BotMessageSquare, AlertCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {useToast} from '@/hooks/use-toast';
import {generateDemoVideo, GenerateDemoVideoOutput} from '@/ai/flows/generate-demo-video';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';

const defaultScript = `A dynamic and professional corporate video.
Scene 1: A tracking shot of a diverse team of professionals collaborating in a modern, sunlit office.
Scene 2: Close-up on a computer screen displaying complex data visualizations and charts, with a person pointing at the screen.
Scene 3: A slow-motion shot of a single person looking thoughtfully at a large screen displaying the GuardianAI logo.
Scene 4: A fast-paced montage of the different features: image analysis with a heatmap, text analysis with a credibility score, and video analysis showing artifact detection.
Scene 5: The video ends with the GuardianAI logo and the tagline: "Advanced Deepfake Detection" on a clean, dark background.`;

export default function DemoVideoGenerator() {
  const [script, setScript] = useState(defaultScript);
  const [result, setResult] = useState<GenerateDemoVideoOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {toast} = useToast();

  const handleGenerate = async () => {
    if (!script) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      toast({
        title: 'Video Generation Started',
        description: 'This may take a minute or two. Please be patient.',
      });
      const generationResult = await generateDemoVideo({script});
      setResult(generationResult);
      toast({
        title: 'Video Generation Complete',
        description: 'Your demo video has been successfully generated.',
      });
    } catch (e: any) {
      const errorMessage = e.message || 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
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
          <Wand className="h-6 w-6" />
          <span>AI Demo Video Generator</span>
        </CardTitle>
        <CardDescription>
          Create a short demo video for your project using a text script. Edit the script below to customize your video.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-4">
            <Textarea
              value={script}
              onChange={e => setScript(e.target.value)}
              placeholder="Enter the script for your video..."
              className="min-h-[250px] resize-y font-code"
            />
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full font-semibold">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Video...
                </>
              ) : (
                'Generate Demo Video'
              )}
            </Button>
          </div>
          <div className="min-h-[300px] rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/20 p-4">
            {isLoading && (
              <div className="flex flex-col items-center gap-2 text-muted-foreground text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="font-semibold">Generating Video</p>
                <p className="text-sm">This may take up to a minute. Please don't navigate away.</p>
              </div>
            )}
            {error && (
              <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result?.videoDataUri && (
              <div className="w-full">
                <h3 className="font-headline text-xl font-semibold text-center mb-4">Generated Video</h3>
                <video src={result.videoDataUri} controls className="w-full rounded-md" />
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
