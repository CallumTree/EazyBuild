
import React, { useState, useEffect, useRef } from 'react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  disabled?: boolean;
}

export function NumberInput({
  value,
  onChange,
  placeholder = "0",
  className = "",
  min,
  max,
  step = 1,
  prefix = "",
  suffix = "",
  decimals = 0,
  disabled = false,
}: NumberInputProps) {
  const [displayValue, setDisplayValue] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update display value when external value changes (but not when focused)
  useEffect(() => {
    if (!isFocused) {
      if (value === 0) {
        setDisplayValue('');
      } else {
        setDisplayValue(decimals > 0 ? value.toFixed(decimals) : value.toString());
      }
    }
  }, [value, isFocused, decimals]);

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number without formatting when focused
    if (value === 0) {
      setDisplayValue('');
    } else {
      setDisplayValue(decimals > 0 ? value.toFixed(decimals) : value.toString());
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    // Parse and validate the input
    let numValue = parseFloat(displayValue) || 0;
    
    // Apply constraints
    if (min !== undefined && numValue < min) numValue = min;
    if (max !== undefined && numValue > max) numValue = max;
    
    // Round to specified decimals
    if (decimals === 0) {
      numValue = Math.round(numValue);
    } else {
      numValue = Math.round(numValue * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
    
    // Update the parent component
    if (numValue !== value) {
      onChange(numValue);
    }
    
    // Update display
    if (numValue === 0) {
      setDisplayValue('');
    } else {
      setDisplayValue(decimals > 0 ? numValue.toFixed(decimals) : numValue.toString());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Allow empty string, numbers, and decimal points
    if (newValue === '' || /^-?\d*\.?\d*$/.test(newValue)) {
      setDisplayValue(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyEvent<HTMLInputElement>) => {
    // Handle Enter key
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
    
    // Handle step increment/decrement
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const currentValue = parseFloat(displayValue) || 0;
      const newValue = currentValue + step;
      if (max === undefined || newValue <= max) {
        onChange(newValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const currentValue = parseFloat(displayValue) || 0;
      const newValue = currentValue - step;
      if (min === undefined || newValue >= min) {
        onChange(newValue);
      }
    }
  };

  const formatDisplayValue = () => {
    if (isFocused) return displayValue;
    
    if (!displayValue || displayValue === '0') {
      return '';
    }
    
    const numValue = parseFloat(displayValue);
    if (isNaN(numValue)) return '';
    
    // Format with thousands separators
    let formatted = decimals > 0 
      ? numValue.toFixed(decimals)
      : Math.round(numValue).toString();
    
    // Add thousands separators
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return parts.join('.');
  };

  return (
    <div className="relative">
      {prefix && !isFocused && (
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
          {prefix}
        </span>
      )}
      
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={isFocused ? displayValue : formatDisplayValue()}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${prefix ? 'pl-8' : ''}
          ${suffix ? 'pr-12' : ''}
          ${className}
        `}
      />
      
      {suffix && !isFocused && displayValue && (
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}
