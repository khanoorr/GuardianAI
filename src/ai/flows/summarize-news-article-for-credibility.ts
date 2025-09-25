'use server';
/**
 * @fileOverview Summarizes a news article and provides a credibility score.
 *
 * - summarizeNewsArticleForCredibility - A function that handles the news article summarization and credibility assessment process.
 * - SummarizeNewsArticleForCredibilityInput - The input type for the summarizeNewsArticleForCredibility function.
 * - SummarizeNewsArticleForCredibilityOutput - The return type for the summarizeNewsArticleForCredibility function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNewsArticleForCredibilityInputSchema = z.object({
  articleText: z.string().describe('The text content of the news article.'),
  sourceName: z.string().describe('The name of the news source.'),
});
export type SummarizeNewsArticleForCredibilityInput = z.infer<
  typeof SummarizeNewsArticleForCredibilityInputSchema
>;

const SummarizeNewsArticleForCredibilityOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the news article.'),
  credibilityScore: z
    .number()
    .min(0)
    .max(1)
    .describe(
      'A score between 0 and 1 indicating the credibility of the article, where 0 is not credible and 1 is highly credible.'
    ),
  sourceVerification: z
    .string()
    .optional()
    .describe(
      'Verification of the source against known fact-checking databases.'
    ),
});
export type SummarizeNewsArticleForCredibilityOutput = z.infer<
  typeof SummarizeNewsArticleForCredibilityOutputSchema
>;

const getSourceVerification = ai.defineTool(
  {
    name: 'getSourceVerification',
    description: 'Verifies the source of the news article against known fact-checking databases to determine its credibility.',
    inputSchema: z.object({
      sourceName: z.string().describe('The name of the news source to verify.'),
    }),
    outputSchema: z.string().describe('The verification status of the source.'),
  },
  async input => {
    // Placeholder implementation for source verification against fact-checking databases.
    // In a real application, this would involve querying external APIs or databases.
    if (input.sourceName.toLowerCase().includes('reputable')) {
      return `Source ${input.sourceName} is a reputable news organization.`;
    } else {
      return `Source ${input.sourceName} requires further investigation.`;
    }
  }
);

export async function summarizeNewsArticleForCredibility(
  input: SummarizeNewsArticleForCredibilityInput
): Promise<SummarizeNewsArticleForCredibilityOutput> {
  return summarizeNewsArticleForCredibilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeNewsArticleForCredibilityPrompt',
  input: {schema: SummarizeNewsArticleForCredibilityInputSchema},
  output: {schema: SummarizeNewsArticleForCredibilityOutputSchema},
  tools: [getSourceVerification],
  prompt: `You are an AI assistant tasked with summarizing news articles and assessing their credibility.\n\n  Summarize the following news article:
  {{articleText}}\n\n  Also, evaluate the credibility of the article based on the source and content. Provide a credibility score between 0 and 1, where 0 is not credible and 1 is highly credible.\n\n  Include source verification information if available. Invoke the getSourceVerification tool if you are not certain about the source.\n\n  Output should be in JSON format.
`,
});

const summarizeNewsArticleForCredibilityFlow = ai.defineFlow(
  {
    name: 'summarizeNewsArticleForCredibilityFlow',
    inputSchema: SummarizeNewsArticleForCredibilityInputSchema,
    outputSchema: SummarizeNewsArticleForCredibilityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
