'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Clock, CheckCircle, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMySwaps } from '@/hooks/useApi';
import SwapCard from '@/components/swap/SwapCard';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function SwapsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { data: swaps, error, isLoading: swapsLoading, mutate } = useMySwaps();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSwapUpdate = () => {
    mutate();
  };

  if (isLoading || swapsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CardContent>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Failed to Load Swaps
              </h2>
              <p className="text-gray-600 mb-4">
                There was an error loading your swap requests.
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const EmptyState = ({ 
    icon: Icon, 
    title, 
    description, 
    actionText, 
    actionHref 
  }: { 
    icon: any; 
    title: string; 
    description: string; 
    actionText?: string; 
    actionHref?: string; 
  }) => (
    <Card className="text-center py-12">
      <CardContent>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-4">
          {description}
        </p>
        {actionText && actionHref && (
          <Link href={actionHref}>
            <Button>{actionText}</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Skill Swaps
          </h1>
          <p className="text-gray-600">
            Manage your skill exchange requests and track your progress
          </p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Pending ({swaps?.pending.length || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Accepted ({swaps?.accepted.length || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>Completed ({swaps?.completed.length || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>History ({swaps?.history.length || 0})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {swaps?.pending.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No Pending Requests"
                description="You don't have any pending swap requests. Start exploring to find people to exchange skills with!"
                actionText="Explore Skills"
                actionHref="/"
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {swaps?.pending.map((swap) => (
                  <SwapCard
                    key={swap.id}
                    swap={swap}
                    onUpdate={handleSwapUpdate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="accepted">
            {swaps?.accepted.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="No Accepted Swaps"
                description="Once someone accepts your swap request or you accept someone else's, they'll appear here."
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {swaps?.accepted.map((swap) => (
                  <SwapCard
                    key={swap.id}
                    swap={swap}
                    onUpdate={handleSwapUpdate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {swaps?.completed.length === 0 ? (
              <EmptyState
                icon={Star}
                title="No Completed Swaps"
                description="Completed swaps will appear here after you rate your experience with other users."
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {swaps?.completed.map((swap) => (
                  <SwapCard
                    key={swap.id}
                    swap={swap}
                    onUpdate={handleSwapUpdate}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {swaps?.history.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No History"
                description="Rejected and cancelled swap requests will appear here."
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {swaps?.history.map((swap) => (
                  <SwapCard
                    key={swap.id}
                    swap={swap}
                    onUpdate={handleSwapUpdate}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}