
'use server';

/**
 * @fileOverview Explains image manipulation detections by highlighting manipulated regions and providing explanations.
 *
 * - explainImageManipulationDetection - A function that processes an image and returns explanations of any detected manipulations.
 * - ExplainImageManipulationDetectionInput - The input type for the explainImageManipulationDetection function.
 * - ExplainImageManipulationDetectionOutput - The return type for the explainImageManipulationDetection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainImageManipulationDetectionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be analyzed for manipulations, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExplainImageManipulationDetectionInput = z.infer<
  typeof ExplainImageManipulationDetectionInputSchema
>;

const ExplainImageManipulationDetectionOutputSchema = z.object({
  isManipulated: z
    .boolean()
    .describe(
      'A boolean flag that is true if manipulation is detected, and false otherwise.'
    ),
  explanation: z
    .string()
    .describe('Explanation of the detected image manipulations.'),
  heatMapDataUri: z
    .string()
    .describe(
      "A data URI containing a heatmap highlighting manipulated regions, that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    )
    .optional(),
});
export type ExplainImageManipulationDetectionOutput = z.infer<
  typeof ExplainImageManipulationDetectionOutputSchema
>;

export async function explainImageManipulationDetection(
  input: ExplainImageManipulationDetectionInput
): Promise<ExplainImageManipulationDetectionOutput> {
  return explainImageManipulationDetectionFlow(input);
}

const explainImageManipulationDetectionPrompt = ai.definePrompt({
  name: 'explainImageManipulationDetectionPrompt',
  input: {schema: ExplainImageManipulationDetectionInputSchema},
  output: {
    schema: z.object({
      isManipulated: z
        .boolean()
        .describe(
          'A boolean flag that is true if manipulation is detected, and false otherwise.'
        ),
      explanation: z
        .string()
        .describe('Explanation of the detected image manipulations.'),
    }),
  },
  prompt: `You are an AI expert in image forensics. Analyze the provided image for signs of manipulation and generate an explanation.

Consider common manipulation techniques such as:
- Cloning: Copying and pasting regions within the image.
- Moving: Moving objects from one part of the image to another.
- Removal: Removing objects from the image.
- Splicing: Combining parts of different images.
- Retouching: Altering the appearance of objects or people in the image.
- GAN artifacts: Signs of AI-generated content

Based on your analysis, set the 'isManipulated' flag to true if you detect any signs of manipulation, and false otherwise.

Provide a detailed explanation for your conclusion in the 'explanation' field. If no manipulation is detected, state that the image appears to be authentic.

Image: {{media url=photoDataUri}}`,
});

const imageManipulationHeatmapGenerator = ai.defineFlow(
  {
    name: 'imageManipulationHeatmapGeneratorFlow',
    inputSchema: ExplainImageManipulationDetectionInputSchema,
    outputSchema: z.object({
      heatMapDataUri: z
        .string()
        .describe(
          "A data URI containing a heatmap highlighting manipulated regions, that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
        )
        .optional(),
    }),
  },
  async input => {
    try {
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
          {media: {url: input.photoDataUri}},
          {text: 'generate a heatmap of the manipulated regions of this image'},
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });
      return {heatMapDataUri: media?.url};
    } catch (error) {
      console.error('Error generating heatmap:', error);
      return {heatMapDataUri: undefined};
    }
  }
);

const explainImageManipulationDetectionFlow = ai.defineFlow(
  {
    name: 'explainImageManipulationDetectionFlow',
    inputSchema: ExplainImageManipulationDetectionInputSchema,
    outputSchema: ExplainImageManipulationDetectionOutputSchema,
  },
  async input => {
    try {
      const [analysisResult, heatmapResult] = await Promise.allSettled([
        explainImageManipulationDetectionPrompt(input),
        imageManipulationHeatmapGenerator(input),
      ]);

      if (
        analysisResult.status === 'rejected' ||
        !analysisResult.value.output
      ) {
        console.error(
          'Error from analysis prompt:',
          analysisResult.status === 'rejected'
            ? analysisResult.reason
            : 'Prompt returned null output'
        );
        throw new Error(
          'Failed to get a valid response from the analysis model. It might be unavailable or the request timed out.'
        );
      }

      const {isManipulated, explanation} = analysisResult.value.output;

      const heatMapDataUri =
        heatmapResult.status === 'fulfilled' && isManipulated
          ? heatmapResult.value.heatMapDataUri
          : undefined;
      
      if (heatmapResult.status === 'rejected') {
        console.error('Error from heatmap generator:', heatmapResult.reason);
      }

      return {
        isManipulated,
        explanation,
        heatMapDataUri,
      };
    } catch (error: any) {
      console.error('Error in explainImageManipulationDetectionFlow:', error);
      throw new Error(
        error.message || 'An unexpected error occurred during the analysis. Please try again.'
      );
    }
  }
);
