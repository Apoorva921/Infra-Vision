'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Download, Brain, TrendingUp, Home, Route, Activity, Loader2 } from 'lucide-react';
import Papa from 'papaparse';

interface HousingData {
  zoneId: string;
  district: string;
  housingDensity: number;
  avgHouseholdSize: number;
  projectedGrowth: number;
  area: number;
  infrastructureScore: number;
  roadNetworkEfficiency: number;
}

interface ModelPrediction {
  zoneId: string;
  district: string;
  currentDensity: number;
  predictedDensity: number;
  growthRate: number;
  infrastructureNeeds: string;
  roadImprovement: number;
}

// Linear regression for predictions
function linearRegression(x: number[], y: number[]): { slope: number; intercept: number; r2: number } {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R²
  const yMean = sumY / n;
  const ssRes = y.reduce((sum, yi, i) => {
    const predicted = slope * x[i] + intercept;
    return sum + Math.pow(yi - predicted, 2);
  }, 0);
  const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const r2 = 1 - (ssRes / ssTot);
  
  return { slope, intercept, r2 };
}

export function HousingDensityAnalysis() {
  const [rawData, setRawData] = useState<HousingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelMetrics, setModelMetrics] = useState<{
    r2: number;
    mse: number;
    mae: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Loading housing density data...');
        
        // Use API route which provides better model metrics
        const response = await fetch('/api/housing-road-analysis');
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
        }
        
        const apiData = await response.json();
        
        if (apiData && apiData.data && apiData.summary) {
          // Transform API data to match component's data structure
          const data: HousingData[] = apiData.data.map((row: any) => ({
            zoneId: row.District || '',
            district: row.District || '',
            housingDensity: parseFloat(row.Avg_Density) || 0,
            avgHouseholdSize: parseFloat(row.Avg_Household_Size) || 0,
            projectedGrowth: parseFloat(row.Projected_10yr_Growth) || 0,
            area: 0, // Not available in API data
            infrastructureScore: parseFloat(row.Infrastructure_Score) || 0,
            roadNetworkEfficiency: parseFloat(row.Road_Network_Efficiency) / 100 || 0
          })).filter(d => d.housingDensity > 0 && d.district);
          
          console.log(`Loaded ${data.length} districts`);
          setRawData(data);
          
          // Use model metrics from API (which are calculated using proper ML model)
          if (apiData.summary.modelMetrics) {
            setModelMetrics({
              r2: apiData.summary.modelMetrics.r2Score / 100, // Convert from percentage
              mse: apiData.summary.modelMetrics.mse,
              mae: apiData.summary.modelMetrics.mae
            });
          } else {
            // Fallback: train model if metrics not available
            trainModel(data);
          }
        } else {
          throw new Error('Invalid data format from API');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        // Fallback to CSV if API fails
        try {
          const csvResponse = await fetch('/data/delhi_housing_density_growth_prediction.csv');
          if (csvResponse.ok) {
            const text = await csvResponse.text();
            const parsed = Papa.parse<any>(text, { 
              header: true, 
              skipEmptyLines: true
            });
            
            const data: HousingData[] = parsed.data.map((row: any) => ({
              zoneId: row['Zone ID'] || '',
              district: row.District || '',
              housingDensity: parseFloat(row['Housing Density (people/km²)']) || 0,
              avgHouseholdSize: parseFloat(row['Avg Household Size']) || 0,
              projectedGrowth: parseFloat(row['Projected 10yr Growth (%)']) || 0,
              area: parseFloat(row['Area (km²)']) || 0,
              infrastructureScore: parseFloat(row['Infrastructure Score (0-100)']) || 0,
              roadNetworkEfficiency: parseFloat(row['Road Network Efficiency']) || 0
            })).filter(d => d.housingDensity > 0 && d.zoneId);
            
            setRawData(data);
            trainModel(data);
          } else {
            throw err;
          }
        } catch (fallbackErr) {
          setError(err instanceof Error ? err.message : 'Unknown error loading data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const trainModel = (data: HousingData[]) => {
    // Use infrastructure score and road efficiency to predict housing density
    const x1 = data.map(d => d.infrastructureScore);
    const x2 = data.map(d => d.roadNetworkEfficiency * 100); // Scale to 0-100
    const y = data.map(d => d.housingDensity);
    
    // Simple multiple linear regression (using infrastructure as main predictor)
    const { slope, intercept, r2 } = linearRegression(x1, y);
    
    // Calculate predictions and errors
    const predictions = x1.map(x => slope * x + intercept);
    const errors = y.map((actual, i) => Math.pow(actual - predictions[i], 2));
    const mse = errors.reduce((a, b) => a + b, 0) / errors.length;
    const mae = y.reduce((sum, actual, i) => sum + Math.abs(actual - predictions[i]), 0) / y.length;
    
    setModelMetrics({ r2, mse, mae });
    console.log('Model trained:', { r2, mse, mae });
  };

  // Process data for visualizations
  const districtData = useMemo(() => {
    if (rawData.length === 0) return [];
    
    const districtMap = new Map<string, {
      district: string;
      avgDensity: number;
      totalZones: number;
      avgGrowth: number;
      avgInfrastructure: number;
      avgRoadEfficiency: number;
    }>();
    
    rawData.forEach(zone => {
      const existing = districtMap.get(zone.district) || {
        district: zone.district,
        avgDensity: 0,
        totalZones: 0,
        avgGrowth: 0,
        avgInfrastructure: 0,
        avgRoadEfficiency: 0
      };
      
      existing.avgDensity += zone.housingDensity;
      existing.avgGrowth += zone.projectedGrowth;
      existing.avgInfrastructure += zone.infrastructureScore;
      existing.avgRoadEfficiency += zone.roadNetworkEfficiency;
      existing.totalZones += 1;
      
      districtMap.set(zone.district, existing);
    });
    
    return Array.from(districtMap.values()).map(d => ({
      district: d.district,
      avgDensity: d.avgDensity / d.totalZones,
      totalZones: d.totalZones,
      avgGrowth: d.avgGrowth / d.totalZones,
      avgInfrastructure: d.avgInfrastructure / d.totalZones,
      avgRoadEfficiency: (d.avgRoadEfficiency / d.totalZones) * 100
    })).sort((a, b) => b.avgDensity - a.avgDensity);
  }, [rawData]);

  // Top zones by density
  const topZones = useMemo(() => {
    return [...rawData]
      .sort((a, b) => b.housingDensity - a.housingDensity)
      .slice(0, 10)
      .map(zone => ({
        zone: zone.zoneId,
        district: zone.district,
        density: zone.housingDensity,
        growth: zone.projectedGrowth,
        infrastructure: zone.infrastructureScore,
        roadEfficiency: zone.roadNetworkEfficiency * 100
      }));
  }, [rawData]);

  // Predictions for next 10 years
  const predictions = useMemo(() => {
    if (rawData.length === 0 || !modelMetrics) return [];
    
    return rawData.slice(0, 20).map(zone => {
      const currentDensity = zone.housingDensity;
      const growthRate = zone.projectedGrowth / 100;
      const predictedDensity = currentDensity * (1 + growthRate);
      
      return {
        zoneId: zone.zoneId,
        district: zone.district,
        currentDensity,
        predictedDensity,
        growthRate: zone.projectedGrowth,
        infrastructureNeeds: zone.infrastructureScore < 70 ? 'High' : zone.infrastructureScore < 85 ? 'Medium' : 'Low',
        roadImprovement: (1 - zone.roadNetworkEfficiency) * 100
      };
    });
  }, [rawData, modelMetrics]);

  // Correlation data
  const correlationData = useMemo(() => {
    return rawData.map(zone => ({
      infrastructure: zone.infrastructureScore,
      density: zone.housingDensity,
      roadEfficiency: zone.roadNetworkEfficiency * 100
    }));
  }, [rawData]);

  const handleDownloadCSV = () => {
    if (typeof window === 'undefined') return;
    
    const exportData = predictions.map(p => ({
      Zone_ID: p.zoneId,
      District: p.district,
      Current_Density: p.currentDensity.toFixed(2),
      Predicted_Density: p.predictedDensity.toFixed(2),
      Growth_Rate: p.growthRate.toFixed(2),
      Infrastructure_Needs: p.infrastructureNeeds,
      Road_Improvement_Needed: p.roadImprovement.toFixed(2)
    }));
    
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'housing_density_predictions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
          <div className="text-white">Loading housing density data and training model...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 p-6">
        <div className="text-center max-w-2xl">
          <div className="text-red-400 text-xl font-semibold mb-2">Error Loading Data</div>
          <div className="text-red-300 mb-4">{error}</div>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-cyan-500 hover:bg-cyan-400 text-white"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const COLORS = ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-white">Housing Density Growth Analysis & Predictions</h2>
        <Button
          onClick={handleDownloadCSV}
          className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Predictions
        </Button>
      </div>

      {/* Model Metrics */}
      {modelMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gray-900 border-gray-700 shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-6 h-6 text-cyan-400" />
                🤖 Model Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">R² Score</p>
                  <p className="text-2xl font-bold text-cyan-400">{(modelMetrics.r2 * 100).toFixed(2)}%</p>
                  <p className="text-xs text-gray-500 mt-1">Model accuracy</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Mean Squared Error</p>
                  <p className="text-2xl font-bold text-green-400">{modelMetrics.mse.toFixed(0)}</p>
                  <p className="text-xs text-gray-500 mt-1">Lower is better</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Mean Absolute Error</p>
                  <p className="text-2xl font-bold text-purple-400">{modelMetrics.mae.toFixed(0)}</p>
                  <p className="text-xs text-gray-500 mt-1">people/km²</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* District Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gray-900 border-gray-700 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">📊 Housing Density by District</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={districtData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="district" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                  label={{ value: 'Avg Density (people/km²)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Legend />
                <Bar dataKey="avgDensity" name="Average Housing Density" fill="#06b6d4" radius={8}>
                  {districtData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Zones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gray-900 border-gray-700 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Home className="w-5 h-5 text-cyan-400" />
              🏘️ Top 10 Zones by Housing Density
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topZones} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                <YAxis 
                  type="category" 
                  dataKey="zone" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Legend />
                <Bar dataKey="density" name="Housing Density (people/km²)" fill="#10b981" radius={8} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Predictions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gray-900 border-gray-700 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              🔮 10-Year Growth Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={predictions}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="zoneId" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                  label={{ value: 'Density (people/km²)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="currentDensity" 
                  stroke="#06b6d4" 
                  fill="url(#colorCurrent)" 
                  name="Current Density"
                />
                <Area 
                  type="monotone" 
                  dataKey="predictedDensity" 
                  stroke="#10b981" 
                  fill="url(#colorPredicted)" 
                  name="Predicted Density (10yr)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Infrastructure vs Density Correlation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gray-900 border-gray-700 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              🔗 Infrastructure Score vs Housing Density
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  type="number" 
                  dataKey="infrastructure" 
                  name="Infrastructure Score"
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                  label={{ value: 'Infrastructure Score', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="density" 
                  name="Housing Density"
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                  label={{ value: 'Housing Density (people/km²)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Scatter name="Zones" data={correlationData} fill="#06b6d4">
                  {correlationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Road Efficiency Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-gray-900 border-gray-700 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Route className="w-5 h-5 text-cyan-400" />
              🛣️ Road Network Efficiency by District
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={districtData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="district" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af' }}
                  label={{ value: 'Road Efficiency (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Legend />
                <Bar dataKey="avgRoadEfficiency" name="Road Network Efficiency (%)" fill="#8b5cf6" radius={8}>
                  {districtData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-gray-900 border-gray-700 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-cyan-400" />
              💡 AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                <p className="text-gray-200">
                  <strong className="text-cyan-400">Highest Density:</strong> {topZones[0]?.zone} in {topZones[0]?.district} with {topZones[0]?.density.toFixed(0)} people/km²
                </p>
              </div>
              <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                <p className="text-gray-200">
                  <strong className="text-green-400">Best Infrastructure:</strong> {districtData.sort((a, b) => b.avgInfrastructure - a.avgInfrastructure)[0]?.district} with {districtData.sort((a, b) => b.avgInfrastructure - a.avgInfrastructure)[0]?.avgInfrastructure.toFixed(1)}/100
                </p>
              </div>
              <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                <p className="text-gray-200">
                  <strong className="text-purple-400">Highest Growth Projected:</strong> {predictions.sort((a, b) => b.growthRate - a.growthRate)[0]?.zoneId} with {predictions.sort((a, b) => b.growthRate - a.growthRate)[0]?.growthRate.toFixed(2)}% growth
                </p>
              </div>
              <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                <p className="text-gray-200">
                  <strong className="text-yellow-400">Road Improvement Needed:</strong> {predictions.sort((a, b) => b.roadImprovement - a.roadImprovement)[0]?.zoneId} needs {predictions.sort((a, b) => b.roadImprovement - a.roadImprovement)[0]?.roadImprovement.toFixed(1)}% improvement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

