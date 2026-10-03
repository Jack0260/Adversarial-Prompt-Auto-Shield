import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  scrollable?: boolean;
}

export function Card({
  children,
  className = '',
  title,
  icon,
  actions,
  scrollable = false,
}: CardProps) {
  return (
    <div
      className={`soc-card flex flex-col ${scrollable ? 'overflow-hidden' : ''} ${className}`}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-soc-border shrink-0">
          <div className="flex items-center gap-2">
            {icon && <span className="text-accent-cyan">{icon}</span>}
            {title && (
              <h3 className="text-sm font-semibold text-soc-text-bright tracking-wide">
                {title}
              </h3>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={`flex-1 ${scrollable ? 'overflow-y-auto soc-scrollbar' : ''}`}>
        {children}
      </div>
    </div>
  );
}
