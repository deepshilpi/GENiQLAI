import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, ThermometerSun, Droplets, Wind } from "lucide-react";

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
}

export function WeatherWidget() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeatherData() {
      try {
        setLoading(true);
        
        // First get user's location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });
        
        const { latitude, longitude } = position.coords;
        
        // Use OpenWeatherMap API for weather data
        const apiKey = "8e775589e81259fe61b32cf92e7215e5"; // Free API key with limited quota
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
        );

        if (!response.ok) {
          throw new Error("Weather service unavailable");
        }

        const data = await response.json();
        
        setWeatherData({
          location: data.name,
          temperature: Math.round(data.main.temp),
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          description: data.weather[0].description,
          icon: data.weather[0].icon
        });
      } catch (err: any) {
        console.error("Error fetching weather data:", err);
        setError(err.message || "Unable to fetch weather data");
      } finally {
        setLoading(false);
      }
    }

    fetchWeatherData();
  }, []);

  // Get current time in local timezone
  const currentTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Get current date in local format
  const currentDate = new Date().toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  });

  return (
    <Card className="border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-sm shadow-lg shadow-vision-purple-200/10 overflow-hidden">
      <CardContent className="p-4">
        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        ) : error ? (
          <div className="h-32 flex items-center justify-center text-center">
            <p className="text-white/60 text-sm">Unable to fetch weather data</p>
          </div>
        ) : weatherData ? (
          <div className="flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-lg font-semibold text-white">{currentTime}</div>
                <div className="text-sm text-white/60">{currentDate}</div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-2xl font-bold text-white flex items-center">
                  {weatherData.temperature}°C
                </div>
                <div className="text-xs text-white/60 capitalize flex items-center gap-1">
                  <ThermometerSun className="h-3 w-3" />
                  {weatherData.description}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <MapPin className="h-3 w-3" />
                <span>{weatherData.location}</span>
              </div>
              
              <div className="flex gap-2">
                <div className="flex items-center gap-1 text-white/80 text-xs">
                  <Droplets className="h-3 w-3" />
                  <span>{weatherData.humidity}%</span>
                </div>
                <div className="flex items-center gap-1 text-white/80 text-xs">
                  <Wind className="h-3 w-3" />
                  <span>{weatherData.windSpeed} m/s</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}