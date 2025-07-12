'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Star } from 'lucide-react';
import { UserSearch } from '@/types/user';
import { useAuth } from '@/hooks/useAuth';
import { useUserRatings } from '@/hooks/useApi';
import { getInitials, getAvailabilityColor, truncateText } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import SwapRequestModal from '@/components/swap/SwapRequestModal';

interface UserCardProps {
  user: UserSearch;
  className?: string;
}

const UserCard: React.FC<UserCardProps> = ({ user, className = "" }) => {
  const { user: currentUser } = useAuth();
  const { data: ratings } = useUserRatings(user.id);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  const averageRating = ratings && ratings.length > 0
    ? ratings.reduce((sum, rating) => sum + rating.stars, 0) / ratings.length
    : 0;

  const canRequestSwap = currentUser && currentUser.id !== user.id && currentUser.offered_skills.length > 0;

  return (
    <>
      <Card hover className={`h-full ${className}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-start space-x-4 mb-4">
            <Link href={`/user/${user.id}`} className="flex-shrink-0">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {getInitials(user.name)}
                  </span>
                </div>
              )}
            </Link>
            
            <div className="flex-1 min-w-0">
              <Link href={`/user/${user.id}`}>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                  {user.name}
                </h3>
              </Link>
              
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant={
                    user.availability === 'available' ? 'success' :
                    user.availability === 'busy' ? 'warning' : 'danger'
                  }
                  size="sm"
                >
                  {user.availability}
                </Badge>
                
                {averageRating > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">
                      {averageRating.toFixed(1)} ({ratings?.length})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {user.bio && (
            <p className="text-sm text-gray-600 mb-4">
              {truncateText(user.bio, 120)}
            </p>
          )}

          <div className="space-y-3 mb-4 flex-1">
            {user.offered_skills.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Offers:</h4>
                <div className="flex flex-wrap gap-1">
                  {user.offered_skills.slice(0, 3).map(skill => (
                    <Badge key={skill.id} variant="primary" size="sm">
                      {skill.name}
                    </Badge>
                  ))}
                  {user.offered_skills.length > 3 && (
                    <Badge variant="default" size="sm">
                      +{user.offered_skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {user.wanted_skills.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Wants:</h4>
                <div className="flex flex-wrap gap-1">
                  {user.wanted_skills.slice(0, 3).map(skill => (
                    <Badge key={skill.id} variant="info" size="sm">
                      {skill.name}
                    </Badge>
                  ))}
                  {user.wanted_skills.length > 3 && (
                    <Badge variant="default" size="sm">
                      +{user.wanted_skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-2 pt-4 border-t border-gray-200">
            <Link href={`/user/${user.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View Profile
              </Button>
            </Link>
            
            {canRequestSwap && (
              <Button
                onClick={() => setIsSwapModalOpen(true)}
                size="sm"
                className="flex-1"
                disabled={user.availability === 'unavailable'}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Request Swap
              </Button>
            )}
          </div>
        </div>
      </Card>

      {isSwapModalOpen && canRequestSwap && (
        <SwapRequestModal
          isOpen={isSwapModalOpen}
          onClose={() => setIsSwapModalOpen(false)}
          targetUser={user}
        />
      )}
    </>
  );
};

export default UserCard;