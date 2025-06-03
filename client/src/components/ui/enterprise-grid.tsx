import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EnterpriseGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

export function EnterpriseGrid({ 
  children, 
  className, 
  cols = 4, 
  gap = 'lg',
  responsive = true 
}: EnterpriseGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const colClasses = {
    1: responsive ? 'grid-cols-1' : 'grid-cols-1',
    2: responsive ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2',
    3: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-3',
    4: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-4',
    5: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5' : 'grid-cols-5',
    6: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6' : 'grid-cols-6'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
      className={cn(
        'grid',
        colClasses[cols],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function EnterpriseGridItem({ 
  children, 
  className,
  span = 1 
}: { 
  children: React.ReactNode; 
  className?: string;
  span?: 1 | 2 | 3 | 4 | 5 | 6;
}) {
  const spanClasses = {
    1: 'col-span-1',
    2: 'col-span-1 md:col-span-2',
    3: 'col-span-1 md:col-span-2 lg:col-span-3',
    4: 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4',
    5: 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5',
    6: 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-6'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(spanClasses[span], className)}
    >
      {children}
    </motion.div>
  );
}