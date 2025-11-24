"use client";

import Image from "next/image";

/**
 * Shared logo component that leverages next/image so the logo
 * is served responsively with proper intrinsic dimensions.
 */
export default function BrandLogo({
  className,
  priority = false,
  width = 160,
  height = 50,
  sizes = "(max-width: 768px) 140px, 160px",
}) {
  const classes = ["header-logo", className].filter(Boolean).join(" ");

  return (
    <Image
      src="/assets/images/logo/justjobslogo.png"
      alt="JustJobs logo"
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      className={classes}
    />
  );
}

