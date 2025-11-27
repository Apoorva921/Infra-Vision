'use client';

import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  number: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  index: number;
  onClick?: () => void;
  isClickable?: boolean;
}

export function FeatureCard({ number, title, description, Icon, index, onClick, isClickable }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      onClick={isClickable ? onClick : undefined}
      className={`group relative overflow-hidden h-full ${isClickable ? 'cursor-pointer' : ''}`}
    >
      {/* Interactive Shadow Layer */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(0,168,232,0.1), rgba(14,165,233,0.1), rgba(52,211,153,0.1))',
          filter: 'blur(20px)',
          transform: 'scale(1.1)',
          zIndex: -1
        }}
        initial={{ opacity: 0 }}
        whileHover={{ 
          opacity: 1,
          scale: 1.15,
          transition: { duration: 0.4, ease: 'easeOut' }
        }}
      />

      {/* Enhanced Shadow on Hover */}
      <motion.div
        className="absolute -inset-2 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(0,168,232,0.15), rgba(14,165,233,0.15), rgba(52,211,153,0.15))',
          filter: 'blur(30px)',
          zIndex: -2
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ 
          opacity: 1,
          scale: 1.2,
          transition: { duration: 0.5, ease: 'easeOut' }
        }}
      />

      {/* Premium Glassmorphism Card */}
      <div 
        className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/20 relative overflow-hidden transition-all duration-200 ease-out h-full flex flex-col"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
          minHeight: '320px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15), 0 6px 20px rgba(0, 0, 0, 0.1), 0 3px 10px rgba(0, 0, 0, 0.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)';
        }}
      >
        {/* Neon Border Glow on Hover */}
        <motion.div 
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(0,168,232,0.3), rgba(14,165,233,0.3), rgba(52,211,153,0.3))',
            backgroundSize: '300% 300%'
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
        
        {/* Border Glow Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00A8E8]/10 via-[#0EA5E9]/10 to-[#34D399]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
        
        {/* Dynamic Light Reflection */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 30%, transparent 70%, rgba(14,165,233,0.1) 100%)'
          }}
          initial={{ opacity: 0, x: '-100%' }}
          whileHover={{ 
            opacity: 1,
            x: '100%',
            transition: { duration: 0.8, ease: 'easeInOut' }
          }}
        />
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Icon and Number Section */}
          <div className="flex items-start gap-4 lg:gap-6 mb-6">
            <div className="flex-shrink-0">
              {/* Enhanced Icon with Pulse */}
              <motion.div
                whileHover={{ 
                  scale: 1.1, 
                  rotate: 10,
                  transition: { duration: 0.3 }
                }}
                className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-br from-[#00A8E8] to-[#34D399] flex items-center justify-center shadow-lg relative overflow-hidden"
              >
                {/* Pulse Animation */}
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(0,168,232,0.4)',
                      '0 0 0 10px rgba(0,168,232,0)',
                      '0 0 0 0 rgba(0,168,232,0.4)'
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
                <Icon className="w-7 h-7 lg:w-8 lg:h-8 text-white relative z-10" />
              </motion.div>
            </div>
            
            {/* Number */}
            <div className="flex-shrink-0 mt-1">
              <span className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#00A8E8] to-[#34D399] bg-clip-text text-transparent">
                {number}
              </span>
            </div>
          </div>
          
          {/* Content Section */}
          <div className="flex-1 flex flex-col">
            {/* Title */}
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 group-hover:text-[#00A8E8] transition-colors duration-300 leading-tight mb-3 lg:mb-4">
              {title}
            </h3>
            
            {/* Description */}
            <p className="text-gray-600 leading-relaxed text-sm lg:text-base mb-4 lg:mb-6 flex-1">
              {description}
            </p>
            
            {/* Action Link */}
            {isClickable && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="group-hover:opacity-100 opacity-0 transition-all duration-300 mt-auto"
              >
                <motion.div
                  className="inline-flex items-center gap-2 text-[#00A8E8] font-semibold hover:text-[#34D399] transition-colors duration-300 text-sm lg:text-base"
                  whileHover={{ x: 4 }}
                >
                  <span>Explore →</span>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}









