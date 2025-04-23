import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Sparkles, AlertTriangle } from "lucide-react";

interface SWOTAnalysisProps {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export function SWOTAnalysis({ strengths, weaknesses, opportunities, threats }: SWOTAnalysisProps) {
  const quadrantVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: custom * 0.05 + 0.3,
        duration: 0.3
      }
    })
  };

  return (
    <div>
      {/* Desktop Version - Grid Layout */}
      <div className="hidden md:grid grid-cols-2 gap-4">
        <motion.div 
          className="col-span-1"
          variants={quadrantVariants}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <Card className="h-full border-0 bg-gradient-to-br from-green-500/30 to-green-500/5 backdrop-blur-sm hover:from-green-500/40 hover:to-green-500/10 transition-all duration-300 shadow-lg shadow-green-500/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4 bg-green-500/10 p-2 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <ThumbsUp className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="font-semibold text-white text-lg">Strengths</h3>
              </div>
              <div className="space-y-3 pl-2">
                {strengths.map((strength, i) => (
                  <motion.div 
                    key={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    className="flex items-start gap-3 group"
                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  >
                    <span className="rounded-full bg-green-500/20 text-green-400 flex items-center justify-center h-6 w-6 text-xs font-bold mt-0.5 group-hover:bg-green-500/40 transition-colors">
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/90 leading-tight">{strength}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          className="col-span-1"
          variants={quadrantVariants}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <Card className="h-full border-0 bg-gradient-to-br from-red-500/30 to-red-500/5 backdrop-blur-sm hover:from-red-500/40 hover:to-red-500/10 transition-all duration-300 shadow-lg shadow-red-500/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4 bg-red-500/10 p-2 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <ThumbsDown className="h-5 w-5 text-red-400" />
                </div>
                <h3 className="font-semibold text-white text-lg">Weaknesses</h3>
              </div>
              <div className="space-y-3 pl-2">
                {weaknesses.map((weakness, i) => (
                  <motion.div 
                    key={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    className="flex items-start gap-3 group"
                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  >
                    <span className="rounded-full bg-red-500/20 text-red-400 flex items-center justify-center h-6 w-6 text-xs font-bold mt-0.5 group-hover:bg-red-500/40 transition-colors">
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/90 leading-tight">{weakness}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          className="col-span-1"
          variants={quadrantVariants}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <Card className="h-full border-0 bg-gradient-to-br from-primary/30 to-primary/5 backdrop-blur-sm hover:from-primary/40 hover:to-primary/10 transition-all duration-300 shadow-lg shadow-primary/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4 bg-primary/10 p-2 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-white text-lg">Opportunities</h3>
              </div>
              <div className="space-y-3 pl-2">
                {opportunities.map((opportunity, i) => (
                  <motion.div 
                    key={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    className="flex items-start gap-3 group"
                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  >
                    <span className="rounded-full bg-primary/20 text-primary flex items-center justify-center h-6 w-6 text-xs font-bold mt-0.5 group-hover:bg-primary/40 transition-colors">
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/90 leading-tight">{opportunity}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          className="col-span-1"
          variants={quadrantVariants}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          <Card className="h-full border-0 bg-gradient-to-br from-amber-500/30 to-amber-500/5 backdrop-blur-sm hover:from-amber-500/40 hover:to-amber-500/10 transition-all duration-300 shadow-lg shadow-amber-500/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4 bg-amber-500/10 p-2 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <h3 className="font-semibold text-white text-lg">Threats</h3>
              </div>
              <div className="space-y-3 pl-2">
                {threats.map((threat, i) => (
                  <motion.div 
                    key={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    className="flex items-start gap-3 group"
                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  >
                    <span className="rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center h-6 w-6 text-xs font-bold mt-0.5 group-hover:bg-amber-500/40 transition-colors">
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/90 leading-tight">{threat}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Mobile Version - Tabs */}
      <div className="md:hidden">
        <Tabs defaultValue="strengths" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4 bg-vision-purple-100/10 p-1">
            <TabsTrigger 
              value="strengths" 
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-white/70 hover:text-white"
            >
              <ThumbsUp className="h-4 w-4 mr-1.5" />
              <span className="sr-only sm:not-sr-only sm:inline-block">Strengths</span>
            </TabsTrigger>
            <TabsTrigger 
              value="weaknesses" 
              className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-white/70 hover:text-white"
            >
              <ThumbsDown className="h-4 w-4 mr-1.5" />
              <span className="sr-only sm:not-sr-only sm:inline-block">Weaknesses</span>
            </TabsTrigger>
            <TabsTrigger 
              value="opportunities" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-white/70 hover:text-white"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              <span className="sr-only sm:not-sr-only sm:inline-block">Opportunities</span>
            </TabsTrigger>
            <TabsTrigger 
              value="threats"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-white/70 hover:text-white"
            >
              <AlertTriangle className="h-4 w-4 mr-1.5" />
              <span className="sr-only sm:not-sr-only sm:inline-block">Threats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="strengths" className="animate-in fade-in-50 duration-300">
            <Card className="border-0 bg-gradient-to-br from-green-500/30 to-green-500/5 backdrop-blur-sm shadow-lg shadow-green-500/10">
              <CardContent className="p-4 space-y-3">
                {strengths.map((strength, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <span className="rounded-full bg-green-500/20 text-green-400 flex items-center justify-center h-6 w-6 text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/90 leading-tight">{strength}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weaknesses" className="animate-in fade-in-50 duration-300">
            <Card className="border-0 bg-gradient-to-br from-red-500/30 to-red-500/5 backdrop-blur-sm shadow-lg shadow-red-500/10">
              <CardContent className="p-4 space-y-3">
                {weaknesses.map((weakness, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <span className="rounded-full bg-red-500/20 text-red-400 flex items-center justify-center h-6 w-6 text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/90 leading-tight">{weakness}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="animate-in fade-in-50 duration-300">
            <Card className="border-0 bg-gradient-to-br from-primary/30 to-primary/5 backdrop-blur-sm shadow-lg shadow-primary/10">
              <CardContent className="p-4 space-y-3">
                {opportunities.map((opportunity, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <span className="rounded-full bg-primary/20 text-primary flex items-center justify-center h-6 w-6 text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/90 leading-tight">{opportunity}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="threats" className="animate-in fade-in-50 duration-300">
            <Card className="border-0 bg-gradient-to-br from-amber-500/30 to-amber-500/5 backdrop-blur-sm shadow-lg shadow-amber-500/10">
              <CardContent className="p-4 space-y-3">
                {threats.map((threat, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <span className="rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center h-6 w-6 text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/90 leading-tight">{threat}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}