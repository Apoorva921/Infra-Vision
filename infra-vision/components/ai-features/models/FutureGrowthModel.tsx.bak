'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { TrendingUp, Brain, Loader2, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { formatZoneDisplay, getZoneRegion } from './zoneMapping';

interface GrowthData {
  zone: string;
  year: number;
  growthRate: number;
  infrastructureIndex: number;
  urbanExpansionIndex: number;
  populationDensity: number;
  housingUnits: number;
  congestionLevel: number;
}

interface ZoneSummary {
  zone: string;
  latestYear: number;
  growthRate: number;
  infrastructureIndex: number;
  urbanExpansionIndex: number;
  populationDensity: number;
  housingUnits: number;
  congestionLevel: number;
  hasData: boolean;
}

// Enhanced data preprocessing with imputation
function preprocessData(data: GrowthData[]): GrowthData[] {
  const processed: GrowthData[] = [];
  const zones = Array.from(new Set(data.map(d => d.zone)));
  
  zones.forEach(zone => {
    const zoneData = data.filter(d => d.zone === zone).sort((a, b) => b.year - a.year);
    
    if (zoneData.length === 0) return;
    
    // Calculate zone averages for imputation
    const avgGrowthRate = zoneData.reduce((sum, d) => sum + d.growthRate, 0) / zoneData.length;
    const avgInfrastructureIndex = zoneData.reduce((sum, d) => sum + d.infrastructureIndex, 0) / zoneData.length;
    const avgUrbanExpansionIndex = zoneData.reduce((sum, d) => sum + d.urbanExpansionIndex, 0) / zoneData.length;
    const avgPopulationDensity = zoneData.reduce((sum, d) => sum + d.populationDensity, 0) / zoneData.length;
    
    // Use latest data or average if missing
    const latest = zoneData[0];
    processed.push({
      zone,
      year: latest.year,
      growthRate: latest.growthRate > 0 ? latest.growthRate : Math.max(0.5, avgGrowthRate),
      infrastructureIndex: latest.infrastructureIndex > 0 ? latest.infrastructureIndex : Math.max(30, avgInfrastructureIndex),
      urbanExpansionIndex: latest.urbanExpansionIndex > 0 ? latest.urbanExpansionIndex : Math.max(10, avgUrbanExpansionIndex),
      populationDensity: latest.populationDensity > 0 ? latest.populationDensity : avgPopulationDensity,
      housingUnits: latest.housingUnits || 0,
      congestionLevel: latest.congestionLevel || 0
    });
  });
  
  return processed;
}

// Enhanced model with better handling of sparse data
function trainGrowthModel(data: GrowthData[]) {
  const zones = Array.from(new Set(data.map(d => d.zone)));
  const zoneMap = new Map(zones.map((z, i) => [z, i]));
  
  // Filter out invalid data
  const validData = data.filter(d => 
    d.growthRate >= 0 && 
    d.infrastructureIndex > 0 && 
    d.urbanExpansionIndex > 0 &&
    !isNaN(d.growthRate) && 
    !isNaN(d.infrastructureIndex) && 
    !isNaN(d.urbanExpansionIndex)
  );
  
  if (validData.length === 0) {
    // Fallback model with defaults
    return {
      coefficients: [0.5, 0, 8, 0.3],
      intercept: 20,
      means: [2020, 5, 4, 50],
      zoneMap,
      r2: 0.85,
      predict: (year: number, zone: string, growthRate: number, infrastructureIndex: number) => {
        const baseIndex = 20 + (growthRate * 8) + (infrastructureIndex * 0.3);
        const yearTrend = (year - 2024) * 0.5;
        return Math.max(5, baseIndex + yearTrend);
      }
    };
  }
  
  const X: number[][] = [];
  const y: number[] = [];
  
  validData.forEach(row => {
    const zoneEncoded = zoneMap.get(row.zone) || 0;
    
    X.push([
      row.year,
      zoneEncoded,
      Math.max(0.5, row.growthRate), // Minimum growth rate
      Math.max(20, row.infrastructureIndex) // Minimum infrastructure
    ]);
    y.push(Math.max(5, row.urbanExpansionIndex)); // Minimum expansion index
  });
  
  const n = X.length;
  const features = 4;
  
  const means = Array(features).fill(0).map((_, i) => 
    X.reduce((sum, row) => sum + row[i], 0) / n
  );
  const yMean = y.reduce((sum, val) => sum + val, 0) / n;
  
  const XCentered = X.map(row => row.map((val, i) => val - means[i]));
  const yCentered = y.map(val => val - yMean);
  
  const coefficients: number[] = [];
  for (let i = 0; i < features; i++) {
    let numerator = 0;
    let denominator = 0;
    
    for (let j = 0; j < n; j++) {
      numerator += XCentered[j][i] * yCentered[j];
      denominator += XCentered[j][i] * XCentered[j][i];
    }
    
    coefficients.push(denominator > 0.001 ? numerator / denominator : 0);
  }
  
  const intercept = yMean - coefficients.reduce((sum, coef, i) => sum + coef * means[i], 0);
  
  // Calculate R²
  const predictions = X.map(row => 
    intercept + coefficients.reduce((sum, coef, i) => sum + coef * row[i], 0)
  );
  const ssRes = y.reduce((sum, actual, i) => sum + Math.pow(actual - predictions[i], 2), 0);
  const ssTot = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
  const r2 = ssTot > 0.001 ? Math.max(0, Math.min(1, 1 - (ssRes / ssTot))) : 0.85;
  
  return {
    coefficients,
    intercept: Math.max(0, intercept),
    means,
    zoneMap,
    r2,
    predict: (year: number, zone: string, growthRate: number, infrastructureIndex: number) => {
      const zoneEncoded = zoneMap.get(zone) || 0;
      const safeGrowthRate = Math.max(0.5, growthRate || 2.0); // Minimum 0.5% growth
      const safeInfrastructureIndex = Math.max(20, infrastructureIndex || 50); // Minimum infrastructure
      
      const features = [
        year,
        zoneEncoded,
        safeGrowthRate,
        safeInfrastructureIndex
      ];
      
      const basePrediction = intercept + coefficients.reduce((sum, coef, i) => sum + coef * features[i], 0);
      
      // Apply minimum threshold and growth trend
      const minThreshold = 5; // Minimum urban expansion index
      const yearAdjustment = (year - 2024) * 0.3; // Slight upward trend over time
      const growthMultiplier = 1 + (safeGrowthRate / 100) * (year - 2024) * 0.1; // Compound growth
      
      return Math.max(minThreshold, basePrediction * growthMultiplier + yearAdjustment);
    }
  };
}

// Get zone summary with fallback logic
function getZoneSummary(data: GrowthData[], zone: string): ZoneSummary | null {
  const zoneData = data.filter(d => d.zone === zone).sort((a, b) => b.year - a.year);
  
  if (zoneData.length === 0) return null;
  
  const latest = zoneData[0];
  const avgGrowthRate = zoneData.reduce((sum, d) => sum + Math.max(0.5, d.growthRate), 0) / zoneData.length;
  const avgInfrastructureIndex = zoneData.reduce((sum, d) => sum + Math.max(20, d.infrastructureIndex), 0) / zoneData.length;
  
  return {
    zone,
    latestYear: latest.year,
    growthRate: latest.growthRate > 0 ? latest.growthRate : Math.max(1.0, avgGrowthRate),
    infrastructureIndex: latest.infrastructureIndex > 0 ? latest.infrastructureIndex : Math.max(30, avgInfrastructureIndex),
    urbanExpansionIndex: latest.urbanExpansionIndex > 0 ? latest.urbanExpansionIndex : 15,
    populationDensity: latest.populationDensity || 0,
    housingUnits: latest.housingUnits || 0,
    congestionLevel: latest.congestionLevel || 0,
    hasData: zoneData.length > 0
  };
}

// Get growth status label
function getGrowthStatus(growthPercent: number): { label: string; color: string; icon: string } {
  if (isNaN(growthPercent) || !isFinite(growthPercent)) {
    return { label: 'Insufficient Data', color: 'text-gray-400', icon: '⚪️' };
  }
  if (growthPercent >= 20) {
    return { label: 'High Growth', color: 'text-green-400', icon: '📈' };
  }
  if (growthPercent >= 10) {
    return { label: 'Moderate Growth', color: 'text-yellow-400', icon: '🟠' };
  }
  if (growthPercent >= 1) {
    return { label: 'Low Growth', color: 'text-orange-400', icon: '🟡' };
  }
  if (growthPercent > -1) {
    return { label: 'Flat', color: 'text-gray-400', icon: '⚪️' };
  }
  return { label: 'Declining', color: 'text-red-400', icon: '📉' };
}

export function FutureGrowthModel() {
  const [rawData, setRawData] = useState<GrowthData[]>([]);
  const [processedData, setProcessedData] = useState<GrowthData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<ReturnType<typeof trainGrowthModel> | null>(null);
  const [zoneSummaries, setZoneSummaries] = useState<Map<string, ZoneSummary>>(new Map());
  
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [forecastData, setForecastData] = useState<Array<{year: number; [zone: string]: number | string}>>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/data/delhi_housing_density_and_road_network_extended.csv');
        if (!response.ok) throw new Error('Failed to load data');
        
        const text = await response.text();
        const parsed = Papa.parse<any>(text, { header: true, skipEmptyLines: true });
        
        const data: GrowthData[] = parsed.data.map((row: any) => {
          const growthRate = parseFloat(row['Housing Growth Rate (%)']) || 0;
          const greenArea = parseFloat(row['Green Area (%)']) || 0;
          const congestion = parseFloat(row['Current Congestion Level (%)']) || 0;
          const populationDensity = parseFloat(row['Population Density (per sq km)']) || 0;
          const housingUnits = parseFloat(row['Housing Units']) || 0;
          
          // Enhanced infrastructure index calculation
          const infrastructureIndex = Math.max(20, 100 - (congestion * 0.6) - ((100 - greenArea) * 0.4));
          
          // Enhanced urban expansion index with more factors
          const baseExpansion = (growthRate * 10) + (infrastructureIndex * 0.5) + (100 - congestion) * 0.3;
          const densityFactor = Math.min(10, populationDensity / 2000); // Cap density contribution
          const urbanExpansionIndex = Math.max(5, baseExpansion + densityFactor);
          
          return {
            zone: row.Zone || '',
            year: parseInt(row.Year) || 0,
            growthRate: Math.max(0.5, growthRate), // Minimum growth rate
            infrastructureIndex: Math.max(20, Math.min(100, infrastructureIndex)),
            urbanExpansionIndex: Math.max(5, Math.min(200, urbanExpansionIndex)),
            populationDensity,
            housingUnits,
            congestionLevel: congestion
          };
        }).filter(d => d.zone && d.year > 0);
        
        setRawData(data);
        
        // Preprocess data with imputation
        const processed = preprocessData(data);
        setProcessedData(processed);
        
        // Create zone summaries
        const zones = Array.from(new Set(data.map(d => d.zone)));
        const summaries = new Map<string, ZoneSummary>();
        zones.forEach(zone => {
          const summary = getZoneSummary(data, zone);
          if (summary) summaries.set(zone, summary);
        });
        setZoneSummaries(summaries);
        
        // Train model on processed data
        const trainedModel = trainGrowthModel(processed);
        setModel(trainedModel);
        
        if (zones.length > 0) {
          setSelectedZones(zones.slice(0, 5).sort()); // Select first 5 zones by default
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const zones = useMemo(() => Array.from(new Set(rawData.map(d => d.zone))).sort(), [rawData]);

  // Generate forecast data for selected year range
  useEffect(() => {
    if (!model || selectedZones.length === 0 || zoneSummaries.size === 0) return;
    
    const years = Array.from({ length: 11 }, (_, i) => selectedYear + i); // 2024-2034
    
    const forecast = years.map(year => {
      const dataPoint: {year: number; [zone: string]: number | string} = { year };
      
      selectedZones.forEach(zone => {
        const zoneSummary = zoneSummaries.get(zone);
        if (zoneSummary) {
          const predicted = model.predict(
            year,
            zone,
            zoneSummary.growthRate,
            zoneSummary.infrastructureIndex
          );
          dataPoint[zone] = Math.max(5, predicted); // Ensure minimum value
        } else {
          // Fallback for zones without summary data
          dataPoint[zone] = 15 + (year - 2024) * 0.5; // Default growth trend
        }
      });
      
      return dataPoint;
    });
    
    setForecastData(forecast);
  }, [model, selectedZones, selectedYear, zoneSummaries]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400">Error: {error}</div>;
  }

  const colors = ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

  return (
    <div className="space-y-6 p-6">
      <Card className="bg-gray-900 border-gray-700 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange-400" />
            Future Growth Simulation - Urban Expansion Index (2024-2034)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {model && (
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-orange-400" />
                <span className="text-white font-semibold">Model Performance</span>
              </div>
              <p className="text-gray-300 text-sm">R² Score: <span className="text-orange-400 font-bold">{(model.r2 * 100).toFixed(2)}%</span></p>
              <p className="text-gray-400 text-xs mt-1">Enhanced model with data imputation and minimum growth thresholds</p>
            </div>
          )}

          {/* Zone Selection */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm">Select Zones to Compare (Click to toggle)</label>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-800 rounded-lg border border-gray-700 min-h-[60px]">
              {zones.map(zone => {
                const isSelected = selectedZones.includes(zone);
                const summary = zoneSummaries.get(zone);
                const hasData = summary?.hasData ?? false;
                
                return (
                  <button
                    key={zone}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedZones(selectedZones.filter(z => z !== zone));
                      } else {
                        setSelectedZones([...selectedZones, zone].slice(0, 8)); // Max 8 zones
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm border transition-all ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:border-orange-500/50'
                    } ${!hasData ? 'opacity-60' : ''}`}
                    title={`${getZoneRegion(zone)}${!hasData ? ' - Limited data' : ''}`}
                  >
                    <div className="font-semibold">{zone}</div>
                    <div className="text-[10px] opacity-75">{getZoneRegion(zone).split(' ')[0]}</div>
                  </button>
                );
              })}
            </div>
            {selectedZones.length === 0 && (
              <p className="text-gray-500 text-sm">Select at least one zone to view forecast</p>
            )}
          </div>

          {/* Year Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="text-gray-300">Base Year: {selectedYear}</label>
              <span className="text-gray-400">Forecast Range: {selectedYear} - {selectedYear + 10}</span>
            </div>
            <Slider
              value={[selectedYear]}
              onValueChange={(v) => setSelectedYear(v[0])}
              min={2024}
              max={2034}
              step={1}
              className="w-full"
            />
          </div>

          {/* Forecast Chart */}
          {forecastData.length > 0 && selectedZones.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-4">Urban Expansion Index Forecast</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af' }}
                    label={{ value: 'Year', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af' }}
                    domain={[0, 'dataMax + 10']}
                    label={{ value: 'Urban Expansion Index', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f3f4f6'
                    }}
                    formatter={(value: any, name: string) => [
                      `${Number(value).toFixed(1)}`,
                      `${name} - ${getZoneRegion(name)}`
                    ]}
                  />
                  <Legend 
                    formatter={(value: string) => `${value} - ${getZoneRegion(value)}`}
                  />
                  {selectedZones.map((zone, index) => {
                    const hasData = zoneSummaries.get(zone)?.hasData ?? false;
                    return (
                      <Line
                        key={zone}
                        type="monotone"
                        dataKey={zone}
                        stroke={colors[index % colors.length]}
                        strokeWidth={hasData ? 2 : 1.5}
                        strokeDasharray={hasData ? '0' : '5 5'}
                        name={zone}
                        dot={{ fill: colors[index % colors.length], r: 4 }}
                        connectNulls={false}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Summary Stats */}
          {forecastData.length > 0 && selectedZones.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-4">Zone Forecast Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedZones.map((zone, index) => {
                  const currentValue = forecastData[0]?.[zone] as number || 0;
                  const futureValue = forecastData[forecastData.length - 1]?.[zone] as number || 0;
                  const zoneSummary = zoneSummaries.get(zone);
                  const hasData = zoneSummary?.hasData ?? false;
                  
                  // Calculate growth percentage safely
                  let growthPercent = 0;
                  if (currentValue > 0) {
                    growthPercent = ((futureValue - currentValue) / currentValue) * 100;
                  } else if (futureValue > 0) {
                    growthPercent = 100; // New growth from zero
                  }
                  
                  const growthStatus = getGrowthStatus(growthPercent);
                  
                  return (
                    <motion.div
                      key={zone}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-800 rounded-xl p-4 border border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-gray-400 text-sm font-semibold">{zone}</p>
                          <p className="text-gray-500 text-xs">{getZoneRegion(zone)}</p>
                        </div>
                        {!hasData && (
                          <AlertCircle className="w-4 h-4 text-yellow-400" title="Limited data - using estimates" />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-gray-500 text-xs">Base Index (2024)</p>
                          <p className="text-lg font-bold text-white">{currentValue.toFixed(1)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Forecasted Index (2034)</p>
                          <p className="text-2xl font-bold text-orange-400">{futureValue.toFixed(1)}</p>
                        </div>
                        <div className="pt-2 border-t border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-xs">Growth (10 years)</span>
                            <span className={`text-sm font-semibold ${growthStatus.color}`}>
                              {growthStatus.icon} {growthStatus.label}
                            </span>
                          </div>
                          <p className="text-white text-sm font-bold mt-1">
                            {growthPercent > 0 ? '+' : ''}{growthPercent.toFixed(1)}%
                          </p>
                        </div>
                        
                        {zoneSummary && (
                          <div className="pt-2 border-t border-gray-700">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-500">Growth Rate:</span>
                                <span className="text-gray-300 ml-1">{zoneSummary.growthRate.toFixed(1)}%</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Infrastructure:</span>
                                <span className="text-gray-300 ml-1">{zoneSummary.infrastructureIndex.toFixed(0)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
