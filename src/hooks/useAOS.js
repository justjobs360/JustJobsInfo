"use client";

import { useEffect, useMemo } from 'react';

const DEFAULT_OPTIONS = {
  disableMutationObserver: true,
  once: true,
};

let aosLoaderPromise;

const loadAOS = async () => {
  if (!aosLoaderPromise) {
    aosLoaderPromise = Promise.all([
      import('aos'),
      import('aos/dist/aos.css'),
    ]).then(([module]) => module.default ?? module);
  }
  return aosLoaderPromise;
};

export default function useAOS(options = {}) {
  const optionsKey = useMemo(() => JSON.stringify(options), [options]);
  const parsedOptions = useMemo(() => JSON.parse(optionsKey), [optionsKey]);
  const mergedOptions = useMemo(() => ({
    ...DEFAULT_OPTIONS,
    ...parsedOptions,
  }), [parsedOptions]);

  useEffect(() => {
    let isCancelled = false;

    // On mobile, defer AOS loading for better performance
    const initAOS = () => {
      loadAOS().then((AOS) => {
        if (isCancelled || !AOS) return;
        AOS.init(mergedOptions);
      });
    };

    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      // Defer on mobile using requestIdleCallback
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(initAOS, { timeout: 1000 });
      } else {
        setTimeout(initAOS, 200);
      }
    } else {
      initAOS();
    }

    return () => {
      isCancelled = true;
    };
  }, [mergedOptions]);
}


