"use client";

import { useState, useCallback, useRef } from "react";
import { Loader2, Video, BotMessageSquare, AlertCircle, ShieldCheck, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { analyzeVideoForDeepfakeIndicators, AnalyzeVideoOutput } from "@/ai/flows/analyze-video-for-deepfake-indicators";
import { fileToDataUri } from "@/lib/utils";
import FileDropzone from "@/components/dashboard/file-dropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function VideoAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeVideoOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = useCallback((droppedFile: File | null) => {
    if (droppedFile) {
      if (!droppedFile.type.startsWith("video/")) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a valid video file.",
        });
        return;
      }
      setFile(droppedFile);
      setResult(null);
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(droppedFile);
    } else {
      setFile(null);
      setVideoPreview(null);
    }
  }, [toast]);

  const handleAnalyze = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const videoDataUri = await fileToDataUri(file);
      const analysisResult = await analyzeVideoForDeepfakeIndicators({ videoDataUri });
      setResult(analysisResult);
    } catch (e: any) {
      const errorMessage = e.message || "An unknown error occurred.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
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
          <Video className="h-6 w-6" />
          <span>Video Deepfake Detection</span>
        </CardTitle>
        <CardDescription>Upload a video file to detect deepfake manipulations.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-4">
            <FileDropzone onFileChange={handleFileChange} accept="video/*">
              {videoPreview && file ? (
                <div className="flex flex-col items-center justify-center gap-2 text-center p-4">
                  <Video className="h-12 w-12 text-primary" />
                  <p className="font-medium">{file.name}</p>
                  <video ref={videoRef} src={videoPreview} controls className="w-full max-h-60 rounded-md mt-2" />
                  <Button variant="link" size="sm" onClick={() => handleFileChange(null)}>
                    Clear video
                  </Button>
                </div>
              ) : null}
            </FileDropzone>
            <Button onClick={handleAnalyze} disabled={!file || isLoading} className="w-full font-semibold">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Video...
                </>
              ) : (
                "Analyze Video"
              )}
            </Button>
          </div>
          <div className="min-h-[300px] rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/20">
            {isLoading && (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Analyzing... please wait.</p>
              </div>
            )}
            {error && (
              <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result && (
              <div className="p-4 w-full grid gap-4">
                <h3 className="font-headline text-xl font-semibold text-center mb-2">Analysis Results</h3>
                <Card className={result.deepfakeDetected ? "border-destructive bg-destructive/10" : "border-primary bg-primary/10"}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Deepfake Detection</CardTitle>
                         {result.deepfakeDetected ? <ShieldAlert className="h-4 w-4 text-destructive"/> : <ShieldCheck className="h-4 w-4 text-primary"/>}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{result.deepfakeDetected ? "Detected" : "Not Detected"}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                        <BotMessageSquare className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg font-semibold">AI Analysis Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-foreground/80 whitespace-pre-wrap">{result.analysisDetails}</p>
                    </CardContent>
                </Card>
              </div>
            )}
            {!isLoading && !result && !error && (
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-8 text-center">
                <BotMessageSquare className="h-10 w-10" />
                <p className="font-medium">Analysis results will be displayed here.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
