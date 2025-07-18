import { useEffect, useState } from 'react';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    // Mark as ready immediately
    setReady(true);
    
    // Call framework ready if it exists
    window.frameworkReady?.();
  }, []);
  
  return { ready };
}
