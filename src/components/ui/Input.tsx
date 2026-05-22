import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-text-muted">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}
        <input
          className={cn(
            "w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border",
            "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50",
            "transition-all duration-200 placeholder:text-text-muted/60",
            icon && "pl-10",
            error && "border-danger/50 focus:ring-danger/30",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-text-muted">{label}</label>
      )}
      <textarea
        className={cn(
          "w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border min-h-[120px] resize-y",
          "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50",
          "transition-all duration-200",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function Select({
  label,
  options,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-text-muted">{label}</label>
      )}
      <select
        className={cn(
          "w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border",
          "focus:outline-none focus:ring-2 focus:ring-primary/40",
          className
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
