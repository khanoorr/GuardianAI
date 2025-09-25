import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ImageAnalysis from "@/components/dashboard/image-analysis"
import TextAnalysis from "@/components/dashboard/text-analysis"
import AudioAnalysis from "@/components/dashboard/audio-analysis"
import VideoAnalysis from "@/components/dashboard/video-analysis"
import Logo from "@/components/logo"
import { ScanFace, FileText, MicVocal, Video } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-background selection:bg-primary/20">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold tracking-tight text-foreground">
            GuardianAI
          </h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center gap-4 p-4 md:gap-8 md:p-8">
        <div className="w-full max-w-6xl">
          <div className="mb-8 grid gap-2">
            <h2 className="font-headline text-3xl font-semibold tracking-tight">Detection Dashboard</h2>
            <p className="text-muted-foreground">
              Upload your media to detect deepfakes and misinformation in real-time.
            </p>
          </div>
          
          <Tabs defaultValue="image" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-14 rounded-lg p-2">
              <TabsTrigger value="image" className="flex items-center gap-2 text-base h-full">
                <ScanFace className="h-5 w-5" /> Image Analysis
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2 text-base h-full">
                <FileText className="h-5 w-5" /> Text Analysis
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2 text-base h-full">
                <MicVocal className="h-5 w-5" /> Audio Analysis
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-2 text-base h-full">
                <Video className="h-5 w-5" /> Video Analysis
              </TabsTrigger>
            </TabsList>
            <TabsContent value="image" className="mt-6">
              <ImageAnalysis />
            </TabsContent>
            <TabsContent value="text" className="mt-6">
              <TextAnalysis />
            </TabsContent>
            <TabsContent value="audio" className="mt-6">
              <AudioAnalysis />
            </TabsContent>
            <TabsContent value="video" className="mt-6">
              <VideoAnalysis />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <footer className="border-t bg-background/50 py-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          Built for the "Trust: deepfakes, misinformation, safety" hackathon.
        </div>
      </footer>
    </div>
  );
}
