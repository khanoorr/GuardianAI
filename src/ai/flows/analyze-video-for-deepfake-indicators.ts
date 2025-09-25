'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing video files to detect deepfake indicators.
 *
 * - analyzeVideoForDeepfakeIndicators - Analyzes video and provides indicators of manipulation.
 * - AnalyzeVideoInput - The input type for the analyzeVideoForDeepfakeIndicators function.
 * - AnalyzeVideoOutput - The return type for the analyzeVideoForDeepfakeIndicators function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeVideoInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "The video file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeVideoInput = z.infer<typeof AnalyzeVideoInputSchema>;

const AnalyzeVideoOutputSchema = z.object({
  deepfakeDetected: z
    .boolean()
    .describe('Whether a deepfake is detected in the video.'),
  analysisDetails: z
    .string()
    .describe('Detailed analysis of the video, including specific indicators of manipulation.'),
});
export type AnalyzeVideoOutput = z.infer<typeof AnalyzeVideoOutputSchema>;

export async function analyzeVideoForDeepfakeIndicators(
  input: AnalyzeVideoInput
): Promise<AnalyzeVideoOutput> {
  return analyzeVideoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeVideoPrompt',
  input: {schema: AnalyzeVideoInputSchema},
  output: {schema: AnalyzeVideoOutputSchema},
  prompt: `You are an expert in video forensics and deepfake detection.

You are given a video file and must determine if it is a deepfake. Analyze for signs of manipulation like facial artifacts, unnatural movements, or inconsistencies in lighting and shadows.

Analyze the provided video and provide a determination for the following fields:
- deepfakeDetected: true if a deepfake is suspected, false otherwise.
- analysisDetails: A detailed explanation of your analysis, including specific indicators that led to your conclusion. Cite any visual inconsistencies or anomalies.

Video: {{media url=videoDataUri}}`,
});

const analyzeVideoFlow = ai.defineFlow(
  {
    name: 'analyzeVideoFlow',
    inputSchema: AnalyzeVideoInputSchema,
    outputSchema: AnalyzeVideoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      return {
        deepfakeDetected: false,
        analysisDetails: 'Could not analyze video at this time.'
      }
    }
    return output;
  }
);
