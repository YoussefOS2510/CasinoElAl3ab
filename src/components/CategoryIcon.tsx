import React from 'react';
import {
  Ban,
  Clapperboard,
  Gavel,
  Mic2,
  Music,
  Shuffle,
  Zap,
} from 'lucide-react';
import { CategoryMeta } from '../types/game';

interface CategoryIconProps {
  iconName: CategoryMeta['iconName'];
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  className = 'w-5 h-5',
}) => {
  switch (iconName) {
    case 'Shuffle':
      return <Shuffle className={className} />;
    case 'Clapperboard':
      return <Clapperboard className={className} />;
    case 'Music':
      return <Music className={className} />;
    case 'Mic2':
      return <Mic2 className={className} />;
    case 'Gavel':
      return <Gavel className={className} />;
    case 'Ban':
      return <Ban className={className} />;
    case 'Zap':
      return <Zap className={className} />;
  }
};

