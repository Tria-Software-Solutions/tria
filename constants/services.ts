import { 
  Globe, 
  Smartphone, 
  Monitor, 
  Server, 
  Database, 
  Cloud,
  LucideIcon,
} from 'lucide-react';

export interface ServiceItem {
  icon: LucideIcon;
  key: string;
}

export const serviceIcons: Record<string, LucideIcon> = {
  web: Globe,
  mobile: Smartphone,
  desktop: Monitor,
  backend: Server,
  database: Database,
  devops: Cloud,
};

export const serviceKeys: ServiceItem[] = [
  { icon: Globe, key: 'web' },
  { icon: Smartphone, key: 'mobile' },
  { icon: Monitor, key: 'desktop' },
  { icon: Server, key: 'backend' },
  { icon: Database, key: 'database' },
  { icon: Cloud, key: 'devops' },
];
