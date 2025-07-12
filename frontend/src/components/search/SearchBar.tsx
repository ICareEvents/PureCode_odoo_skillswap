'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { debounce } from '@/lib/utils';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search for skills, people, or keywords...",
  className = "",
  debounceMs = 300
}) => {
  const [internalValue, setInternalValue] = useState(value);

  const debouncedOnChange = debounce((newValue: string) => {
    onChange(newValue);
  }, debounceMs);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    debouncedOnChange(newValue);
  };

  const handleClear = () => {
    setInternalValue('');
    onChange('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          type="text"
          value={internalValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          leftIcon={<Search />}
          rightIcon={
            internalValue && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )
          }
          className="pl-10 pr-10"
        />
      </div>
    </div>
  );
};

export default SearchBar;