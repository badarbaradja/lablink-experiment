import { FileQuestion, Users, FolderOpen, Calendar } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: 'default' | 'members' | 'projects' | 'events';
}

export default function EmptyState({ 
  title, 
  description, 
  action,
  icon = 'default' 
}: EmptyStateProps) {
  const icons = {
    default: FileQuestion,
    members: Users,
    projects: FolderOpen,
    events: Calendar,
  };

  const Icon = icons[icon];

return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-linear-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center mb-6 border border-transparent dark:border-blue-500/20">
        <Icon className="w-12 h-12 text-blue-500 dark:text-blue-400" />
      </div>
      
      {/* UPDATE 3: Ganti text-gray-900 menjadi text-foreground (otomatis putih di dark mode) */}
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      
      {/* UPDATE 4: Ganti text-gray-500 menjadi text-muted-foreground */}
      <p className="text-muted-foreground text-center max-w-md mb-6">{description}</p>
      
      {action && <div>{action}</div>}
    </div>
  );
}
