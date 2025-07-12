import useSWR from 'swr';
import { userAPI, skillAPI, swapAPI, ratingAPI } from '@/lib/api';

export const useUser = (userId?: number) => {
  return useSWR(
    userId ? `/users/${userId}` : null,
    () => userId ? userAPI.getUser(userId) : null,
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
    }
  );
};

export const useMyProfile = () => {
  return useSWR(
    '/users/me',
    userAPI.getMe,
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
    }
  );
};

export const useUsers = (params: {
  q?: string;
  availability?: string;
  skill?: string;
  page?: number;
  per_page?: number;
}) => {
  const key = `/users?${new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  ).toString()}`;
  
  return useSWR(
    key,
    () => userAPI.searchUsers(params),
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
      dedupingInterval: 30000,
    }
  );
};

export const useSkills = (params?: {
  q?: string;
  page?: number;
  per_page?: number;
}) => {
  const key = params 
    ? `/skills/search?${new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      ).toString()}`
    : '/skills';
  
  return useSWR(
    key,
    () => params ? skillAPI.searchSkills(params) : skillAPI.getAllSkills(),
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
      dedupingInterval: 60000,
    }
  );
};

export const useMySwaps = () => {
  return useSWR(
    '/swaps/my',
    swapAPI.getMySwaps,
    {
      revalidateOnFocus: true,
      errorRetryCount: 2,
      refreshInterval: 30000,
    }
  );
};

export const useUserRatings = (userId?: number) => {
  return useSWR(
    userId ? `/ratings/user/${userId}` : null,
    () => userId ? ratingAPI.getUserRatings(userId) : null,
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
    }
  );
};