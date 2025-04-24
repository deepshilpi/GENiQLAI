import { useEffect, useRef } from 'react';
import { Chart, ChartType, ChartData, ChartOptions } from 'chart.js';
import { DoughnutController, ArcElement, Tooltip, Legend, TooltipItem } from 'chart.js';
import { formatCurrency } from '@/lib/utils';

// Register required Chart.js components
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

interface MarketSizeChartProps {
  segments: Array<{
    name: string;
    percentage: number;
    value: number;
    growth?: number;
  }>;
  totalSize: number;
  currency: string;
}

export function MarketSizeChart({ segments, totalSize, currency }: MarketSizeChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart<ChartType, number[], string> | null>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy existing chart if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Format the data for Chart.js
    const labels = segments.map(segment => segment.name);
    const data = segments.map(segment => segment.value);
    
    // Generate colors (can be customized)
    const colors = [
      'rgba(117, 81, 255, 0.8)',  // Primary purple
      'rgba(161, 99, 247, 0.8)',  // Secondary purple
      'rgba(203, 159, 255, 0.8)', // Light purple
      'rgba(0, 117, 255, 0.8)',   // Blue
      'rgba(86, 171, 255, 0.8)',  // Light blue
      'rgba(148, 201, 255, 0.8)'  // Very light blue
    ];
    
    // Create the chart data
    const chartData: ChartData<'doughnut', number[], string> = {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, segments.length),
        borderWidth: 0,
        hoverOffset: 5
      }]
    };
    
    // Create chart options
    const chartOptions: ChartOptions<'doughnut'> = {
      cutout: '70%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<'doughnut'>) => {
              const label = context.label || '';
              const value = context.raw as number;
              const percentage = (value / totalSize * 100).toFixed(1);
              return `${label}: ${formatCurrency(value, currency, undefined, true)} (${percentage}%)`;
            }
          }
        }
      },
      maintainAspectRatio: false
    };
    
    // Create the chart
    chartInstanceRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options: chartOptions
    });
    
    // Cleanup function
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [segments, totalSize, currency]);
  
  return (
    <div className="h-48 w-full relative flex justify-center items-center">
      <canvas ref={chartRef}></canvas>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-xs text-muted-foreground">Total Market</div>
        <div className="text-xl font-bold">{formatCurrency(totalSize, currency, undefined, true)}</div>
      </div>
    </div>
  );
}