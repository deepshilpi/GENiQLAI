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
      <div className="hidden md:grid grid-cols-2 gap-3">
        <motion.div 
          className="col-span-1"
          variants={quadrantVariants}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <Card className="h-full border-green-500/30 bg-green-500/5 hover:bg-green-500/10 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsUp className="h-5 w-5 text-green-500" />
                <h3 className="font-medium text-white">Strengths</h3>
              </div>
              <div className="space-y-2">
                {strengths.map((strength, i) => (
                  <motion.div 
                    key={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    className="flex items-start gap-2"
                  >
                    <span className="rounded-full bg-green-500/20 text-green-500 flex items-center justify-center h-5 w-5 text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/80">{strength}</p>
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
          <Card className="h-full border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsDown className="h-5 w-5 text-red-500" />
                <h3 className="font-medium text-white">Weaknesses</h3>
              </div>
              <div className="space-y-2">
                {weaknesses.map((weakness, i) => (
                  <motion.div 
                    key={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    className="flex items-start gap-2"
                  >
                    <span className="rounded-full bg-red-500/20 text-red-500 flex items-center justify-center h-5 w-5 text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/80">{weakness}</p>
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
          <Card className="h-full border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-white">Opportunities</h3>
              </div>
              <div className="space-y-2">
                {opportunities.map((opportunity, i) => (
                  <motion.div 
                    key={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    className="flex items-start gap-2"
                  >
                    <span className="rounded-full bg-primary/20 text-primary flex items-center justify-center h-5 w-5 text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/80">{opportunity}</p>
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
          <Card className="h-full border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="font-medium text-white">Threats</h3>
              </div>
              <div className="space-y-2">
                {threats.map((threat, i) => (
                  <motion.div 
                    key={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    className="flex items-start gap-2"
                  >
                    <span className="rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center h-5 w-5 text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/80">{threat}</p>
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
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="strengths" className="data-[state=active]:bg-green-500/20">
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span className="sr-only sm:not-sr-only sm:inline-block">Strengths</span>
            </TabsTrigger>
            <TabsTrigger value="weaknesses" className="data-[state=active]:bg-red-500/20">
              <ThumbsDown className="h-4 w-4 mr-1" />
              <span className="sr-only sm:not-sr-only sm:inline-block">Weaknesses</span>
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="data-[state=active]:bg-primary/20">
              <Sparkles className="h-4 w-4 mr-1" />
              <span className="sr-only sm:not-sr-only sm:inline-block">Opportunities</span>
            </TabsTrigger>
            <TabsTrigger value="threats" className="data-[state=active]:bg-amber-500/20">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span className="sr-only sm:not-sr-only sm:inline-block">Threats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="strengths">
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="p-4 space-y-2">
                {strengths.map((strength, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="rounded-full bg-green-500/20 text-green-500 flex items-center justify-center h-5 w-5 text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/80">{strength}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weaknesses">
            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="p-4 space-y-2">
                {weaknesses.map((weakness, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="rounded-full bg-red-500/20 text-red-500 flex items-center justify-center h-5 w-5 text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/80">{weakness}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4 space-y-2">
                {opportunities.map((opportunity, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="rounded-full bg-primary/20 text-primary flex items-center justify-center h-5 w-5 text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/80">{opportunity}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="threats">
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4 space-y-2">
                {threats.map((threat, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center h-5 w-5 text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/80">{threat}</p>
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