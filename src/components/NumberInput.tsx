
import React, { useState, useEffect, useCallback } from 'react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  step?: string;
  min?: number;
  max?: number;
}

export function NumberInput({ 
  value, 
  onChange, 
  className = '', 
  placeholder,
  step,
  min,
  max
}: NumberInputProps) {
  const [displayValue, setDisplayValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  // Update display value when prop value changes (but not when focused)
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value.toString());
    }
  }, [value, isFocused]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const numericValue = parseFloat(displayValue) || 0;
    const clampedValue = Math.max(min || -Infinity, Math.min(max || Infinity, numericValue));
    onChange(clampedValue);
    setDisplayValue(clampedValue.toString());
  }, [displayValue, onChange, min, max]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  }, []);

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      className={className}
      placeholder={placeholder}
      step={step}
    />
  );
}
