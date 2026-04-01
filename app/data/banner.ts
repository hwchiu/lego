export interface BannerSlide {
  label: string;
  labelVariant: 'tip' | 'breaking';
  prefix?: string;
  linkText: string;
  linkHref: string;
}

export const bannerSlides: BannerSlide[] = [
  {
    label: 'Tip',
    labelVariant: 'tip',
    prefix: '試著用自然語言提問！試著輸入：',
    linkText: 'NVIDIA 最新財報表現如何？',
    linkHref: '#tutorial',
  },
  {
    label: 'Breaking News',
    labelVariant: 'breaking',
    linkText: "Nvidia Stock Pullback and AI's Energy Challenge in 2026",
    linkHref: '#tutorial',
  },
];
