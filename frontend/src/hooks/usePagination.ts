import { useState, useCallback } from 'react';

interface UsePaginationProps {
  initialPage?: number;
  initialPerPage?: number;
}

interface UsePaginationReturn {
  page: number;
  perPage: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: (totalPages: number) => void;
  canGoPrev: boolean;
  canGoNext: (totalPages: number) => boolean;
  getOffset: () => number;
}

export const usePagination = ({ 
  initialPage = 1, 
  initialPerPage = 8 
}: UsePaginationProps = {}): UsePaginationReturn => {
  const [page, setPageState] = useState(initialPage);
  const [perPage, setPerPageState] = useState(initialPerPage);

  const setPage = useCallback((newPage: number) => {
    setPageState(Math.max(1, newPage));
  }, []);

  const setPerPage = useCallback((newPerPage: number) => {
    setPerPageState(Math.max(1, newPerPage));
    setPageState(1);
  }, []);

  const nextPage = useCallback(() => {
    setPageState(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPageState(prev => Math.max(1, prev - 1));
  }, []);

  const goToFirstPage = useCallback(() => {
    setPageState(1);
  }, []);

  const goToLastPage = useCallback((totalPages: number) => {
    setPageState(totalPages);
  }, []);

  const canGoPrev = page > 1;
  
  const canGoNext = useCallback((totalPages: number) => {
    return page < totalPages;
  }, [page]);

  const getOffset = useCallback(() => {
    return (page - 1) * perPage;
  }, [page, perPage]);

  return {
    page,
    perPage,
    setPage,
    setPerPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    canGoPrev,
    canGoNext,
    getOffset,
  };
};