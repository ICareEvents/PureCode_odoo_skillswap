'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquare } from 'lucide-react';
import { UserSearch } from '@/types/user';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/notificationStore';
import { swapAPI } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const swapRequestSchema = z.object({
  offered_skill_id: z.number().min(1, 'Please select a skill to offer'),
  wanted_skill_id: z.number().min(1, 'Please select a skill you want'),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
});

type SwapRequestFormData = z.infer<typeof swapRequestSchema>;

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: UserSearch;
}

const SwapRequestModal: React.FC<SwapRequestModalProps> = ({
  isOpen,
  onClose,
  targetUser
}) => {
  const { user } = useAuth();
  const { showError, showSuccess } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<SwapRequestFormData>({
    resolver: zodResolver(swapRequestSchema),
  });

  const selectedOfferedSkillId = watch('offered_skill_id');
  const selectedWantedSkillId = watch('wanted_skill_id');

  const onSubmit = async (data: SwapRequestFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      await swapAPI.createSwapRequest({
        responder_id: targetUser.id,
        offered_skill_id: data.offered_skill_id,
        wanted_skill_id: data.wanted_skill_id,
        message: data.message,
      });

      showSuccess('Swap request sent!', `Your request has been sent to ${targetUser.name}`);
      reset();
      onClose();
    } catch (error: any) {
      showError('Failed to send request', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Request Skill Swap"
      size="md"
    >
      <div className="space-y-6">
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          {targetUser.avatar_url ? (
            <img
              src={targetUser.avatar_url}
              alt={targetUser.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {getInitials(targetUser.name)}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{targetUser.name}</h3>
            <Badge
              variant={
                targetUser.availability === 'available' ? 'success' :
                targetUser.availability === 'busy' ? 'warning' : 'danger'
              }
              size="sm"
            >
              {targetUser.availability}
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I want to offer:
            </label>
            {user.offered_skills.length > 0 ? (
              <div className="space-y-2">
                {user.offered_skills.map(skill => (
                  <label
                    key={skill.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedOfferedSkillId === skill.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      {...register('offered_skill_id', { valueAsNumber: true })}
                      value={skill.id}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{skill.name}</div>
                      {skill.description && (
                        <div className="text-sm text-gray-600">{skill.description}</div>
                      )}
                    </div>
                    {selectedOfferedSkillId === skill.id && (
                      <div className="w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                You need to add skills to your profile before making swap requests.
              </p>
            )}
            {errors.offered_skill_id && (
              <p className="mt-1 text-sm text-red-600">{errors.offered_skill_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I want to learn:
            </label>
            {targetUser.offered_skills.length > 0 ? (
              <div className="space-y-2">
                {targetUser.offered_skills.map(skill => (
                  <label
                    key={skill.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedWantedSkillId === skill.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      {...register('wanted_skill_id', { valueAsNumber: true })}
                      value={skill.id}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{skill.name}</div>
                      {skill.description && (
                        <div className="text-sm text-gray-600">{skill.description}</div>
                      )}
                    </div>
                    {selectedWantedSkillId === skill.id && (
                      <div className="w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                This user hasn't listed any skills they can offer yet.
              </p>
            )}
            {errors.wanted_skill_id && (
              <p className="mt-1 text-sm text-red-600">{errors.wanted_skill_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (optional)
            </label>
            <textarea
              {...register('message')}
              rows={3}
              placeholder="Add a personal message to introduce yourself..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading || user.offered_skills.length === 0 || targetUser.offered_skills.length === 0}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Request
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default SwapRequestModal;