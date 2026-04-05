// ESG Reports data — TSMC and Apple historical sustainability reports (6 years each)

export interface EsgReport {
  company: 'TSMC' | 'Apple';
  year: number;
  title: string;
  fiscalYear: string;
  description: string;
  url: string;
}

export const ESG_REPORTS: EsgReport[] = [
  // ── TSMC Sustainability Reports ──────────────────────────────────────────────
  {
    company: 'TSMC',
    year: 2024,
    fiscalYear: 'FY2023',
    title: 'TSMC 2024 Sustainability Report',
    description:
      'Covers Scope 1/2/3 emissions, renewable energy adoption (14%+ of total power), water stewardship, net-zero 2050 pathway, and supply chain ESG management across TSMC global operations.',
    url: 'https://esg.tsmc.com/file/public/2024-TSMC-Sustainability-Report-e.pdf',
  },
  {
    company: 'TSMC',
    year: 2023,
    fiscalYear: 'FY2022',
    title: 'TSMC 2023 Sustainability Report',
    description:
      'Details RE100 commitment progress, SBTi-aligned targets, Scope 3 supplier assessments, corporate governance enhancements, and diversity & inclusion milestones.',
    url: 'https://esg.tsmc.com/file/public/2023-TSMC-Sustainability-Report-e.pdf',
  },
  {
    company: 'TSMC',
    year: 2022,
    fiscalYear: 'FY2021',
    title: 'TSMC 2022 Sustainability Report',
    description:
      'Focuses on climate risk management, circular economy initiatives, green manufacturing innovation, water recycling programs, and community engagement in Taiwan and overseas.',
    url: 'https://esg.tsmc.com/file/public/2022-TSMC-Sustainability-Report-e.pdf',
  },
  {
    company: 'TSMC',
    year: 2021,
    fiscalYear: 'FY2020',
    title: 'TSMC 2021 Sustainability Report',
    description:
      'Highlights COVID-19 response, employee health & safety improvements, energy efficiency milestones, green building certifications, and sustainable supply chain practices.',
    url: 'https://esg.tsmc.com/file/public/2021-TSMC-Sustainability-Report-e.pdf',
  },
  {
    company: 'TSMC',
    year: 2020,
    fiscalYear: 'FY2019',
    title: 'TSMC 2020 Sustainability Report',
    description:
      'Covers GHG emission intensity reductions, water recycling achievements exceeding 85%, responsible minerals sourcing policies, and human rights due diligence.',
    url: 'https://esg.tsmc.com/file/public/2020-TSMC-Sustainability-Report-e.pdf',
  },
  {
    company: 'TSMC',
    year: 2019,
    fiscalYear: 'FY2018',
    title: 'TSMC 2019 Sustainability Report',
    description:
      'Presents environmental management system upgrades, workplace safety culture improvements, community investment programs, and first consolidated GRI Standards disclosure.',
    url: 'https://esg.tsmc.com/file/public/2019-TSMC-Sustainability-Report-e.pdf',
  },

  // ── Apple Environmental Progress Reports ─────────────────────────────────────
  {
    company: 'Apple',
    year: 2024,
    fiscalYear: 'FY2023',
    title: 'Apple 2024 Environmental Progress Report',
    description:
      'Details progress toward Apple 2030 carbon-neutral product goal, Supplier Clean Energy Program (300+ suppliers), manufacturing material innovations, and circular economy milestones including 100% recycled cobalt in batteries.',
    url: 'https://www.apple.com/environment/pdf/Apple_Environmental_Progress_Report_2024.pdf',
  },
  {
    company: 'Apple',
    year: 2023,
    fiscalYear: 'FY2022',
    title: 'Apple 2023 Environmental Progress Report',
    description:
      'Covers carbon neutrality roadmap across the full product lifecycle, expansion of renewable energy in manufacturing to 18 GW, product carbon footprint disclosures, and packaging reduction achievements.',
    url: 'https://www.apple.com/environment/pdf/Apple_Environmental_Progress_Report_2023.pdf',
  },
  {
    company: 'Apple',
    year: 2022,
    fiscalYear: 'FY2021',
    title: 'Apple 2022 Environmental Progress Report',
    description:
      'Reports on Apple 2030 climate commitment announcement, clean energy investments across the supply chain, product carbon footprint reductions, packaging fiber transition, and water stewardship in manufacturing.',
    url: 'https://www.apple.com/environment/pdf/Apple_Environmental_Progress_Report_2022.pdf',
  },
  {
    company: 'Apple',
    year: 2021,
    fiscalYear: 'FY2020',
    title: 'Apple 2021 Environmental Progress Report',
    description:
      'Highlights 100% renewable electricity for corporate operations globally, Supplier Clean Energy Program extending to the supply chain, and product design for environment principles delivering lower carbon devices.',
    url: 'https://www.apple.com/environment/pdf/Apple_Environmental_Progress_Report_2021.pdf',
  },
  {
    company: 'Apple',
    year: 2020,
    fiscalYear: 'FY2019',
    title: 'Apple 2020 Environmental Responsibility Report',
    description:
      'Annual report on carbon emission reductions, recycled aluminum alloy adoption, zero-waste manufacturing certification for major facilities, and clean water programs in supplier communities.',
    url: 'https://www.apple.com/environment/pdf/Apple_Environmental_Responsibility_Report_2020.pdf',
  },
  {
    company: 'Apple',
    year: 2019,
    fiscalYear: 'FY2018',
    title: 'Apple 2019 Environmental Responsibility Report',
    description:
      'Details the transition to 100% renewable energy for all worldwide operations, Supplier Clean Energy Program milestones with 23 suppliers, product lifecycle carbon footprint methodology, and use of recycled tin and rare earth elements.',
    url: 'https://www.apple.com/environment/pdf/Apple_Environmental_Responsibility_Report_2019.pdf',
  },
];
