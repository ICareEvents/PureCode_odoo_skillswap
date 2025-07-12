'use client';

import React from 'react';
import { Filter, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface FilterBarProps {
  availability: string;
  onAvailabilityChange: (availability: string) => void;
  skill: string;
  onSkillChange: (skill: string) => void;
  onClearFilters: () => void;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  availability,
  onAvailabilityChange,
  skill,
  onSkillChange,
  onClearFilters,
  className = ""
}) => {
  const availabilityOptions = [
    { value: '', label: 'All', icon: null },
    { value: 'available', label: 'Available', icon: CheckCircle, color: 'success' },
    { value: 'busy', label: 'Busy', icon: Clock, color: 'warning' },
    { value: 'unavailable', label: 'Unavailable', icon: AlertCircle, color: 'danger' },
  ];

  const hasActiveFilters = availability !== '' || skill !== '';

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
          </div>

          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Availability:</span>
              <div className="flex flex-wrap gap-1">
                {availabilityOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = availability === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => onAvailabilityChange(option.value)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-primary-100 text-primary-800 border border-primary-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                      }`}
                    >
                      {Icon && <Icon className="w-3 h-3 mr-1" />}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Skill:</span>
              <input
                type="text"
                value={skill}
                onChange={(e) => onSkillChange(e.target.value)}
                placeholder="Enter skill name..."
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-auto"
              />
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {availability && (
                <Badge variant="primary" className="text-xs">
                  {availabilityOptions.find(opt => opt.value === availability)?.label}
                </Badge>
              )}
              {skill && (
                <Badge variant="info" className="text-xs">
                  Skill: {skill}
                </Badge>
              )}
            </div>
            <Button
              onClick={onClearFilters}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;