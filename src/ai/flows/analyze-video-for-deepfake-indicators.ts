
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
  isAuthentic: z
    .boolean()
    .describe('True if the video is likely authentic, false if it shows signs of manipulation.'),
  deepfakeDetected: z
    .boolean()
    .describe('Whether the video is suspected to be a deepfake.'),
  analysisDetails: z
    .string()
    .describe(
      'A detailed explanation of the analysis, including any detected deepfake indicators like unnatural facial movements, lighting inconsistencies, or other artifacts.'
    ),
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

You are given a video file and must determine if it is a deepfake.

Analyze the provided video for common deepfake indicators such as:
- Unnatural facial movements or expressions.
- Inconsistencies in lighting, shadows, or reflections.
- Blurring or artifacts around the edges of a person's face or body.
- Lack of natural blinking.
- Audio-visual synchronization issues.

Based on your analysis, provide a determination for the following fields:
- isAuthentic: Set to false if deepfakeDetected is true.
- deepfakeDetected: true if you suspect the video is a deepfake, false otherwise.
- analysisDetails: A detailed explanation of your findings. If you detect a deepfake, describe the specific indicators that led you to that conclusion.

Video: {{media url=videoDataUri}}`,
});

const analyzeVideoFlow = ai.defineFlow(
  {
    name: 'analyzeVideoFlow',
    inputSchema: AnalyzeVideoInputSchema,
    outputSchema: AnalyzeVideoOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('The AI model did not return a valid analysis. This might be due to a timeout or an internal error.');
      }
      return output;
    } catch (error: any) {
      console.error('Error in analyzeVideoFlow:', error);
      return {
        isAuthentic: true,
        deepfakeDetected: false,
        analysisDetails: `An error occurred during video analysis: ${error.message || 'Unknown error'}.`,
      };
    }
  }
);
