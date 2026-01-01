import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label?: string;
    error?: string;
    multiline?: boolean;
    rows?: number;
}

export function Input({
    label,
    error,
    multiline = false,
    rows = 3,
    className = '',
    ...props
}: InputProps) {
    const inputClass = `input ${error ? 'input-error' : ''} ${className}`;

    return (
        <div className="input-wrapper">
            {label && <label className="input-label">{label}</label>}
            {multiline ? (
                <textarea
                    className={inputClass}
                    rows={rows}
                    {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                />
            ) : (
                <input
                    className={inputClass}
                    {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                />
            )}
            {error && <span className="input-error-msg">{error}</span>}
        </div>
    );
}
