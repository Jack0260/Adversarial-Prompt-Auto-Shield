import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs text-soc-text-dim font-medium">{label}</label>
      )}
      <select
        className={`bg-soc-surface border border-soc-border rounded-lg px-3 py-1.5 text-sm text-soc-text hover:border-soc-border-hover focus:border-accent-cyan/50 transition-colors cursor-pointer outline-none ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-soc-card text-soc-text">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
