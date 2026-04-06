import { Shield, Eye } from 'lucide-react';
import { Role } from '@/data/mockData';

interface RoleSwitcherProps {
  role: Role;
  onRoleChange: (role: Role) => void;
}

const RoleSwitcher = ({ role, onRoleChange }: RoleSwitcherProps) => {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      <button
        onClick={() => onRoleChange('viewer')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          role === 'viewer'
            ? 'bg-card text-card-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Eye size={13} /> Viewer
      </button>
      <button
        onClick={() => onRoleChange('admin')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          role === 'admin'
            ? 'bg-card text-card-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Shield size={13} /> Admin
      </button>
    </div>
  );
};

export default RoleSwitcher;
