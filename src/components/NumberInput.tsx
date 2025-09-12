
import React, { useState, useEffect } from 'react';

interface NumberInputProps {
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  type?: 'number' | 'text';
  step?: string;
  min?: string;
  max?: string;
}

export function NumberInput({ 
  value, 
  onChange, 
  onBlur,
  placeholder,
  className = "input",
  type = "number",
  step,
  min,
  max
}: NumberInputProps) {
  const [localValue, setLocalValue] = useState(String(value || ''));

  useEffect(() => {
    setLocalValue(String(value || ''));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleBlur = () => {
    // Convert to number and back to string to normalize
    const numValue = parseFloat(localValue);
    const normalizedValue = isNaN(numValue) ? '' : String(numValue);
    setLocalValue(normalizedValue);
    onChange(normalizedValue);
    onBlur?.();
  };

  return (
    <input
      type={type}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      step={step}
      min={min}
      max={max}
    />
  );
}
