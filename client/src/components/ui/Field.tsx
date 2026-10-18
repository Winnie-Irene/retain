import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  id: string;
  children: ReactNode;
  optional?: boolean;
}

function FieldShell({ label, error, hint, id, children, optional }: FieldShellProps) {
  return (
    <div className={`field ${error ? "field--error" : ""}`}>
      <label htmlFor={id} className="field__label">
        {label}
        {optional && <span className="field__optional">optional</span>}
      </label>
      {children}
      {error ? (
        <p className="field__message field__message--error" id={`${id}-message`} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p className="field__message" id={`${id}-message`}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  prefix?: string;
}

export function TextField({ label, error, hint, optional, prefix, id, className, ...rest }: TextFieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <FieldShell label={label} error={error} hint={hint} id={fieldId} optional={optional}>
      <div className={`control ${prefix ? "control--prefixed" : ""}`}>
        {prefix && <span className="control__prefix">{prefix}</span>}
        <input
          id={fieldId}
          className={`input ${className ?? ""}`}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error || hint ? `${fieldId}-message` : undefined}
          {...rest}
        />
      </div>
    </FieldShell>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectField({ label, error, hint, options, placeholder, id, ...rest }: SelectFieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <FieldShell label={label} error={error} hint={hint} id={fieldId}>
      <div className="control control--select">
        <select
          id={fieldId}
          className="input"
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error || hint ? `${fieldId}-message` : undefined}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </FieldShell>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
}

export function TextAreaField({ label, error, hint, optional, id, ...rest }: TextAreaFieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <FieldShell label={label} error={error} hint={hint} id={fieldId} optional={optional}>
      <textarea
        id={fieldId}
        className="input input--area"
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error || hint ? `${fieldId}-message` : undefined}
        {...rest}
      />
    </FieldShell>
  );
}