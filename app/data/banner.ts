export interface BannerSlide {
  label: string;
  beforeLink?: string;
  linkText?: string;
  linkHref?: string;
  afterLink?: string;
  text?: string;
}

export const bannerSlides: BannerSlide[] = [
  {
    label: 'Feedback',
    beforeLink: 'Share your thoughts! Fill out our ',
    linkText: 'feedback',
    linkHref: 'https://forms.office.com/Pages/ResponsePage.aspx?id=S_ZVkhgY5UKtePYZqaex55erID1a9UNKlr3EddIx_aZURENQWFpVNjNOSElLVlY0UVdHSklOSFdOUi4u',
    afterLink: ' survey. Your input is greatly appreciated.',
  },
  {
    label: 'User Guide',
    linkText: 'User guide',
    linkHref: 'https://tkms.digwork.tw.ent.tsmc.com/pages/Uw5xaVFEXr',
    afterLink: ' available now \u2013 explore its features!',
  },
  {
    label: 'Welcome',
    text: 'Pilot users! Enjoy early access to new features.',
  },
  {
    label: 'Tip',
    text: 'Use your watchlist to track information on your focus companies effortlessly!',
  },
  {
    label: 'Tip',
    text: 'Get quick insights with the company profile feature!',
  },
  {
    label: 'Tip',
    text: 'Never miss company events with our integrated event calendar!',
  },
];
