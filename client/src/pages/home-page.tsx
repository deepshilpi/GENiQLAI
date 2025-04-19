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
  
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [analysisStep, setAnalysisStep] = useState<'input' | 'results'>('input');
  
  const handleAnalyze = async () => {
    if (!startupIdea.trim() || isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    try {
      // Import analyzeStartupIdea from our client-side openai.ts utility
      const { analyzeStartupIdea } = await import('@/lib/openai');
      
      // Call the API through our utility function
      const results = await analyzeStartupIdea(startupIdea);
      
      // Set the results and update the UI state
      setAnalysisResults(results);
      setAnalysisStep('results');
    } catch (error) {
      console.error("Error analyzing startup idea:", error);
      // Display a more user-friendly error
      alert("We couldn't analyze your startup idea at this moment. Please try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-vision-bg flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col main-content transition-all duration-300">
        <Header />
        
        <main className="flex-grow flex items-center justify-center overflow-hidden relative px-6 py-12">
          {/* Three.js background canvas */}
          <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-full -z-10"
          />
          
          {/* Content based on analysis step */}
          {analysisStep === 'input' ? (
            /* Centered prompt box */
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
                
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-3 mb-8 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-xl bg-vision-primary-gradient flex items-center justify-center">
                    <BrainCircuit className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">GENIQL AI Startup Analysis</h1>
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
                
                <div className="flex justify-center sm:justify-end">
                  <Button 
                    onClick={handleAnalyze}
                    disabled={!startupIdea.trim() || isAnalyzing}
                    className="bg-vision-primary-gradient hover:brightness-110 transition-all text-white font-medium w-full sm:w-auto"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Analyze My Startup Idea</span>
                        <span className="sm:hidden">Analyze Idea</span>
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
          ) : (
            /* Analysis Results */
            <div className="w-full max-w-7xl">
              <div className="flex flex-col space-y-6">
                {/* Header with back button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <Button 
                    variant="ghost" 
                    className="text-white/70 hover:text-white hover:bg-vision-purple-100/10 self-start"
                    onClick={() => setAnalysisStep('input')}
                  >
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                    Back to Input
                  </Button>
                  
                  <div className="flex items-center">
                    <Button 
                      variant="ghost"
                      className="text-white/70 hover:text-white hover:bg-vision-purple-100/10 mr-2 header-actions"
                    >
                      Share Results
                    </Button>
                    <Button 
                      className="bg-vision-primary-gradient hover:brightness-110 transition-all text-white"
                    >
                      Save Analysis
                    </Button>
                  </div>
                </div>
                
                {/* Idea summary */}
                <div className="vision-card p-6">
                  <h2 className="text-xl font-bold text-white mb-2">Analyzed Startup Idea</h2>
                  <p className="text-white/80">{startupIdea}</p>
                </div>
                
                {/* Results grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 results-grid">
                  {/* Success Rate */}
                  {analysisResults?.successRate && (
                    <div className="vision-card p-6 flex flex-col">
                      <h3 className="text-lg font-bold text-white mb-4">Success Rate</h3>
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="relative w-32 h-32 mb-4">
                          <div className="absolute inset-0 rounded-full border-8 border-vision-purple-100/20"></div>
                          <div 
                            className="absolute inset-0 rounded-full border-8 border-vision-primary-gradient"
                            style={{ clipPath: `inset(0 ${100 - analysisResults.successRate.percentage}% 0 0)` }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold text-white">{analysisResults.successRate.percentage}%</span>
                          </div>
                        </div>
                        <p className="text-center text-white/70">{analysisResults.successRate.message}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Competitors */}
                  {analysisResults?.competitors && (
                    <div className="vision-card p-6 flex flex-col">
                      <h3 className="text-lg font-bold text-white mb-4">Market Competitors</h3>
                      <div className="flex-1">
                        {analysisResults.competitors.competitors.map((competitor: any, index: number) => (
                          <div key={index} className="mb-3">
                            <div className="flex justify-between mb-1">
                              <span className="text-white/80">{competitor.name}</span>
                              <span className="text-white font-medium">{competitor.marketShare}%</span>
                            </div>
                            <div className="vision-progress">
                              <div 
                                className="vision-progress-bar" 
                                style={{ width: `${competitor.marketShare}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                        <p className="text-white/70 text-sm mt-4">{analysisResults.competitors.message}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Market Viability */}
                  {analysisResults?.marketViability && (
                    <div className="vision-card p-6 flex flex-col">
                      <h3 className="text-lg font-bold text-white mb-4">Market Viability</h3>
                      <div className="flex-1">
                        {analysisResults.marketViability.points.map((point: any, index: number) => (
                          <div key={index} className="mb-4 last:mb-0">
                            <div className="flex items-start">
                              <div className={`w-3 h-3 rounded-full mt-1 mr-3 ${
                                point.type === 'success' ? 'bg-green-500' : 
                                point.type === 'warning' ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`}></div>
                              <div>
                                <h4 className="text-white font-medium">{point.title}</h4>
                                <p className="text-white/70 text-sm">{point.subtitle}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Unique Value Proposition */}
                  {analysisResults?.uniqueValueProposition && (
                    <div className="vision-card p-6 flex flex-col col-span-1 md:col-span-2">
                      <h3 className="text-lg font-bold text-white mb-4">Unique Value Proposition</h3>
                      <div className="flex-1">
                        <p className="mb-4 text-white/80 italic">{analysisResults.uniqueValueProposition.differentiator}</p>
                        <h4 className="text-white font-medium mb-2">Key Strengths:</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {analysisResults.uniqueValueProposition.strengths.map((strength: string, index: number) => (
                            <li key={index} className="flex items-center text-white/70">
                              <div className="w-2 h-2 rounded-full bg-vision-purple-700 mr-2"></div>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {/* CAGR Analysis */}
                  {analysisResults?.cagr && (
                    <div className="vision-card p-6 flex flex-col col-span-1 md:col-span-3">
                      <h3 className="text-lg font-bold text-white mb-2">Growth Projection (CAGR)</h3>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-vision-purple-700 mr-2"></div>
                          <span className="text-white/70 mr-6">Your Potential: {analysisResults.cagr.potential}%</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                          <span className="text-white/70">Industry Average: {analysisResults.cagr.industryAverage}%</span>
                        </div>
                      </div>
                      <div className="h-64 w-full">
                        {/* This would be a chart in a real implementation */}
                        <div className="h-full w-full bg-vision-purple-100/10 rounded-lg p-4 flex items-end">
                          {analysisResults.cagr.data.years.map((year: string, index: number) => (
                            <div key={index} className="flex-1 flex flex-col items-center h-full">
                              <div className="flex-1 w-full flex items-end justify-center space-x-2">
                                <div 
                                  className="w-3 bg-blue-500 rounded-t-sm" 
                                  style={{ 
                                    height: `${(analysisResults.cagr.data.industryAverageData[index] / 
                                      Math.max(...analysisResults.cagr.data.potentialData)) * 100}%` 
                                  }}
                                ></div>
                                <div 
                                  className="w-3 bg-vision-purple-700 rounded-t-sm" 
                                  style={{ 
                                    height: `${(analysisResults.cagr.data.potentialData[index] / 
                                      Math.max(...analysisResults.cagr.data.potentialData)) * 100}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-white/60 text-xs mt-2">{year}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Bottom action buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                  <Button 
                    variant="outline" 
                    className="border-vision-purple-200/20 text-white hover:bg-vision-purple-100/10 w-full sm:w-auto"
                    onClick={() => setAnalysisStep('input')}
                  >
                    Try Another Idea
                  </Button>
                  
                  <div className="flex w-full sm:w-auto">
                    <Button 
                      className="bg-vision-primary-gradient hover:brightness-110 transition-all text-white w-full sm:w-auto"
                    >
                      Get Detailed Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
