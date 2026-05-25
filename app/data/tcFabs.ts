// Intel global fab location data — used by Government Regulations world map

export interface FabInfo {
  id: string;
  name: string;
  description: string;
  node: string;
  established: string;
}

export interface FabSubLocation {
  city: string;
  /** Geographic center of the city/campus for map marker placement */
  lat: number;
  lon: number;
  fabs: FabInfo[];
}

export interface FabLocation {
  id: string;
  country: string;
  /** SVG equirectangular projection anchor (center of country/region) */
  lat: number;
  lon: number;
  /** Country-level total fab count */
  totalFabs: number;
  /** For countries with multiple cities (i.e. USA) */
  subLocations: FabSubLocation[];
}

export const INTEL_FAB_LOCATIONS: FabLocation[] = [
  {
    id: 'usa',
    country: 'USA',
    lat: 39.8,
    lon: -98.6,
    totalFabs: 6,
    subLocations: [
      {
        city: 'Oregon / Hillsboro',
        lat: 45.52,
        lon: -122.68,
        fabs: [
          {
            id: 'd1x',
            name: 'D1X',
            description: 'Intel 18A research and development fab serving leading-edge process integration and technology pathfinding.',
            node: 'Intel 18A',
            established: '2013',
          },
          {
            id: 'd1d',
            name: 'D1D',
            description: 'Intel 4 production fab supporting advanced client and data center process qualification.',
            node: 'Intel 4',
            established: '2010',
          },
        ],
      },
      {
        city: 'Arizona / Chandler',
        lat: 33.42,
        lon: -111.83,
        fabs: [
          {
            id: 'fab52',
            name: 'Fab 52',
            description: 'New Arizona mega-fab focused on Intel 18A manufacturing for internal products and foundry customers.',
            node: 'Intel 18A',
            established: '2023',
          },
          {
            id: 'fab62',
            name: 'Fab 62',
            description: 'Second Chandler expansion fab aligned with Intel 18A volume capacity growth.',
            node: 'Intel 18A',
            established: '2024',
          },
        ],
      },
      {
        city: 'Ohio / New Albany',
        lat: 40.0,
        lon: -82.9,
        fabs: [
          {
            id: 'ohio-fab2',
            name: 'Fab 2',
            description: 'Planned Ohio logic fab campus module targeting Intel 3 production for future US capacity expansion.',
            node: 'Intel 3',
            established: '2027 (planned)',
          },
        ],
      },
      {
        city: 'New Mexico / Rio Rancho',
        lat: 35.23,
        lon: -106.66,
        fabs: [
          {
            id: 'fab11x',
            name: 'Fab 11X',
            description: 'Mature-node manufacturing and advanced packaging support site for long-lived Intel products.',
            node: 'Intel 22',
            established: '2002',
          },
        ],
      },
    ],
  },
  {
    id: 'ireland',
    country: 'Ireland',
    lat: 53.33,
    lon: -6.73,
    totalFabs: 1,
    subLocations: [
      {
        city: 'Leixlip',
        lat: 53.33,
        lon: -6.73,
        fabs: [
          {
            id: 'fab34',
            name: 'Fab 34',
            description: 'Intel 4 production fab serving European market demand and advanced compute products.',
            node: 'Intel 4',
            established: '2023',
          },
        ],
      },
    ],
  },
  {
    id: 'israel',
    country: 'Israel',
    lat: 31.77,
    lon: 34.93,
    totalFabs: 2,
    subLocations: [
      {
        city: 'Kiryat Gat',
        lat: 31.77,
        lon: 34.93,
        fabs: [
          {
            id: 'fab28',
            name: 'Fab 28',
            description: 'High-volume fab producing Intel 7 class AI and server chips for global markets.',
            node: 'Intel 7',
            established: '2008',
          },
          {
            id: 'fab38',
            name: 'Fab 38',
            description: 'Expanded Kiryat Gat capacity focused on Intel 7 class production and packaging handoff.',
            node: 'Intel 7',
            established: '2020',
          },
        ],
      },
    ],
  },
  {
    id: 'malaysia',
    country: 'Malaysia',
    lat: 5.42,
    lon: 100.33,
    totalFabs: 2,
    subLocations: [
      {
        city: 'Penang',
        lat: 5.42,
        lon: 100.33,
        fabs: [
          {
            id: 'penang-at',
            name: 'Assembly & Test Campus',
            description: 'Back-end manufacturing hub handling assembly, test, and packaging operations across Intel product lines.',
            node: 'Back-end manufacturing',
            established: '1972',
          },
        ],
      },
      {
        city: 'Kulim',
        lat: 5.37,
        lon: 100.56,
        fabs: [
          {
            id: 'fab7',
            name: 'Fab 7',
            description: 'Advanced logic fab under construction to support Intel 3 production and regional resiliency.',
            node: 'Intel 3',
            established: '2027 (planned)',
          },
        ],
      },
    ],
  },
  {
    id: 'germany',
    country: 'Germany',
    lat: 52.13,
    lon: 11.62,
    totalFabs: 2,
    subLocations: [
      {
        city: 'Magdeburg',
        lat: 52.13,
        lon: 11.62,
        fabs: [
          {
            id: 'germany-fab1',
            name: 'Fab 1 Germany',
            description: 'Planned Magdeburg fab targeting Intel 18A production for European foundry and product demand.',
            node: 'Intel 18A',
            established: '2027 (planned)',
          },
          {
            id: 'germany-fab2',
            name: 'Fab 2 Germany',
            description: 'Second planned Magdeburg module designed to scale Intel 18A manufacturing capacity in Europe.',
            node: 'Intel 18A',
            established: '2027 (planned)',
          },
        ],
      },
    ],
  },
];

export const TC_FAB_LOCATIONS = INTEL_FAB_LOCATIONS;
