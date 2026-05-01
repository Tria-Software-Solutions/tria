import { 
  Server, 
  Database, 
  Shield, 
  Cpu, 
  Network, 
  Cloud,
  LucideIcon,
} from 'lucide-react';

export interface ServiceItem {
  icon: LucideIcon;
  key: string;
}

export const serviceIcons: Record<string, LucideIcon> = {
  infrastructure: Server,
  data: Database,
  security: Shield,
  hpc: Cpu,
  network: Network,
  cloud: Cloud,
};

export const serviceKeys: ServiceItem[] = [
  { icon: Server, key: 'infrastructure' },
  { icon: Database, key: 'data' },
  { icon: Shield, key: 'security' },
  { icon: Cpu, key: 'hpc' },
  { icon: Network, key: 'network' },
  { icon: Cloud, key: 'cloud' },
];
