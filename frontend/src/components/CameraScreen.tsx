import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  X,
  RotateCcw,
  Loader2,
  Leaf,
  ShoppingBag,
  Zap,
  Utensils,
  FileText,
  Droplet,
  Trash,
  Package,
} from "lucide-react";
import { callGeminiWithImage } from "../ai";

interface WasteItem {
  name: string;
  category: "compost" | "plastic" | "paper" | "metal" | "glass" | "organic" | "landfill";
  recyclable: boolean;
  confidence?: number;
  description?: string;
}

interface WasteAnalysisResult {
  items: WasteItem[];
}

export function CameraScreen() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<WasteAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Start camera stream
  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions.");
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // Analyze image with Gemini
  const analyzeImage = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert base64 to File
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });

      const schema = {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                category: {
                  type: "string",
                  enum: ["compost", "plastic", "paper", "metal", "glass", "organic", "landfill"]
                },
                recyclable: { type: "boolean" },
                confidence: { type: "number" },
                description: { type: "string" }
              },
              required: ["name", "category", "recyclable"]
            }
          }
        },
        required: ["items"]
      };

      const result = await callGeminiWithImage<WasteAnalysisResult>(
        `Analyze this image and detect ALL visible objects that could be waste or recyclable materials.

For EACH object detected, provide:
- name: descriptive name based on appearance (e.g., "banana peel", "plastic water bottle", "aluminum can", "cardboard box")
- category: classify as one of: "compost", "plastic", "paper", "metal", "glass", "organic", "landfill"
- recyclable: true if the item is recyclable, false otherwise
- confidence: your confidence level 0-100 in this categorization
- description: brief reason for the categorization

Return ALL objects visible in the image as a list.`,
        file,
        schema
      );

      setAnalysis(result);
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset to camera
  const reset = () => {
    setCapturedImage(null);
    setAnalysis(null);
    setError(null);
    startCamera();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "compost":
        return <Leaf className="h-4 w-4" />;
      case "plastic":
        return <ShoppingBag className="h-4 w-4" />;
      case "paper":
        return <FileText className="h-4 w-4" />;
      case "metal":
        return <Zap className="h-4 w-4" />;
      case "glass":
        return <Droplet className="h-4 w-4" />;
      case "organic":
        return <Leaf className="h-4 w-4" />;
      case "landfill":
        return <Trash className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "compost":
        return "bg-amber-600";
      case "plastic":
        return "bg-blue-600";
      case "paper":
        return "bg-yellow-600";
      case "metal":
        return "bg-gray-600";
      case "glass":
        return "bg-cyan-600";
      case "organic":
        return "bg-green-600";
      case "landfill":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-green-900/20 to-transparent p-4 pb-6">
        <h1 className="text-2xl font-bold">Waste Sorter</h1>
        <p className="text-sm text-muted-foreground">
          Scan items to categorize waste
        </p>
      </div>

      <div className="px-4 space-y-4">
        {/* Camera/Image View */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {!capturedImage && !stream && (
              <div className="aspect-[3/4] bg-muted flex flex-col items-center justify-center gap-4">
                <Camera className="h-16 w-16 text-muted-foreground" />
                <div className="space-y-2">
                  <Button onClick={startCamera} size="lg">
                    <Camera className="mr-2 h-5 w-5" />
                    Open Camera
                  </Button>
                  <div className="text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      size="lg"
                    >
                      Upload Photo
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {stream && !capturedImage && (
              <div className="relative aspect-[3/4]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={stopCamera}
                    className="bg-background/80 backdrop-blur"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={capturePhoto}
                    className="h-16 w-16 rounded-full bg-white hover:bg-white/90"
                  >
                    <Camera className="h-8 w-8 text-black" />
                  </Button>
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="relative aspect-[3/4]">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
                {!analysis && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={reset}
                      className="bg-background/80 backdrop-blur"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                    <Button
                      size="lg"
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Leaf className="mr-2 h-5 w-5" />
                          Categorize Waste
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-4">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Detected {analysis.items.length} {analysis.items.length === 1 ? 'item' : 'items'}
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Items List */}
            {analysis.items.map((item, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg capitalize">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <Badge className={getCategoryColor(item.category)}>
                      {getCategoryIcon(item.category)}
                      <span className="ml-1 capitalize">{item.category}</span>
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1.5 rounded-full ${
                      item.recyclable
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      <span className="text-sm font-medium">
                        {item.recyclable ? '♻️ Recyclable' : '🚫 Not Recyclable'}
                      </span>
                    </div>

                    {item.confidence && (
                      <span className="text-xs text-muted-foreground">
                        {item.confidence}% confident
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={reset} className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Scan Another
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                <Leaf className="mr-2 h-4 w-4" />
                Log Items
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
