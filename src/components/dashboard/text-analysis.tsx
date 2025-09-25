"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, FileText, BotMessageSquare, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { summarizeNewsArticleForCredibility, SummarizeNewsArticleForCredibilityOutput } from "@/ai/flows/summarize-news-article-for-credibility";
import ScoreGauge from "@/components/dashboard/score-gauge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "../ui/scroll-area";

const formSchema = z.object({
  articleText: z.string().min(100, "Article text must be at least 100 characters long to provide a meaningful analysis."),
  sourceName: z.string().min(2, "Source name is required (e.g., 'BBC News', 'The Onion')."),
});

export default function TextAnalysis() {
  const [result, setResult] = useState<SummarizeNewsArticleForCredibilityOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      articleText: "",
      sourceName: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await summarizeNewsArticleForCredibility(values);
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
          <FileText className="h-6 w-6" />
          <span>Misinformation Detection</span>
        </CardTitle>
        <CardDescription>Paste a news article to analyze its credibility and get a summary.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="sourceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Reputable News, Daily Disinformation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="articleText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Article Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the full text of the news article here..."
                        className="min-h-[250px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full font-semibold">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Text...
                  </>
                ) : (
                  "Analyze Text"
                )}
              </Button>
            </form>
          </Form>
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
                <div className="flex justify-center">
                    <ScoreGauge score={result.credibilityScore} />
                </div>
                
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                        <BotMessageSquare className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg font-semibold">AI Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-32">
                        <p className="text-sm text-foreground/80">{result.summary}</p>
                      </ScrollArea>
                    </CardContent>
                </Card>

                {result.sourceVerification && (
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                            <BotMessageSquare className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg font-semibold">Source Verification</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-foreground/80">{result.sourceVerification}</p>
                        </CardContent>
                    </Card>
                )}
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
