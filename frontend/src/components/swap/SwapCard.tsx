'use client';

import React, { useState } from 'react';
import { Check, X, Trash2, Star, ArrowRight } from 'lucide-react';
import { SwapRequest } from '@/types/swap';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/notificationStore';
import { swapAPI } from '@/lib/api';
import { formatRelativeTime, getStatusColor } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import RatingModal from './RatingModal';

interface SwapCardProps {
  swap: SwapRequest;
  onUpdate?: () => void;
  className?: string;
}

const SwapCard: React.FC<SwapCardProps> = ({ swap, onUpdate, className = "" }) => {
  const { user } = useAuth();
  const { showError, showSuccess } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const isRequester = user?.id === swap.requester_id;
  const isResponder = user?.id === swap.responder_id;
  const otherUser = isRequester 
    ? { id: swap.responder_id, name: swap.responder_name }
    : { id: swap.requester_id, name: swap.requester_name };

  const canAccept = isResponder && swap.status === 'pending';
  const canReject = isResponder && swap.status === 'pending';
  const canCancel = isRequester && swap.status === 'pending';
  const canDelete = isRequester && swap.status === 'pending';
  const canRate = swap.status === 'accepted' && !swap.has_rating;

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await swapAPI.updateSwapRequest(swap.id, { status: 'accepted' });
      showSuccess('Swap request accepted!');
      onUpdate?.();
    } catch (error: any) {
      showError('Failed to accept request', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await swapAPI.updateSwapRequest(swap.id, { status: 'rejected' });
      showSuccess('Swap request rejected');
      onUpdate?.();
    } catch (error: any) {
      showError('Failed to reject request', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await swapAPI.updateSwapRequest(swap.id, { status: 'cancelled' });
      showSuccess('Swap request cancelled');
      onUpdate?.();
    } catch (error: any) {
      showError('Failed to cancel request', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this swap request?')) {
      return;
    }

    setIsLoading(true);
    try {
      await swapAPI.deleteSwapRequest(swap.id);
      showSuccess('Swap request deleted');
      onUpdate?.();
    } catch (error: any) {
      showError('Failed to delete request', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingComplete = () => {
    setIsRatingModalOpen(false);
    onUpdate?.();
  };

  return (
    <>
      <Card className={`${className}`}>
        <div className="flex flex-col space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-900">
                  {isRequester ? `Request to ${swap.responder_name}` : `Request from ${swap.requester_name}`}
                </h3>
                <Badge
                  variant={
                    swap.status === 'pending' ? 'warning' :
                    swap.status === 'accepted' ? 'success' :
                    swap.status === 'completed' ? 'info' :
                    'default'
                  }
                  size="sm"
                >
                  {swap.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {formatRelativeTime(swap.created_at)}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <Badge variant="primary" className="mb-2">
                  {isRequester ? 'You offer' : 'They offer'}
                </Badge>
                <p className="font-medium text-gray-900">{swap.offered_skill.name}</p>
              </div>
              
              <ArrowRight className="w-5 h-5 text-gray-400" />
              
              <div className="text-center">
                <Badge variant="info" className="mb-2">
                  {isRequester ? 'You want' : 'They want'}
                </Badge>
                <p className="font-medium text-gray-900">{swap.wanted_skill.name}</p>
              </div>
            </div>
          </div>

          {swap.message && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Message:</span> {swap.message}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
            {canAccept && (
              <Button
                onClick={handleAccept}
                loading={isLoading}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Check className="w-4 h-4 mr-1" />
                Accept
              </Button>
            )}

            {canReject && (
              <Button
                onClick={handleReject}
                loading={isLoading}
                variant="danger"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <X className="w-4 h-4 mr-1" />
                Reject
              </Button>
            )}

            {canCancel && (
              <Button
                onClick={handleCancel}
                loading={isLoading}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            )}

            {canDelete && (
              <Button
                onClick={handleDelete}
                loading={isLoading}
                variant="danger"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}

            {canRate && (
              <Button
                onClick={() => setIsRatingModalOpen(true)}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Star className="w-4 h-4 mr-1" />
                Rate Experience
              </Button>
            )}

            {swap.status === 'completed' && swap.has_rating && (
              <Badge variant="success" size="sm">
                ✓ Rated
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {isRatingModalOpen && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          swap={swap}
          ratedUser={otherUser}
          onComplete={handleRatingComplete}
        />
      )}
    </>
  );
};

export default SwapCard;