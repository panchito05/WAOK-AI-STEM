import React from 'react';
import {
  Plus,
  Minus,
  X,
  Divide,
  PieChart,
  Percent,
  Calculator,
  Shapes,
  Hash,
  Ruler,
  Clock,
  DollarSign,
  Grid,
  BarChart,
  LucideIcon,
} from 'lucide-react';

// Mapeo de nombres de iconos a componentes
const iconMap: Record<string, LucideIcon> = {
  'Plus': Plus,
  'Minus': Minus,
  'X': X,
  'Divide': Divide,
  'PieChart': PieChart,
  'Percent': Percent,
  'Calculator': Calculator,
  'Shapes': Shapes,
  'Hash': Hash,
  'Ruler': Ruler,
  'Clock': Clock,
  'DollarSign': DollarSign,
  'Grid': Grid,
  'BarChart': BarChart,
};

interface DynamicIconProps {
  name?: string;
  className?: string;
  size?: number;
}

export default function DynamicIcon({ name, className = '', size = 24 }: DynamicIconProps) {
  if (!name || !iconMap[name]) {
    // Si no hay icono o no se encuentra, usar Calculator como predeterminado
    const DefaultIcon = Calculator;
    return <DefaultIcon className={className} size={size} />;
  }

  const IconComponent = iconMap[name];
  return <IconComponent className={className} size={size} />;
}