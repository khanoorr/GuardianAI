# GuardianAI: Advanced Deepfake and Misinformation Detection

**GuardianAI** is a real-time, AI-powered platform designed to combat the spread of digital misinformation. It provides a suite of advanced tools to analyze images, videos, audio, and news articles for signs of manipulation, deepfakes, and credibility issues, delivering explainable results to empower users to trust what they see and read.

This project was built for the "Trust: deepfakes, misinformation, safety" hackathon.

## ✨ Features

GuardianAI offers four core analysis modules through an intuitive and unified dashboard:

-   **🖼️ Image Analysis:** Upload an image to detect sophisticated manipulations like GAN-generated artifacts, facial swaps, and other signs of digital alteration. The tool generates a heatmap to highlight manipulated regions and provides a detailed AI-powered explanation.
-   **📹 Video Analysis:** Analyze video files for deepfake indicators. The AI examines frames for unnatural movements, facial inconsistencies, and lighting anomalies to determine if a video has been synthetically altered.
-   **🎙️ Audio Analysis:** Detect voice cloning and synthetic audio. The system analyzes audio patterns, frequency, and other characteristics to identify AI-generated or cloned voices.
-   **📰 Text Analysis:** Assess the credibility of news articles. Paste the text of an article and its source, and the AI will provide a concise summary, a credibility score from 0-100, and verification against known sources.

## 🚀 Technology Stack

GuardianAI is built with a modern, scalable, and AI-native technology stack.

-   **Frontend:**
    -   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
    -   **UI:** [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)
    -   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
    -   **Components:** [ShadCN UI](https://ui.shadcn.com/)

-   **Backend & AI:**
    -   **Hosting:** [Firebase App Hosting](https://firebase.google.com/docs/hosting)
    -   **AI Orchestration:** [Genkit (from Firebase)](https://firebase.google.com/docs/genkit)
    -   **Core Models:** Google's **Gemini family** (including Gemini 2.5 Flash for multimodal analysis).

-   **Development & Deployment:**
    -   **Containerization:** The application is containerized using **Docker**, ensuring a consistent and reproducible development environment across different machines. This approach simplifies dependency management and streamlines the path to production.

-   **AI Model Research & Evaluation:**
    -   During our research phase, we evaluated the performance of various models and architectures. This included benchmarking prompt-chaining strategies on high-performance compute hardware, such as **Cerebras** systems, to understand the latency and cost implications of different approaches at scale.
    -   For future work, we are exploring fine-tuning smaller, specialized models like **Llama** for domain-specific tasks (e.g., detecting medical misinformation), which could run as edge functions for even lower latency.

## ⚙️ Getting Started

To run GuardianAI locally, you will need to have [Docker](https://www.docker.com/get-started) and [Node.js](https://nodejs.org/) installed.

### 1. Environment Setup

Before running the application, you need to set up your environment variables. Create a `.env` file in the root of the project and add your Google AI API key:

```bash
GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

### 2. Build the Docker Image

Build the Docker image using the provided `Dockerfile`:

```bash
docker build -t guardian-ai .
```

### 3. Run the Docker Container

Once the image is built, run it in a container. This will start the Next.js application on port 9002.

```bash
docker run -p 9002:9002 --env-file .env guardian-ai
```

### 4. Access the Application

Open your web browser and navigate to **http://localhost:9002**. You can now use the GuardianAI dashboard to analyze your media files.

## 🤝 Contribution

This project is open-source and contributions are welcome. Feel free to open an issue or submit a pull request.
