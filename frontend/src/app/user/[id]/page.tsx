'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, MessageSquare, Calendar, MapPin } from 'lucide-react';
import { useUser, useUserRatings } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { getInitials, formatDate } from '@/lib/utils';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SwapRequestModal from '@/components/swap/SwapRequestModal';

export default function UserProfilePage() {
  const params = useParams();
  const userId = parseInt(params.id as string);
  const { user: currentUser } = useAuth();
  const { data: user, error, isLoading } = useUser(userId);
  const { data: ratings } = useUserRatings(userId);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  const averageRating = ratings && ratings.length > 0
    ? ratings.reduce((sum, rating) => sum + rating.stars, 0) / ratings.length
    : 0;

  const canRequestSwap = currentUser && 
    currentUser.id !== userId && 
    currentUser.offered_skills.length > 0 &&
    user?.availability !== 'unavailable';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center">
          <CardContent>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              User Not Found
            </h2>
            <p className="text-gray-600">
              The user you're looking for doesn't exist or their profile is private.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="text-center">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-2xl">
                        {getInitials(user.name)}
                      </span>
                    </div>
                  )}
                  
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {user.name}
                  </h1>
                  
                  <Badge
                    variant={
                      user.availability === 'available' ? 'success' :
                      user.availability === 'busy' ? 'warning' : 'danger'
                    }
                    className="mb-4"
                  >
                    {user.availability}
                  </Badge>

                  {averageRating > 0 && (
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="ml-1 font-medium">{averageRating.toFixed(1)}</span>
                      </div>
                      <span className="text-gray-500">
                        ({ratings?.length} review{ratings?.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                  )}

                  {user.bio && (
                    <p className="text-gray-600 mb-6">
                      {user.bio}
                    </p>
                  )}

                  {canRequestSwap && (
                    <Button
                      onClick={() => setIsSwapModalOpen(true)}
                      className="w-full mb-4"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Request Skill Swap
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {user.offered_skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Skills I Can Offer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.offered_skills.map(skill => (
                        <div key={skill.id} className="p-4 border border-gray-200 rounded-lg">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {skill.name}
                          </h3>
                          {skill.description && (
                            <p className="text-sm text-gray-600">
                              {skill.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {user.wanted_skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Skills I Want to Learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.wanted_skills.map(skill => (
                        <div key={skill.id} className="p-4 border border-gray-200 rounded-lg">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {skill.name}
                          </h3>
                          {skill.description && (
                            <p className="text-sm text-gray-600">
                              {skill.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {ratings && ratings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {ratings.slice(0, 5).map(rating => (
                        <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <Star
                                    key={index}
                                    className={`w-4 h-4 ${
                                      index < rating.stars
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-medium text-gray-900">
                                {rating.rater_name}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDate(rating.created_at)}
                            </span>
                          </div>
                          {rating.comment && (
                            <p className="text-gray-600 text-sm">
                              {rating.comment}
                            </p>
                          )}
                        </div>
                      ))}
                      {ratings.length > 5 && (
                        <p className="text-sm text-gray-500 text-center">
                          And {ratings.length - 5} more reviews...
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {isSwapModalOpen && canRequestSwap && (
        <SwapRequestModal
          isOpen={isSwapModalOpen}
          onClose={() => setIsSwapModalOpen(false)}
          targetUser={user}
        />
      )}
    </>
  );
}