import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { 
  BrainCircuit, 
  Sparkles, 
  ArrowRight, 
  Loader2
} from "lucide-react";
import * as THREE from "three";

export default function HomePage() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [startupIdea, setStartupIdea] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  
  // Initialize Three.js background animation
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 20;
    cameraRef.current = camera;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    
    // Create particle geometry
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      // Position
      posArray[i] = (Math.random() - 0.5) * 50;
      
      // Colors - purples and blues for vision UI theme
      if (i % 3 === 0) { // R value
        colorArray[i] = Math.random() * 0.5 + 0.3; // purple-ish
      } else if (i % 3 === 1) { // G value
        colorArray[i] = Math.random() * 0.2;
      } else { // B value
        colorArray[i] = Math.random() * 0.5 + 0.5; // blue-ish
      }
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    
    // Material
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    
    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    pointsRef.current = particlesMesh;
    
    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (pointsRef.current) {
        pointsRef.current.rotation.x += 0.0003;
        pointsRef.current.rotation.y += 0.0005;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (pointsRef.current) {
        pointsRef.current.geometry.dispose();
        (pointsRef.current.material as THREE.Material).dispose();
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);
  
  const handleAnalyze = async () => {
    if (!startupIdea.trim() || isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    try {
      // In a real implementation, this would call your API
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error analyzing startup idea:", error);
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-vision-bg flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-[260px]">
        <Header />
        
        <main className="flex-grow flex items-center justify-center overflow-hidden relative px-6 py-12">
          {/* Three.js background canvas */}
          <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-full -z-10"
          />
          
          {/* Centered prompt box */}
          <div className="w-full max-w-3xl">
            <div className="vision-card overflow-hidden p-8 relative">
              {/* Glowing effect at the top */}
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full" 
                style={{
                  background: "radial-gradient(circle, rgba(161, 99, 247, 0.3) 0%, rgba(161, 99, 247, 0) 70%)",
                  filter: "blur(20px)"
                }}
              />
              
              <div className="flex items-center justify-center space-x-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-vision-primary-gradient flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">GENIQL AI Startup Analysis</h1>
                  <p className="text-white/60 text-sm">Free users get all 8 analysis points in basic mode</p>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="startup-idea" className="block text-white/90 font-medium mb-2">
                  Describe your startup idea in detail
                </label>
                <Textarea
                  id="startup-idea"
                  value={startupIdea}
                  onChange={(e) => setStartupIdea(e.target.value)}
                  placeholder="Example: A subscription service that delivers personalized book recommendations based on AI analysis of reading preferences and behavior..."
                  className="h-32 bg-vision-card/80 border-vision-purple-200/20 text-white placeholder:text-white/40 focus:border-vision-purple-500"
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleAnalyze}
                  disabled={!startupIdea.trim() || isAnalyzing}
                  className="bg-vision-primary-gradient hover:brightness-110 transition-all text-white font-medium"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze My Startup Idea
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
              
              {/* Bottom glowing effect */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20" 
                style={{
                  background: "radial-gradient(ellipse at center, rgba(161, 99, 247, 0.15) 0%, rgba(161, 99, 247, 0) 70%)",
                  filter: "blur(20px)"
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
