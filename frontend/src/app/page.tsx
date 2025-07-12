'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Users, Zap, Shield, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUsers } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { usePagination } from '@/hooks/usePagination';
import SearchBar from '@/components/search/SearchBar';
import FilterBar from '@/components/search/FilterBar';
import UserCard from '@/components/search/UserCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [availability, setAvailability] = useState('');
  const [skill, setSkill] = useState('');
  
  const { page, perPage, setPage, canGoPrev, canGoNext } = usePagination({
    initialPerPage: 8
  });

  const { data: users, error, isLoading } = useUsers({
    q: searchQuery || undefined,
    availability: availability || undefined,
    skill: skill || undefined,
    page,
    per_page: perPage,
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setAvailability('');
    setSkill('');
    setPage(1);
  };

  const hasResults = users && users.length > 0;
  const hasFilters = searchQuery || availability || skill;
  const totalPages = hasResults ? Math.ceil(users.length / perPage) : 1;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                Exchange Skills,
                <br />
                <span className="text-primary-200">Build Connections</span>
              </h1>
              <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
                Connect with people in your community to teach what you know and learn what you want. 
                From coding to cooking, photography to foreign languages.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3">
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              How Skill Swap Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Find Someone</h3>
                <p className="text-gray-600">
                  Search for people who have skills you want to learn and offer skills they need.
                </p>
              </Card>

              <Card className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Connect & Swap</h3>
                <p className="text-gray-600">
                  Send a swap request and arrange to teach each other your respective skills.
                </p>
              </Card>

              <Card className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Learn & Grow</h3>
                <p className="text-gray-600">
                  Expand your skills, build your network, and contribute to a learning community.
                </p>
              </Card>
            </div>
          </div>
        </div>

        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of people already exchanging skills
              </p>
              <Link href="/register">
                <Button size="lg" className="px-8 py-3">
                  Create Your Profile
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Skills & People
          </h1>
          <p className="text-gray-600">
            Find people to exchange skills with in your area
          </p>
        </div>

        <div className="space-y-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search for skills, people, or keywords..."
          />

          <FilterBar
            availability={availability}
            onAvailabilityChange={setAvailability}
            skill={skill}
            onSkillChange={setSkill}
            onClearFilters={handleClearFilters}
          />

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded"></div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="text-center py-12">
              <p className="text-red-600 mb-4">Failed to load users</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </Card>
          ) : hasResults ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {users.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>

              {users.length >= perPage && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={!canGoPrev}
                    size="sm"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    Page {page}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={!canGoNext(totalPages)}
                    size="sm"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {hasFilters ? 'No results found' : 'No users available'}
              </h3>
              <p className="text-gray-600 mb-4">
                {hasFilters 
                  ? 'Try adjusting your search terms or filters'
                  : 'Be the first to add skills to your profile!'
                }
              </p>
              {hasFilters ? (
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Link href="/profile">
                  <Button>Update Your Profile</Button>
                </Link>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;