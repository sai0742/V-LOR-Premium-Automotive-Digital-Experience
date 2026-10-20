export const assemblies = [
  {
    id: "coachwork",
    number: "01",
    short: "Coachwork",
    title: "Aero Coachwork Shell",
    material: "Hand-formed aluminium",
    spec: "1.2 mm skin / continuous shoulder line",
    note: "The line that holds it all together. A long, low aluminium envelope, shaped around the air rather than against it. Every curve begins at the tip of a pencil.",
    detail: "Rolled edges · fastback profile · recessed lamps",
    code: "BDY—001",
    side: "left",
    anchor: [590, 100],
    offset: [-12, -150, 125],
  },
  {
    id: "chassis",
    number: "02",
    short: "Spaceframe",
    title: "Tubular Spaceframe Chassis",
    material: "Triangulated steel tubing",
    spec: "Ø 32 mm tubes / hand-brazed junctions",
    note: "A quiet architecture beneath the surface. Triangulated steel members trace the shortest path between loads, giving the silhouette its strength without unnecessary weight.",
    detail: "Cross-braced sills · central tunnel · four-point cradles",
    code: "FRM—002",
    side: "right",
    anchor: [669, 280],
    offset: [5, 84, -60],
  },
  {
    id: "powertrain",
    number: "03",
    short: "V12 engine",
    title: "Naturally Aspirated V12 Powertrain",
    material: "Alloy block · polished intake trumpets",
    spec: "60° V12 / six twin-choke carburettors",
    note: "Twelve cylinders, one unbroken conversation. An imagined naturally aspirated heart with a long mechanical cadence, individual intake trumpets and no filter between driver and machine.",
    detail: "Twin overhead cams · finned covers · manual transmission",
    code: "PWR—003",
    side: "left",
    anchor: [364, 274],
    offset: [-24, 6, 20],
  },
  {
    id: "suspension",
    number: "04",
    short: "Running gear",
    title: "Double-Wishbone Suspension & Wire Wheels",
    material: "Forged wishbones · laced steel spokes",
    spec: "Independent geometry / 72-spoke wheels",
    note: "Poise is a thousand small decisions. Paired wishbones guide each wheel through its arc, while fine wire spokes turn the necessary into something worth looking at.",
    detail: "Coil-over dampers · centre-lock hubs · ventilated discs",
    code: "SUS—004",
    side: "left",
    anchor: [268, 330],
    offset: [10, 158, -125],
  },
  {
    id: "cockpit",
    number: "05",
    short: "Cockpit",
    title: "Hand-Stitched Cockpit & Wood Rim Steering",
    material: "Cognac hide · open-grain walnut",
    spec: "Saddle-stitched seams / analogue instruments",
    note: "The part you become a part of. Hand-stitched leather, warm walnut and a slender wood-rim wheel. A small world designed around the simple pleasure of being present.",
    detail: "Sculpted touring seats · turned dials · three-spoke wheel",
    code: "INT—005",
    side: "right",
    anchor: [598, 230],
    offset: [20, -70, 65],
  },
] as const;

export type AssemblyId = (typeof assemblies)[number]["id"];

/** Normalized start/end ranges for the native-scroll disassembly sequence. */
export const separationWindows = {
  coachwork: [0.05, 0.5],
  cockpit: [0.13, 0.56],
  powertrain: [0.24, 0.68],
  chassis: [0.36, 0.82],
  suspension: [0.46, 0.96],
} satisfies Record<AssemblyId, readonly [number, number]>;

export const scrollChapters = [
  {
    title: "A single, considered whole.",
    caption: "The silhouette is only the beginning.",
  },
  {
    title: "Beneath the beautiful.",
    caption: "Follow the first line. Let the layers breathe.",
  },
  {
    title: "An architecture of feeling.",
    caption: "Five assemblies. A thousand small decisions.",
  },
  {
    title: "Nothing without purpose.",
    caption: "An honest machine, open to interpretation.",
  },
  {
    title: "Every part. Part of the whole.",
    caption: "Select a numbered annotation to look a little closer.",
  },
] as const;
