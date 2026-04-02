export type ReportTime = 'Pre' | 'Post' | 'During-Market';
export type BeatMiss = 'Beat' | 'Miss' | null;

export interface WeekDay {
  dayLabel: string;   // SUN, MON...
  dateLabel: string;  // Apr 1, Mar 30...
  isToday?: boolean;
  companies?: string[];
  companyCount?: number;
  isEmpty?: boolean;  // placeholder cell for month grid padding
}

export interface EpsRow {
  symbol: string;
  company: string;
  report: ReportTime;
  mktCap: string;
  epsNormalized: string;
  epsYoY: string;
  epsYoYPositive: boolean;
  epsGaap: string;
  epsActual: string | null;
  epsBeatMiss: BeatMiss;
  lastQGaap: string;
  lastQBeatMiss: BeatMiss;
  beatsL2Y: number;
  missedL2Y: number;
}

export interface RevenueRow {
  symbol: string;
  company: string;
  report: ReportTime;
  mktCap: string;
  revConsensus: string;
  revYoY: string;
  revYoYPositive: boolean;
  revHighEst: string;
  revActual: string | null;
  revBeatMiss: BeatMiss;
  lastQActual: string;
  lastQBeatMiss: BeatMiss;
}

export const weekDays: WeekDay[] = [
  { dayLabel: 'SUN', dateLabel: 'Mar 29' },
  {
    dayLabel: 'MON',
    dateLabel: 'Mar 30',
    companyCount: 50,
    companies: ['WBA', 'JEF', 'CTAS', 'LEN', 'RPM', 'MO', 'SNX', 'AYI', 'NVT', 'HELE'],
  },
  {
    dayLabel: 'TUE',
    dateLabel: 'Mar 31',
    companyCount: 58,
    companies: ['PAYX', 'MKC', 'ACN', 'NKE', 'STZ', 'WGO', 'DLTR', 'FIVE', 'COST', 'CASY'],
  },
  {
    dayLabel: 'WED',
    dateLabel: 'Apr 1',
    isToday: true,
    companyCount: 19,
    companies: ['TLK', 'CAG', 'LW', 'MSM', 'UNF', 'CALM', 'PENG', 'TLRY', 'PSMT', 'BNED'],
  },
  {
    dayLabel: 'THU',
    dateLabel: 'Apr 2',
    companyCount: 26,
    companies: ['AZZ', 'GMS', 'CIEN', 'LNTH', 'AIR', 'SCSC', 'ORN', 'STRT', 'AMSF', 'HOFT'],
  },
  { dayLabel: 'FRI', dateLabel: 'Apr 3' },
  { dayLabel: 'SAT', dateLabel: 'Apr 4' },
];

export const epsData: EpsRow[] = [
  {
    symbol: 'TLK', company: 'PT Telekomunikasi Indonesia Tbk', report: 'Pre',
    mktCap: '$17.2B', epsNormalized: '$0.42', epsYoY: '+3.2%', epsYoYPositive: true,
    epsGaap: '$0.38', epsActual: '$0.43', epsBeatMiss: 'Beat',
    lastQGaap: '$0.41', lastQBeatMiss: 'Beat', beatsL2Y: 4, missedL2Y: 2,
  },
  {
    symbol: 'CAG', company: 'Conagra Brands, Inc.', report: 'Pre',
    mktCap: '$10.8B', epsNormalized: '$0.61', epsYoY: '−8.4%', epsYoYPositive: false,
    epsGaap: '$0.58', epsActual: '$0.56', epsBeatMiss: 'Miss',
    lastQGaap: '$0.68', lastQBeatMiss: 'Miss', beatsL2Y: 3, missedL2Y: 5,
  },
  {
    symbol: 'LW', company: 'Lamb Weston Holdings, Inc.', report: 'Pre',
    mktCap: '$4.2B', epsNormalized: '$0.48', epsYoY: '−22.3%', epsYoYPositive: false,
    epsGaap: '$0.44', epsActual: null, epsBeatMiss: null,
    lastQGaap: '$0.76', lastQBeatMiss: 'Miss', beatsL2Y: 2, missedL2Y: 6,
  },
  {
    symbol: 'MSM', company: 'MSC Industrial Direct Co., Inc.', report: 'Post',
    mktCap: '$3.1B', epsNormalized: '$1.08', epsYoY: '−5.2%', epsYoYPositive: false,
    epsGaap: '$1.02', epsActual: null, epsBeatMiss: null,
    lastQGaap: '$1.12', lastQBeatMiss: 'Beat', beatsL2Y: 5, missedL2Y: 3,
  },
  {
    symbol: 'UNF', company: 'UniFirst Corporation', report: 'Pre',
    mktCap: '$1.5B', epsNormalized: '$1.95', epsYoY: '+2.8%', epsYoYPositive: true,
    epsGaap: '$1.88', epsActual: null, epsBeatMiss: null,
    lastQGaap: '$1.86', lastQBeatMiss: 'Beat', beatsL2Y: 6, missedL2Y: 2,
  },
  {
    symbol: 'CALM', company: 'Cal-Maine Foods, Inc.', report: 'Pre',
    mktCap: '$3.8B', epsNormalized: '$5.42', epsYoY: '+187.3%', epsYoYPositive: true,
    epsGaap: '$5.10', epsActual: null, epsBeatMiss: null,
    lastQGaap: '$6.15', lastQBeatMiss: 'Beat', beatsL2Y: 7, missedL2Y: 1,
  },
  {
    symbol: 'PENG', company: 'Penguin Solutions, Inc.', report: 'Post',
    mktCap: '$0.4B', epsNormalized: '$0.28', epsYoY: '−12.5%', epsYoYPositive: false,
    epsGaap: '$0.25', epsActual: null, epsBeatMiss: null,
    lastQGaap: '$0.31', lastQBeatMiss: 'Beat', beatsL2Y: 3, missedL2Y: 5,
  },
  {
    symbol: 'TLRY', company: 'Tilray Brands, Inc.', report: 'Post',
    mktCap: '$1.2B', epsNormalized: '−$0.05', epsYoY: '+16.7%', epsYoYPositive: true,
    epsGaap: '−$0.08', epsActual: null, epsBeatMiss: null,
    lastQGaap: '−$0.06', lastQBeatMiss: 'Miss', beatsL2Y: 2, missedL2Y: 6,
  },
];

export const revenueData: RevenueRow[] = [
  {
    symbol: 'TLK', company: 'PT Telekomunikasi Indonesia Tbk', report: 'Pre',
    mktCap: '$17.2B', revConsensus: '$3.28B', revYoY: '+4.1%', revYoYPositive: true,
    revHighEst: '$3.41B', revActual: '$3.31B', revBeatMiss: 'Beat',
    lastQActual: '$3.15B', lastQBeatMiss: 'Beat',
  },
  {
    symbol: 'CAG', company: 'Conagra Brands, Inc.', report: 'Pre',
    mktCap: '$10.8B', revConsensus: '$2.96B', revYoY: '−3.8%', revYoYPositive: false,
    revHighEst: '$3.04B', revActual: '$2.91B', revBeatMiss: 'Miss',
    lastQActual: '$3.08B', lastQBeatMiss: 'Miss',
  },
  {
    symbol: 'LW', company: 'Lamb Weston Holdings, Inc.', report: 'Pre',
    mktCap: '$4.2B', revConsensus: '$1.51B', revYoY: '−9.2%', revYoYPositive: false,
    revHighEst: '$1.58B', revActual: null, revBeatMiss: null,
    lastQActual: '$1.66B', lastQBeatMiss: 'Miss',
  },
  {
    symbol: 'CALM', company: 'Cal-Maine Foods, Inc.', report: 'Pre',
    mktCap: '$3.8B', revConsensus: '$1.08B', revYoY: '+94.6%', revYoYPositive: true,
    revHighEst: '$1.14B', revActual: null, revBeatMiss: null,
    lastQActual: '$1.11B', lastQBeatMiss: 'Beat',
  },
  {
    symbol: 'TLRY', company: 'Tilray Brands, Inc.', report: 'Post',
    mktCap: '$1.2B', revConsensus: '$209.4M', revYoY: '−5.1%', revYoYPositive: false,
    revHighEst: '$218.0M', revActual: null, revBeatMiss: null,
    lastQActual: '$220.6M', lastQBeatMiss: 'Miss',
  },
];
