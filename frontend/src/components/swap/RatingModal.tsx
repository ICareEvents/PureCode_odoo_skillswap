'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star } from 'lucide-react';
import { SwapRequest } from '@/types/swap';
import { useNotificationStore } from '@/store/notificationStore';
import { ratingAPI } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

const ratingSchema = z.object({
  stars: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().max(140, 'Comment must be less than 140 characters').optional(),
});

type RatingFormData = z.infer<typeof ratingSchema>;

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  swap: SwapRequest;
  ratedUser: { id: number; name: string };
  onComplete: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  swap,
  ratedUser,
  onComplete
}) => {
  const { showError, showSuccess } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      stars: 0,
      comment: '',
    }
  });

  const selectedStars = watch('stars');

  const onSubmit = async (data: RatingFormData) => {
    setIsLoading(true);
    try {
      await ratingAPI.createRating({
        swap_id: swap.id,
        rated_id: ratedUser.id,
        stars: data.stars,
        comment: data.comment,
      });

      showSuccess('Rating submitted!', `Thank you for rating ${ratedUser.name}`);
      reset();
      onComplete();
    } catch (error: any) {
      showError('Failed to submit rating', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleStarClick = (starValue: number) => {
    setValue('stars', starValue);
  };

  const StarRating = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hoveredStar || selectedStars);
          
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className={`w-8 h-8 transition-colors ${
                isFilled
                  ? 'text-yellow-400 hover:text-yellow-500'
                  : 'text-gray-300 hover:text-gray-400'
              }`}
            >
              <Star className="w-full h-full fill-current" />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Rate Your Experience"
      size="md"
    >
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            How was your skill swap with {ratedUser.name}?
          </h3>
          <p className="text-sm text-gray-600">
            Your feedback helps build trust in our community
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Skill Exchange:</p>
            <p className="font-medium text-gray-900">
              {swap.offered_skill.name} ↔ {swap.wanted_skill.name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rate your experience (1-5 stars):
            </label>
            <div className="flex justify-center">
              <StarRating />
            </div>
            {selectedStars > 0 && (
              <p className="text-center text-sm text-gray-600 mt-2">
                {selectedStars === 1 && "Poor experience"}
                {selectedStars === 2 && "Fair experience"}
                {selectedStars === 3 && "Good experience"}
                {selectedStars === 4 && "Great experience"}
                {selectedStars === 5 && "Excellent experience"}
              </p>
            )}
            {errors.stars && (
              <p className="text-center text-sm text-red-600 mt-1">{errors.stars.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment (optional)
            </label>
            <textarea
              {...register('comment')}
              rows={3}
              placeholder="Share details about your experience..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.comment ? (
                <p className="text-sm text-red-600">{errors.comment.message}</p>
              ) : (
                <p className="text-sm text-gray-500">
                  Help others by sharing what made this experience great or how it could be improved
                </p>
              )}
              <p className="text-sm text-gray-400">
                {watch('comment')?.length || 0}/140
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Skip for now
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading || selectedStars === 0}
            >
              Submit Rating
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RatingModal;