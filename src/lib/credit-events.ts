/**
 * Utility function to trigger credit updates across the application
 * This should be called after any credit operation to update the UI
 */
export function triggerCreditUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('creditsUpdated'));
  }
}

/**
 * Hook to listen for credit updates
 * Returns a function to manually trigger updates
 */
export function useCreditUpdate() {
  const triggerUpdate = () => {
    triggerCreditUpdate();
  };

  return { triggerUpdate };
}