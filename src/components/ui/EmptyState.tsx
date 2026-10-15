import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export function EmptyState({ icon = 'stage', title, text, action }: { icon?: IconName; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-line px-6 py-14 text-center">
      <Icon name={icon} size={40} className="text-mute" />
      <p className="text-lg font-bold">{title}</p>
      <p className="max-w-sm text-mute">{text}</p>
      {action}
    </div>
  );
}
