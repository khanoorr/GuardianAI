'use server';
/**
 * @fileOverview A flow for generating a demo video from a text script.
 *
 * - generateDemoVideo - A function that takes a script and generates a video.
 * - GenerateDemoVideoInput - The input type for the generateDemoVideo function.
 * - GenerateDemoVideoOutput - The return type for the generateDemoVideo function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import {PassThrough} from 'stream';

const GenerateDemoVideoInputSchema = z.object({
  script: z
    .string()
    .describe('The script for the demo video.'),
});
export type GenerateDemoVideoInput = z.infer<
  typeof GenerateDemoVideoInputSchema
>;

const GenerateDemoVideoOutputSchema = z.object({
  videoDataUri: z
    .string()
    .describe('The generated video as a data URI.')
    .optional(),
});
export type GenerateDemoVideoOutput = z.infer<
  typeof GenerateDemoVideoOutputSchema
>;

async function streamToBuffer(stream: PassThrough): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

const generateDemoVideoFlow = ai.defineFlow(
  {
    name: 'generateDemoVideoFlow',
    inputSchema: GenerateDemoVideoInputSchema,
    outputSchema: GenerateDemoVideoOutputSchema,
  },
  async ({script}) => {
    let {operation} = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: script,
      config: {
        durationSeconds: 8,
        aspectRatio: '16:9',
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // wait 5s
      operation = await ai.checkOperation(operation);
    }

    if (operation.error) {
      throw new Error('Failed to generate video: ' + operation.error.message);
    }

    const video = operation.output?.message?.content.find(p => !!p.media);
    if (!video || !video.media?.url) {
      throw new Error('Failed to find the generated video');
    }

    // The URL from Veo is temporary and needs to be fetched.
    // We add the API key for authentication.
    const fetch = (await import('node-fetch')).default;
    const videoDownloadResponse = await fetch(
      `${video.media.url}&key=${process.env.GEMINI_API_KEY}`
    );

    if (
      !videoDownloadResponse ||
      videoDownloadResponse.status !== 200 ||
      !videoDownloadResponse.body
    ) {
      throw new Error('Failed to fetch video');
    }
    const buffer = await streamToBuffer(videoDownloadResponse.body);
    const contentType =
      video.media.contentType || 'video/mp4';

    return {
      videoDataUri: `data:${contentType};base64,${buffer.toString('base64')}`,
    };
  }
);

export async function generateDemoVideo(
  input: GenerateDemoVideoInput
): Promise<GenerateDemoVideoOutput> {
  return generateDemoVideoFlow(input);
}
