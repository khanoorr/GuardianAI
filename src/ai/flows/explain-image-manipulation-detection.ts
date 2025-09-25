// @ts-nocheck
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
  explanation: z.string().describe('Explanation of the detected image manipulations.'),
  heatMapDataUri: z
    .string()
    .describe(
      'A data URI containing a heatmap highlighting manipulated regions, that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    )
    .optional(),
  sourceVerification: z
    .string()
    .describe('Source verification information, if available.')
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

const shouldIncludeSourceVerificationTool = ai.defineTool({
  name: 'shouldIncludeSourceVerification',
  description: 'Determines if source verification should be included in the response.',
  inputSchema: z.object({
    photoDataUri: z
      .string()
      .describe(
        "A photo to be analyzed for manipulations, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
      ),
  }),
  outputSchema: z.boolean(),
},
async (input) => {
  // Basic logic to decide whether to include source verification.
  // More sophisticated logic can be added here based on the image.
  return true; 
});

const explainImageManipulationDetectionPrompt = ai.definePrompt({
  name: 'explainImageManipulationDetectionPrompt',
  input: {schema: ExplainImageManipulationDetectionInputSchema},
  output: {schema: ExplainImageManipulationDetectionOutputSchema},
  prompt: `You are an AI expert in image forensics. Analyze the provided image for signs of manipulation and generate an explanation.

Consider common manipulation techniques such as:
- Cloning: Copying and pasting regions within the image.
- Moving: Moving objects from one part of the image to another.
- Removal: Removing objects from the image.
- Splicing: Combining parts of different images.
- Retouching: Altering the appearance of objects or people in the image.
- GAN artifacts: Signs of AI-generated content

Provide a detailed explanation of any detected manipulations, including the techniques used and the regions affected. If no manipulation is detected, state that the image appears to be authentic.

{{#if shouldIncludeSourceVerification}}
Also, please include source verification information to help determine the origin and authenticity of the image.
{{/if}}

Output the explanation, and heatmap data URI.

Image: {{media url=photoDataUri}}
`,
  tools: [shouldIncludeSourceVerificationTool],
});

const imageManipulationHeatmapGenerator = ai.defineFlow({
  name: 'imageManipulationHeatmapGeneratorFlow',
  inputSchema: ExplainImageManipulationDetectionInputSchema,
  outputSchema: z.object({
    heatMapDataUri: z
      .string()
      .describe(
        'A data URI containing a heatmap highlighting manipulated regions, that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
      )
      .optional(),
  }),
},
async (input) => {
  //In a real implementation, this should generate a heat map
  const { media } = await ai.generate({
    model: 'googleai/gemini-2.5-flash-image-preview',
    prompt: [
      {media: {url: input.photoDataUri}},
      {text: 'generate a heatmap of the manipulated regions of this image'},
    ],
    config: {
      responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
    },
  });
  return {heatMapDataUri: media?.url};
});

const explainImageManipulationDetectionFlow = ai.defineFlow(
  {
    name: 'explainImageManipulationDetectionFlow',
    inputSchema: ExplainImageManipulationDetectionInputSchema,
    outputSchema: ExplainImageManipulationDetectionOutputSchema,
  },
  async input => {
    const {output} = await explainImageManipulationDetectionPrompt(input);
    const {heatMapDataUri} = await imageManipulationHeatmapGenerator(input);
    return {...output, heatMapDataUri};
  }
);
