'use client';

import Image from 'next/image';
import NNLogo from '@/app/NN_LOGO.svg';

type BrandLogoProps = {
  className?: string;
  alt?: string;
  decorative?: boolean;
  priority?: boolean;
  width?: number;
  height?: number;
};

export default function BrandLogo({
  className,
  alt = 'NeuralExplorer logo',
  decorative = false,
  priority = false,
  width = 32,
  height = 32,
}: BrandLogoProps) {
  return (
    <Image
      src={NNLogo}
      alt={decorative ? '' : alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      aria-hidden={decorative ? true : undefined}
      unoptimized={false}
    />
  );
}
