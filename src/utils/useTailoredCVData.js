/**
 * Custom hook to read tailored CV data from sessionStorage
 * Used by resume builder templates to pre-fill form data from job fit analysis
 */
import { useState, useEffect } from 'react';

export function useTailoredCVData() {
  const [initialFormData, setInitialFormData] = useState({});
  const [initialSections, setInitialSections] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tailored = urlParams.get('tailored');
      const dataKey = urlParams.get('dataKey');
      
      if (tailored === 'true' && dataKey) {
        try {
          const storageKey = `tailored_cv_${dataKey}`;
          const storedData = sessionStorage.getItem(storageKey);
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            setInitialFormData(parsedData.form || {});
            if (parsedData.sections && parsedData.sections.length > 0) {
              setInitialSections(parsedData.sections);
            }
            // Clear the data from sessionStorage after reading
            sessionStorage.removeItem(storageKey);
            // Clean up URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          }
        } catch (error) {
          console.error('Error loading tailored CV data:', error);
        }
      }
    }
  }, []);

  return { initialFormData, initialSections };
}
