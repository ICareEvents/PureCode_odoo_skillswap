'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquare, Send } from 'lucide-react';
import { UserSearch } from '@/types/user';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const swapRequestSchema = z.object({
  offered_skill_id: z.number().min(1, 'Please select a skill to offer'),
  wanted_skill_id: z.number().min(1, 'Please select a skill you want'),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
});

type SwapRequestFormData = z.infer<typeof swapRequestSchema>;

interface SwapRequestFormProps {
  targetUser: UserSearch;
  onSubmit: (data: SwapRequestFormData) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

const SwapRequestForm: React.FC<SwapRequestFormProps> = ({
  targetUser,
  onSubmit,
  isLoading = false,
  className = ""
}) => {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<SwapRequestFormData>({
    resolver: zodResolver(swapRequestSchema),
  });

  const selectedOfferedSkillId = watch('offered_skill_id');
  const selectedWantedSkillId = watch('wanted_skill_id');
  const messageLength = watch('message')?.length || 0;

  const handleFormSubmit = async (data: SwapRequestFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (!user) {
    return (
      <div className={`p-6 bg-gray-50 rounded-lg text-center ${className}`}>
        <p className="text-gray-600">Please log in to request a skill swap.</p>
      </div>
    );
  }

  if (user.offered_skills.length === 0) {
    return (
      <div className={`p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center ${className}`}>
        <p className="text-yellow-800 mb-2">
          You need to add skills to your profile before making swap requests.
        </p>
        <p className="text-yellow-600 text-sm">
          Visit your profile page to add skills you can offer.
        </p>
      </div>
    );
  }

  if (targetUser.offered_skills.length === 0) {
    return (
      <div className={`p-6 bg-gray-50 rounded-lg text-center ${className}`}>
        <p className="text-gray-600">
          This user hasn't listed any skills they can offer yet.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={`space-y-6 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select a skill you want to offer:
        </label>
        <div className="space-y-2">
          {user.offered_skills.map(skill => (
            <label
              key={skill.id}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                selectedOfferedSkillId === skill.id
                  ? 'border-primary-500 bg-primary-50 shadow-sm'
                  : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                {...register('offered_skill_id', { valueAsNumber: true })}
                value={skill.id}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{skill.name}</h4>
                  {selectedOfferedSkillId === skill.id && (
                    <Badge variant="primary" size="sm">Selected</Badge>
                  )}
                </div>
                {skill.description && (
                  <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                )}
              </div>
              {selectedOfferedSkillId === skill.id && (
                <div className="ml-3 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </label>
          ))}
        </div>
        {errors.offered_skill_id && (
          <p className="mt-2 text-sm text-red-600">{errors.offered_skill_id.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select a skill you want to learn from {targetUser.name}:
        </label>
        <div className="space-y-2">
          {targetUser.offered_skills.map(skill => (
            <label
              key={skill.id}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                selectedWantedSkillId === skill.id
                  ? 'border-primary-500 bg-primary-50 shadow-sm'
                  : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                {...register('wanted_skill_id', { valueAsNumber: true })}
                value={skill.id}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{skill.name}</h4>
                  {selectedWantedSkillId === skill.id && (
                    <Badge variant="info" size="sm">Selected</Badge>
                  )}
                </div>
                {skill.description && (
                  <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                )}
              </div>
              {selectedWantedSkillId === skill.id && (
                <div className="ml-3 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </label>
          ))}
        </div>
        {errors.wanted_skill_id && (
          <p className="mt-2 text-sm text-red-600">{errors.wanted_skill_id.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Personal message (optional)
        </label>
        <div className="relative">
          <textarea
            {...register('message')}
            rows={4}
            placeholder={`Hi ${targetUser.name}, I'd love to learn ${targetUser.offered_skills[0]?.name || 'from you'}. Let me know if you're interested in a skill swap!`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {messageLength}/500
          </div>
        </div>
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Introduce yourself and explain why you're interested in this skill exchange.
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {selectedOfferedSkillId && selectedWantedSkillId ? (
            <span className="text-green-600 font-medium">✓ Ready to send request</span>
          ) : (
            <span>Please select skills for both parties</span>
          )}
        </div>
        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading || !selectedOfferedSkillId || !selectedWantedSkillId}
          className="min-w-[140px]"
        >
          {isLoading ? (
            'Sending...'
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Request
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default SwapRequestForm;