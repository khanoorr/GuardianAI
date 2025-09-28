'use server';

/**
 * @fileOverview A Genkit flow for creating a demo video from a script.
 * 
 * - createDemoVideo - Generates a video based on a provided script.
 * - CreateDemoVideoInput - The input type for the createDemoVideo function.
 * - CreateDemoVideoOutput - The return type for the createVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const CreateDemoVideoInputSchema = z.object({
  script: z
    .string()
    .describe('A detailed script for the video to be generated.'),
});
export type CreateDemoVideoInput = z.infer<typeof CreateDemoVideoInputSchema>;

const CreateDemoVideoOutputSchema = z.object({
  videoUrl: z
    .string()
    .describe('The data URI of the generated video.'),
});
export type CreateDemoVideoOutput = z.infer<typeof CreateDemoVideoOutputSchema>;

async function toBase64(url: string): Promise<string> {
    const fetch = (await import('node-fetch')).default;
    // Add API key before fetching the video.
    const videoDownloadResponse = await fetch(
        `${url}&key=${process.env.GEMINI_API_KEY}`
    );
    if (
        !videoDownloadResponse ||
        videoDownloadResponse.status !== 200 ||
        !videoDownloadResponse.body
    ) {
        throw new Error('Failed to fetch video');
    }
    const buffer = await videoDownloadResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:video/mp4;base64,${base64}`;
}


export async function createDemoVideo(
  input: CreateDemoVideoInput
): Promise<CreateDemoVideoOutput> {
  try {
    let {operation} = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: input.script,
      config: {
        durationSeconds: 8,
        aspectRatio: '16:9',
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // Wait until the operation completes.
    while (!operation.done) {
      operation = await ai.checkOperation(operation);
      // Sleep for 5 seconds before checking again.
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    if (operation.error) {
      throw new Error('failed to generate video: ' + operation.error.message);
    }

    const video = operation.output?.message?.content.find(p => !!p.media);
    if (!video || !video.media?.url) {
      throw new Error('Failed to find the generated video');
    }
    
    const videoDataUri = await toBase64(video.media.url);

    return { videoUrl: videoDataUri };
  } catch (e: any) {
    if (e.message && e.message.includes('503')) {
      throw new Error('The video generation service is temporarily unavailable. Please try again in a few moments.');
    }
    throw e;
  }
}
