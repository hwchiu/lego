import rawContent from '@/content/banner.md';
import { extractJson } from '@/app/lib/parseContent';

export interface BannerSlide {
  label: string;
  labelVariant: 'tip' | 'breaking';
  prefix?: string;
  linkText: string;
  linkHref: string;
}

export const bannerSlides: BannerSlide[] = extractJson<BannerSlide[]>(rawContent);
