// TSMC global fab location data — used by Government Regulations world map

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
  /** For countries with multiple cities (i.e. Taiwan) */
  subLocations: FabSubLocation[];
}

export const TC_FAB_LOCATIONS: FabLocation[] = [
  // ── Taiwan ───────────────────────────────────────────────────────────────────
  // One country marker at geographic center; sub-locations list each city
  {
    id: 'taiwan',
    country: 'Taiwan',
    lat: 23.8,
    lon: 121.0,
    totalFabs: 12,
    subLocations: [
      {
        city: 'Hsinchu City',
        lat: 24.8138,
        lon: 120.9675,
        fabs: [
          {
            id: 'fab5',
            name: 'Fab 5',
            description: '6-inch wafer fab. Mature process technologies for analog and specialty products.',
            node: '0.35µm – 0.5µm',
            established: '1993',
          },
          {
            id: 'fab6',
            name: 'Fab 6',
            description: '8-inch wafer fab supporting specialty processes including embedded flash and high-voltage ICs.',
            node: '0.18µm – 0.25µm',
            established: '1996',
          },
          {
            id: 'fab12',
            name: 'Fab 12',
            description: 'First 12-inch wafer fab for advanced logic nodes. Key production site for leading-edge SoC customers.',
            node: '16nm – 130nm',
            established: '2001',
          },
        ],
      },
      {
        city: 'Hsinchu County',
        lat: 24.7007,
        lon: 120.9176,
        fabs: [
          {
            id: 'fab15',
            name: 'Fab 15',
            description: '12-inch FinFET fab in Chu-Nan campus. Mass production of N7/N5 nodes for HPC and mobile SoCs.',
            node: '5nm – 16nm',
            established: '2011',
          },
          {
            id: 'fab15cx',
            name: 'Fab 15 (CX Phases)',
            description: 'Capacity expansion phases of Fab 15, including N5P and N4 production alongside the main building.',
            node: '4nm – 7nm',
            established: '2020',
          },
        ],
      },
      {
        city: 'Taoyuan',
        lat: 24.9936,
        lon: 121.3010,
        fabs: [
          {
            id: 'fab3a',
            name: 'Fab 3A',
            description: '8-inch wafer fab. Specialty processes including CMOS image sensors and power management ICs.',
            node: '0.18µm – 0.35µm',
            established: '2000',
          },
          {
            id: 'fab8',
            name: 'Fab 8',
            description: '8-inch fab focused on advanced logic, embedded non-volatile memory, and BCD processes.',
            node: '0.13µm – 0.18µm',
            established: '2000',
          },
        ],
      },
      {
        city: 'Tainan (STSP)',
        lat: 22.9208,
        lon: 120.2830,
        fabs: [
          {
            id: 'fab14',
            name: 'Fab 14',
            description: 'Large-scale 12-inch fab campus in Southern Taiwan Science Park. Mass production of 7nm and 5nm chips for Apple, AMD, and NVIDIA.',
            node: '5nm – 20nm',
            established: '2004',
          },
          {
            id: 'fab18',
            name: 'Fab 18',
            description: '12-inch fab producing N3 (3nm) generation chips — the world\'s most advanced volume node. Primary production site for Apple A-series and M-series chips.',
            node: '3nm – 5nm',
            established: '2020',
          },
        ],
      },
      {
        city: 'Kaohsiung',
        lat: 22.6273,
        lon: 120.3014,
        fabs: [
          {
            id: 'fab22',
            name: 'Fab 22',
            description: 'Advanced 12-inch wafer fab opened in Nanzih Export Processing Zone in 2024. Produces 28nm specialty and automotive-grade chips, with future advanced-node expansion planned.',
            node: '28nm',
            established: '2024',
          },
        ],
      },
      {
        city: 'Taichung',
        lat: 24.3031,
        lon: 120.8539,
        fabs: [
          {
            id: 'fab15b',
            name: 'Fab 15B',
            description: '12-inch fab expansion in Central Taiwan Science Park producing N5/N7 node chips to supplement Hsinchu Fab 15 capacity.',
            node: '5nm – 7nm',
            established: '2022',
          },
        ],
      },
      {
        city: 'Miaoli',
        lat: 24.5602,
        lon: 120.8214,
        fabs: [
          {
            id: 'fab2',
            name: 'Fab 2',
            description: 'One of TSMC\'s earliest fabs (former headquarters era). Produces mature specialty technologies and is primarily used for R&D and process qualification.',
            node: '1µm – 2µm',
            established: '1988',
          },
        ],
      },
    ],
  },

  // ── USA ──────────────────────────────────────────────────────────────────────
  {
    id: 'usa',
    country: 'USA',
    lat: 33.5,
    lon: -112.0,
    totalFabs: 2,
    subLocations: [
      {
        city: 'Phoenix, Arizona',
        lat: 33.6057,
        lon: -112.2340,
        fabs: [
          {
            id: 'fab21-p1',
            name: 'Fab 21 Phase 1',
            description: 'TSMC\'s first US fab (TSMC Arizona) in North Phoenix. Opened 2024. Produces N4 (4nm) chips primarily for Apple and AMD with $6.6B CHIPS Act support.',
            node: '4nm',
            established: '2024',
          },
          {
            id: 'fab21-p2',
            name: 'Fab 21 Phase 2',
            description: 'Second phase targeting N3 and N2 (2nm) advanced nodes. Expected to produce chips for Apple and other leading-edge customers from 2026–2028.',
            node: '2nm – 3nm',
            established: '2026 (planned)',
          },
        ],
      },
    ],
  },

  // ── Japan ─────────────────────────────────────────────────────────────────────
  {
    id: 'japan',
    country: 'Japan',
    lat: 32.8,
    lon: 130.8,
    totalFabs: 2,
    subLocations: [
      {
        city: 'Kumamoto',
        lat: 32.7899,
        lon: 130.7417,
        fabs: [
          {
            id: 'jasm1',
            name: 'JASM Fab 1 (Fab 23)',
            description: 'Japan Advanced Semiconductor Manufacturing joint venture (TSMC 86.5%, Sony 9.5%, Denso 4%) in Kikuyo, Kumamoto. Opened Feb 2024. Produces automotive, IoT, and consumer chips.',
            node: '12nm – 40nm',
            established: '2024',
          },
          {
            id: 'jasm2',
            name: 'JASM Fab 2 (Fab 24)',
            description: 'Second Kumamoto fab under construction with Toyota as additional investor. Will produce N6/N7 logic nodes for automotive-grade and HPC applications.',
            node: '6nm – 7nm',
            established: '2027 (planned)',
          },
        ],
      },
    ],
  },

  // ── Germany ───────────────────────────────────────────────────────────────────
  {
    id: 'germany',
    country: 'Germany',
    lat: 51.1,
    lon: 13.8,
    totalFabs: 1,
    subLocations: [
      {
        city: 'Dresden, Saxony',
        lat: 51.0504,
        lon: 13.7373,
        fabs: [
          {
            id: 'esmc1',
            name: 'ESMC Fab (Fab 25 — planned)',
            description: 'European Semiconductor Manufacturing Company joint venture (TSMC 70%, Bosch 10%, Infineon 10%, NXP 10%) in Dresden. Targets automotive and industrial specialty chips supported by EU Chips Act funding.',
            node: '12nm – 28nm',
            established: '2027 (planned)',
          },
        ],
      },
    ],
  },

  // ── China ─────────────────────────────────────────────────────────────────────
  {
    id: 'china',
    country: 'China',
    lat: 32.1,
    lon: 118.8,
    totalFabs: 1,
    subLocations: [
      {
        city: 'Nanjing, Jiangsu',
        lat: 32.0603,
        lon: 118.7969,
        fabs: [
          {
            id: 'fab16',
            name: 'Fab 16',
            description: 'TSMC\'s China 12-inch wafer fab in Nanjing. Produces N16 (16nm) chips and is expanding 28nm specialty capacity. Subject to US export control restrictions on advanced nodes.',
            node: '16nm – 28nm',
            established: '2018',
          },
        ],
      },
    ],
  },
];
