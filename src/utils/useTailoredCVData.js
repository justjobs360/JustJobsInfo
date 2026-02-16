/**
 * Custom hook to read tailored CV data from sessionStorage
 * Used by resume builder templates to pre-fill form data from job fit analysis
 */
import { useState, useEffect } from 'react';

export function useTailoredCVData() {
  const [initialFormData, setInitialFormData] = useState({});
  const [initialSections, setInitialSections] = useState(null);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !hasLoadedInitialData) {
      const urlParams = new URLSearchParams(window.location.search);
      const tailored = urlParams.get('tailored');
      const importFlag = urlParams.get('import');
      const dataKey = urlParams.get('dataKey');
      const hasTailoredOrImportData = (tailored === 'true' || importFlag === 'true') && dataKey;

      if (hasTailoredOrImportData) {
        try {
          const storageKey = `tailored_cv_${dataKey}`;
          const storedData = sessionStorage.getItem(storageKey);
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            const formData = parsedData.form || {};
            const sections = parsedData.sections || null;
            
            if (formData && Object.keys(formData).length > 0) {
              setInitialFormData(formData);
              if (sections && sections.length > 0) {
                setInitialSections(sections);
              }
            }
            setHasLoadedInitialData(true);
            sessionStorage.removeItem(storageKey);
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          } else {
            // No data found, mark as loaded to prevent infinite waiting
            setHasLoadedInitialData(true);
          }
        } catch (error) {
          console.error('Error loading tailored CV data:', error);
          setHasLoadedInitialData(true);
        }
      } else {
        // No tailored flag, mark as loaded
        setHasLoadedInitialData(true);
      }
    }
  }, [hasLoadedInitialData]);

  return { initialFormData, initialSections, hasLoadedInitialData };
}
