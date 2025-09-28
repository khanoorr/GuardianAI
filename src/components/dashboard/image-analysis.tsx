"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Loader2, Image as ImageIcon, BotMessageSquare, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { explainImageManipulationDetection, ExplainImageManipulationDetectionOutput } from "@/ai/flows/explain-image-manipulation-detection";
import { fileToDataUri } from "@/lib/utils";
import FileDropzone from "@/components/dashboard/file-dropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ImageAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<ExplainImageManipulationDetectionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = useCallback((droppedFile: File | null) => {
    if (droppedFile) {
      if (!droppedFile.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a valid image file (e.g., PNG, JPG).",
        });
        return;
      }
      setFile(droppedFile);
      setResult(null);
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(droppedFile);
    } else {
      setFile(null);
      setImagePreview(null);
    }
  }, [toast]);

  const handleAnalyze = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const photoDataUri = await fileToDataUri(file);
      const analysisResult = await explainImageManipulationDetection({ photoDataUri });
      if (analysisResult.explanation.startsWith('An error occurred')) {
        throw new Error(analysisResult.explanation);
      }
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

  const isManipulated = result && (result.heatMapDataUri || (result.explanation && !result.explanation.toLowerCase().includes('authentic')));

  return (
    <Card className="shadow-lg border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline tracking-tight">
          <ImageIcon className="h-6 w-6" />
          <span>Image Deepfake Detection</span>
        </CardTitle>
        <CardDescription>Upload an image to detect face manipulation and GAN artifacts.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-4">
            <FileDropzone onFileChange={handleFileChange} accept="image/*">
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <Image
                    src={imagePreview}
                    alt="Image preview"
                    fill
                    objectFit="contain"
                    className="rounded-lg"
                  />
                  <Button variant="ghost" size="sm" className="absolute top-2 right-2 bg-background/50 hover:bg-background/80" onClick={(e) => { e.stopPropagation(); handleFileChange(null); }}>
                    Clear
                  </Button>
                </div>
              ) : null}
            </FileDropzone>
            <Button onClick={handleAnalyze} disabled={!file || isLoading} className="w-full font-semibold">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Image...
                </>
              ) : (
                "Analyze Image"
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
            {error && !isLoading && (
              <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {result && !error && !isLoading && (
              <div className="p-4 w-full grid gap-4">
                <h3 className="font-headline text-xl font-semibold text-center mb-2">Analysis Results</h3>
                <Card className={isManipulated ? "border-destructive bg-destructive/10" : "border-primary bg-primary/10"}>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">{isManipulated ? "Manipulation Detected" : "Looks Authentic"}</CardTitle>
                    </CardHeader>
                </Card>
                
                {result.heatMapDataUri && imagePreview && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <h4 className="text-sm font-semibold text-center">Original</h4>
                        <Image src={imagePreview} alt="Original" width={300} height={300} className="rounded-md object-contain aspect-square mx-auto" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <h4 className="text-sm font-semibold text-center">Manipulation Heatmap</h4>
                        <Image src={result.heatMapDataUri} alt="Heatmap" width={300} height={300} className="rounded-md object-contain aspect-square mx-auto" />
                    </div>
                  </div>
                )}
                
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                        <BotMessageSquare className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg font-semibold">AI Analysis Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-foreground/80 whitespace-pre-wrap">{result.explanation}</p>
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
