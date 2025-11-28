import { create } from 'zustand';

const useGlobalLoadingStore = create((set, get) => ({
  globalLoading: false,
  requests: new Map(), // Track individual requests

  // Start a loading state for a specific request
  startLoading: (requestId) => {
    const { requests } = get().requests;
    const newRequests = new Map(requests);
    newRequests.set(requestId, true);
    set({ globalLoading: true, requests: newRequests });
  },

  // End a loading state for a specific request
  endLoading: (requestId) => {
    const { requests } = get().requests;
    const newRequests = new Map(requests);
    newRequests.delete(requestId);
    set({ 
      globalLoading: newRequests.size > 0, 
      requests: newRequests 
    });
  },

  // Directly set global loading state
  setGlobalLoading: (loading) => {
    set({ globalLoading: loading });
  },
}));

export default useGlobalLoadingStore;