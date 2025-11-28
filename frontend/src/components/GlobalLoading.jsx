import React from 'react';
import useGlobalLoadingStore from '../store/globalLoadingStore';
import { Loading } from './common';

const GlobalLoading = () => {
  const { globalLoading } = useGlobalLoadingStore();

  if (globalLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
        <Loading size="lg" />
      </div>
    );
  }

  return null;
};

export default GlobalLoading;