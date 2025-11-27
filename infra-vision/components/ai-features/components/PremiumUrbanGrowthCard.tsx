'use client';

import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';

interface PremiumUrbanGrowthCardProps {
  onClick?: () => void;
}

export function PremiumUrbanGrowthCard({ onClick }: PremiumUrbanGrowthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      onClick={onClick}
      className="group relative cursor-pointer"
      style={{ width: '400px', height: '220px' }}
    >
      {/* Main Card */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500">
        {/* Gradient Background */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#00A8E8] to-[#34D399] group-hover:from-[#00B8F8] group-hover:to-[#44E4A9] transition-all duration-500"
          style={{
            background: 'linear-gradient(135deg, #00A8E8 0%, #34D399 100%)'
          }}
        />
        
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        
        {/* Content Container */}
        <div className="relative h-full p-6 flex flex-col">
          {/* Top Section with Icon */}
          <div className="flex-none">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
              className="w-8 h-8 flex items-center justify-center"
            >
              <TrendingUp className="w-8 h-8 text-white" strokeWidth={2} />
            </motion.div>
          </div>
          
          {/* Content Section */}
          <div className="flex-1 flex flex-col justify-center mt-4">
            <motion.h2 
              className="text-white text-xl font-bold leading-tight mb-3"
              style={{ 
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: '24px',
                fontWeight: '700',
                lineHeight: '1.2'
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              Predict Urban Growth Patterns
            </motion.h2>
            
            <p 
              className="text-white/85 leading-relaxed"
              style={{ 
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                lineHeight: '1.4',
                opacity: '0.85'
              }}
            >
              Harness predictive analytics to forecast population growth, economic development, and infrastructure demands.
            </p>
          </div>
          
          {/* Bottom Section with Button */}
          <div className="flex-none flex justify-end">
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 8px 25px rgba(255, 255, 255, 0.3)'
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="group/btn relative px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium text-sm hover:bg-white/30 transition-all duration-300"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore More
                <motion.span
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="group-hover/btn:translate-x-1 transition-transform duration-300"
                >
                  →
                </motion.span>
              </span>
              
              {/* Button glow effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </div>
        </div>
        
        {/* Subtle animated background texture */}
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(255,255,255,0.2) 1px, transparent 1px),
              radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        
        {/* Edge highlight */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20 group-hover:ring-white/40 transition-all duration-500" />
      </div>
      
      {/* Enhanced shadow layers */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00A8E8]/30 to-[#34D399]/30 blur-xl scale-95 opacity-0 group-hover:opacity-70 transition-all duration-500 -z-10" />
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00A8E8]/20 to-[#34D399]/20 blur-2xl scale-90 opacity-0 group-hover:opacity-50 transition-all duration-700 -z-20" />
    </motion.div>
  );
}









