'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing audio files to detect voice cloning and synthetic audio indicators.
 *
 * - analyzeAudioForDeepfakeIndicators - Analyzes audio and provides indicators of voice cloning or synthetic audio.
 * - AnalyzeAudioInput - The input type for the analyzeAudioForDeepfakeIndicators function.
 * - AnalyzeAudioOutput - The return type for the analyzeAudioForDeepfakeIndicators function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'The audio file as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type AnalyzeAudioInput = z.infer<typeof AnalyzeAudioInputSchema>;

const AnalyzeAudioOutputSchema = z.object({
  voiceCloningDetected: z
    .boolean()
    .describe('Whether voice cloning is detected in the audio.'),
  syntheticAudioDetected: z
    .boolean()
    .describe('Whether synthetic audio is detected in the audio.'),
  analysisDetails: z
    .string()
    .describe('Detailed analysis of the audio, including specific indicators.'),
});
export type AnalyzeAudioOutput = z.infer<typeof AnalyzeAudioOutputSchema>;

export async function analyzeAudioForDeepfakeIndicators(
  input: AnalyzeAudioInput
): Promise<AnalyzeAudioOutput> {
  return analyzeAudioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeAudioPrompt',
  input: {schema: AnalyzeAudioInputSchema},
  output: {schema: AnalyzeAudioOutputSchema},
  prompt: `You are an expert in audio forensics and deepfake detection.

You are given an audio file and must determine if it is a deepfake, specifically if it is the result of voice cloning or is synthetic audio.

Analyze the provided audio and provide a determination for the following fields:
- voiceCloningDetected: true if voice cloning is suspected, false otherwise.
- syntheticAudioDetected: true if the audio appears to be synthetically generated, false otherwise.
- analysisDetails: A detailed explanation of your analysis, including specific indicators that led to your conclusion. Cite any inconsistencies or anomalies found in the audio.

Audio: {{media url=audioDataUri}}`,
});

const analyzeAudioFlow = ai.defineFlow(
  {
    name: 'analyzeAudioFlow',
    inputSchema: AnalyzeAudioInputSchema,
    outputSchema: AnalyzeAudioOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
