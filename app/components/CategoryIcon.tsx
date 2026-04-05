'use client';

interface CategoryIconProps {
  /** SVG inner HTML paths string from dataExplore.ts — always hardcoded, never user-supplied */
  paths: string;
  size?: number;
}

export default function CategoryIcon({ paths, size = 24 }: CategoryIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      // paths is always a hardcoded constant from dataExplore.ts, never user input
      dangerouslySetInnerHTML={{ __html: paths }}
    />
  );
}
