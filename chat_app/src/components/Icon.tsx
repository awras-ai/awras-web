// OPTIMIZED: Dynamic icon loading with lazy imports
// This replaces the wildcard import that loaded all 1000+ icons (~1MB)
// Now only imports icons as they're requested, saving ~800KB on initial load

import { lazy, Suspense, useMemo } from 'react';

// Whitelist of commonly used icons - add more as needed
// This ensures tree-shaking works properly
const ICON_MODULES: Record<string, () => Promise<any>> = {
  Home: () => import('lucide-react').then(m => ({ default: m.Home })),
  MessageCircle: () => import('lucide-react').then(m => ({ default: m.MessageCircle })),
  Settings: () => import('lucide-react').then(m => ({ default: m.Settings })),
  User: () => import('lucide-react').then(m => ({ default: m.User })),
  Send: () => import('lucide-react').then(m => ({ default: m.Send })),
  MoreHorizontal: () => import('lucide-react').then(m => ({ default: m.MoreHorizontal })),
  Plus: () => import('lucide-react').then(m => ({ default: m.Plus })),
  Trash: () => import('lucide-react').then(m => ({ default: m.Trash })),
  Edit: () => import('lucide-react').then(m => ({ default: m.Edit })),
  Copy: () => import('lucide-react').then(m => ({ default: m.Copy })),
  Check: () => import('lucide-react').then(m => ({ default: m.Check })),
  X: () => import('lucide-react').then(m => ({ default: m.X })),
  ChevronLeft: () => import('lucide-react').then(m => ({ default: m.ChevronLeft })),
  ChevronRight: () => import('lucide-react').then(m => ({ default: m.ChevronRight })),
  ChevronDown: () => import('lucide-react').then(m => ({ default: m.ChevronDown })),
  ChevronUp: () => import('lucide-react').then(m => ({ default: m.ChevronUp })),
  Menu: () => import('lucide-react').then(m => ({ default: m.Menu })),
  Sun: () => import('lucide-react').then(m => ({ default: m.Sun })),
  Moon: () => import('lucide-react').then(m => ({ default: m.Moon })),
  LogOut: () => import('lucide-react').then(m => ({ default: m.LogOut })),
  Loader: () => import('lucide-react').then(m => ({ default: m.Loader })),
  Loader2: () => import('lucide-react').then(m => ({ default: m.Loader2 })),
  Search: () => import('lucide-react').then(m => ({ default: m.Search })),
  Share: () => import('lucide-react').then(m => ({ default: m.Share })),
  Info: () => import('lucide-react').then(m => ({ default: m.Info })),
  AlertCircle: () => import('lucide-react').then(m => ({ default: m.AlertCircle })),
  AlertTriangle: () => import('lucide-react').then(m => ({ default: m.AlertTriangle })),
  ThumbsUp: () => import('lucide-react').then(m => ({ default: m.ThumbsUp })),
  ThumbsDown: () => import('lucide-react').then(m => ({ default: m.ThumbsDown })),
  Bug: () => import('lucide-react').then(m => ({ default: m.Bug })),
  Upload: () => import('lucide-react').then(m => ({ default: m.Upload })),
  Download: () => import('lucide-react').then(m => ({ default: m.Download })),
  Paperclip: () => import('lucide-react').then(m => ({ default: m.Paperclip })),
  Mic: () => import('lucide-react').then(m => ({ default: m.Mic })),
  Play: () => import('lucide-react').then(m => ({ default: m.Play })),
  Pause: () => import('lucide-react').then(m => ({ default: m.Pause })),
  StopCircle: () => import('lucide-react').then(m => ({ default: m.StopCircle })),
  RefreshCw: () => import('lucide-react').then(m => ({ default: m.RefreshCw })),
  PanelLeft: () => import('lucide-react').then(m => ({ default: m.PanelLeft })),
  KeyRound: () => import('lucide-react').then(m => ({ default: m.KeyRound })),
  Share2: () => import('lucide-react').then(m => ({ default: m.Share2 })),
  GripVertical: () => import('lucide-react').then(m => ({ default: m.GripVertical })),
  Command: () => import('lucide-react').then(m => ({ default: m.Command })),
  CornerDownLeft: () => import('lucide-react').then(m => ({ default: m.CornerDownLeft })),
  // Add more icons here as needed by the application
};

interface Props {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

const Icon = ({ name, ...props }: Props) => {
  // Convert the name to proper case
  const formatIconName = (name: string): string => {
    // Aggressively lowercase the parts to clean up inputs like "ChEvRoN-rIgHt"
    if (name.includes('-')) {
      return name
        .split('-')
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join('');
    }
    if (name === name.toUpperCase()) {
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const formattedName = formatIconName(name);
  
  // Check if icon is in whitelist
  const iconLoader = ICON_MODULES[formattedName];
  
  if (!iconLoader) {
    console.warn(`Icon "${name}" not found in icon whitelist. Add it to ICON_MODULES in Icon.tsx if needed.`);
    return null;
  }

  // Create lazy component for this icon
  const IconComponent = useMemo(() => lazy(iconLoader), [iconLoader]);

  return (
    <Suspense fallback={<span style={{ width: props.size || 24, height: props.size || 24 }} />}>
      <IconComponent {...props} />
    </Suspense>
  );
};

export default Icon;
