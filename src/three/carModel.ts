import * as THREE from "three";
import { PartBuilder, circlePoints, roundedRectPoints } from "./draft";
import type { Highlight } from "./draft";
import type { AssemblyId } from "../components/anatomy/assemblies";

/**
 * A procedural Auren GT, drawn for the exploded atelier.
 *
 * The coachwork is a lofted section surface (the same trick a coachbuilder uses
 * on a buck), the spaceframe is a hand-placed tube matrix, and every other
 * assembly is assembled from primitives so the whole machine exists as vector
 * geometry rather than a scanned mesh. Units are metres.
 */

const NOSE_X = -2.25;
const LENGTH = 4.5;
const WHEEL_BASE = 2.76;
const FRONT_AXLE_X = -WHEEL_BASE / 2;
const REAR_AXLE_X = WHEEL_BASE / 2;
const TRACK = 0.8;
const WHEEL_RADIUS = 0.358;
const BODY_CENTRE_Y = 0.66;

/** Control stations, front (0) to rear (1), Catmull-Rom interpolated. */
const PROFILE = {
  width: [
    0.5, 0.66, 0.82, 0.9, 0.94, 0.955, 0.955, 0.95, 0.945, 0.94, 0.93, 0.9,
    0.86, 0.78, 0.72,
  ],
  floor: [
    0.34, 0.32, 0.3, 0.29, 0.285, 0.285, 0.29, 0.295, 0.3, 0.31, 0.32, 0.34,
    0.37, 0.41, 0.46,
  ],
  belt: [
    0.72, 0.79, 0.83, 0.85, 0.86, 0.87, 0.88, 0.88, 0.888, 0.892, 0.888, 0.878,
    0.86, 0.8, 0.74,
  ],
  roof: [
    0.76, 0.81, 0.845, 0.862, 0.872, 0.882, 0.895, 1.2, 1.32, 1.35, 1.348,
    1.325, 1.23, 1.0, 0.85,
  ],
  tumble: [
    0.86, 0.87, 0.88, 0.88, 0.88, 0.878, 0.872, 0.83, 0.79, 0.775, 0.775, 0.79,
    0.83, 0.87, 0.89,
  ],
  crown: [
    0.6, 0.7, 0.75, 0.775, 0.78, 0.775, 0.76, 0.7, 0.63, 0.6, 0.6, 0.63, 0.68,
    0.72, 0.74,
  ],
};

const catmull = (values: readonly number[], u: number) => {
  const max = values.length - 1;
  const scaled = Math.max(0, Math.min(1, u)) * max;
  const index = Math.min(max - 1, Math.floor(scaled));
  const t = scaled - index;
  const p0 = values[Math.max(0, index - 1)];
  const p1 = values[index];
  const p2 = values[index + 1];
  const p3 = values[Math.min(max, index + 2)];
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t)
  );
};

/**
 * A true circular wheel opening: the flank is cut on a radius around each hub,
 * so the tyre sits inside a fender rather than behind a skirt.
 */
const ARCH_RADIUS = 0.462;
function archCut(x: number) {
  let cut = 0;
  for (const centre of [FRONT_AXLE_X, REAR_AXLE_X]) {
    const dx = Math.abs(x - centre);
    if (dx < ARCH_RADIUS)
      cut = Math.max(cut, Math.sqrt(ARCH_RADIUS * ARCH_RADIUS - dx * dx));
  }
  return cut;
}

type Section = {
  x: number;
  width: number;
  belt: number;
  roof: number;
  low: number;
  points: THREE.Vector3[];
};

function sectionAt(u: number): Section {
  const x = NOSE_X + u * LENGTH;
  const baseWidth = catmull(PROFILE.width, u);
  const floor = catmull(PROFILE.floor, u);
  const belt = catmull(PROFILE.belt, u);
  const roof = catmull(PROFILE.roof, u);
  const tumble = catmull(PROFILE.tumble, u);
  const crown = catmull(PROFILE.crown, u);
  const archTop = WHEEL_RADIUS + archCut(x);
  const width = baseWidth + (archTop > floor + 0.05 ? 0.025 : 0);
  const low = Math.max(floor + 0.02, Math.min(belt - 0.05, archTop));
  const bulge = Math.max(0, Math.min(1, (low - floor - 0.02) / 0.4));
  const shoulderY = low + (belt - low) * 0.52;
  const glassY = belt + (roof - belt) * 0.5;
  const roofY = roof - (roof - belt) * 0.035;
  const railZ = width * crown;
  const glassZ = width * tumble;
  const roofZ = railZ * 0.52;
  const floorZ = width * 0.56;

  // Over each arch the flank tucks in beneath the lip and the floor lifts to
  // meet it, so the wheel sits in a genuine opening instead of behind a skirt.
  const tuck = 1 - bulge * 0.46;
  const archFloor = floor + (low - floor - 0.02) * bulge;
  const archFloorZ = floorZ * (1 - bulge * 0.86);
  const points = [
    new THREE.Vector3(x, archFloor, 0),
    new THREE.Vector3(x, archFloor + 0.015, archFloorZ),
    new THREE.Vector3(x, low, width * tuck),
    new THREE.Vector3(x, shoulderY, width * (1 - bulge * 0.2)),
    new THREE.Vector3(x, belt, width * 0.985),
    new THREE.Vector3(x, glassY, glassZ),
    new THREE.Vector3(x, roofY, railZ),
    new THREE.Vector3(x, roof, roofZ),
    new THREE.Vector3(x, roof + 0.002, 0),
    new THREE.Vector3(x, roof, -roofZ),
    new THREE.Vector3(x, roofY, -railZ),
    new THREE.Vector3(x, glassY, -glassZ),
    new THREE.Vector3(x, belt, -width * 0.985),
    new THREE.Vector3(x, shoulderY, -width * (1 - bulge * 0.2)),
    new THREE.Vector3(x, low, -width * tuck),
    new THREE.Vector3(x, archFloor + 0.015, -archFloorZ),
  ];
  return { x, width, belt, roof, low, points };
}

const STATIONS = 64;
const sections: Section[] = Array.from({ length: STATIONS + 1 }, (_, index) =>
  sectionAt(index / STATIONS),
);

const at = (station: number, point: number) =>
  sections[station].points[point].clone();

/** Slightly proud of the painted surface so the ink is never z-fought. */
const inked = (point: THREE.Vector3) =>
  point
    .clone()
    .sub(new THREE.Vector3(point.x, BODY_CENTRE_Y, 0))
    .multiplyScalar(1.004)
    .add(new THREE.Vector3(point.x, BODY_CENTRE_Y, 0));

function stationFor(x: number) {
  return Math.round(Math.max(0, Math.min(1, (x - NOSE_X) / LENGTH)) * STATIONS);
}

function curve(
  point: number,
  fromX: number,
  toX: number,
  step = 0.06,
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const start = stationFor(fromX);
  const end = stationFor(toX);
  const stride = Math.max(1, Math.round(step / (LENGTH / STATIONS)));
  for (let station = start; station <= end; station += stride)
    points.push(inked(at(station, point)));
  if (points[points.length - 1].x !== sections[end].x)
    points.push(inked(at(end, point)));
  return points;
}

function crossTop(
  fromX: number,
  fromPoint: number,
  toPoint: number,
): THREE.Vector3[] {
  const station = stationFor(fromX);
  const points: THREE.Vector3[] = [];
  for (let index = fromPoint; index <= toPoint; index += 1)
    points.push(inked(at(station, index)));
  return points;
}

/**
 * A glazed strip laid onto the loft: the same section points pushed a hair
 * outside the skin so the tint reads as glass rather than a decal.
 */
function addGlass(
  builder: PartBuilder,
  fromU: number,
  toU: number,
  faces: readonly [number, number][],
  sides: readonly number[],
) {
  const first = Math.round(fromU * STATIONS);
  const last = Math.round(toU * STATIONS);
  faces.forEach(([a, b]) => {
    sides.forEach((side) => {
      const p0 = side > 0 ? a : 16 - a;
      const p1 = side > 0 ? b : 16 - b;
      const positions: number[] = [];
      const push = (station: number, point: number) => {
        const v = inked(at(station, point));
        positions.push(v.x, v.y, v.z);
      };
      for (let station = first; station < last; station += 1) {
        push(station, p0);
        push(station, p1);
        push(station + 1, p0);
        push(station + 1, p0);
        push(station, p1);
        push(station + 1, p1);
      }
      builder.addSurface(positions, "glass");
    });
  });
}

/** The lip of each wheel opening, drawn on the flank rather than the shell. */
function addArchLip(builder: PartBuilder) {
  for (const axle of [FRONT_AXLE_X, REAR_AXLE_X]) {
    for (const side of [1, -1]) {
      const lip: THREE.Vector3[] = [];
      for (let i = 0; i <= 26; i += 1) {
        const angle = Math.PI * (i / 26);
        const x = axle + Math.cos(angle) * 0.5;
        const station = stationFor(x);
        const flank = inked(at(station, side > 0 ? 2 : 14));
        lip.push(
          new THREE.Vector3(x, 0.335 + Math.sin(angle) * 0.46, flank.z * 1.002),
        );
      }
      builder.addLine(lip, "ink");
      builder.addLine(
        lip.map((point) => point.clone().setY(point.y - 0.022)),
        "fine",
      );
    }
  }
}

function buildCoachwork(builder: PartBuilder) {
  const vertices: number[] = [];
  sections.forEach((section) => {
    section.points.forEach((point) => {
      vertices.push(point.x, point.y, point.z);
    });
  });
  const indices: number[] = [];
  const ring = 16;
  for (let station = 0; station < STATIONS; station += 1) {
    for (let point = 0; point < ring; point += 1) {
      const next = (point + 1) % ring;
      const a = station * ring + point;
      const b = station * ring + next;
      const c = (station + 1) * ring + point;
      const d = (station + 1) * ring + next;
      indices.push(a, c, b, b, c, d);
    }
  }
  // Cap nose and tail with a fan, keeping the body watertight.
  const capNose = sections[0].points
    .reduce((sum, point) => sum.add(point), new THREE.Vector3())
    .multiplyScalar(1 / ring);
  const capTail = sections[STATIONS].points
    .reduce((sum, point) => sum.add(point), new THREE.Vector3())
    .multiplyScalar(1 / ring);
  const noseIndex = vertices.length / 3;
  vertices.push(capNose.x, capNose.y, capNose.z);
  const tailIndex = noseIndex + 1;
  vertices.push(capTail.x, capTail.y, capTail.z);
  for (let point = 0; point < ring; point += 1) {
    const next = (point + 1) % ring;
    indices.push(noseIndex, point, next);
    indices.push(tailIndex, STATIONS * ring + next, STATIONS * ring + point);
  }
  const shell = new THREE.BufferGeometry();
  shell.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  shell.setIndex(indices);
  shell.computeVertexNormals();
  builder.addSolid(shell, { tone: "paper", edges: null });

  // Section rings: quiet station lines that describe the volume.
  for (let station = 0; station <= STATIONS; station += 8) {
    const points = sections[station].points.map(inked);
    builder.addLine([...points, points[0]], "fine");
  }
  // Longitudinal seams, mirrored. The lower edge traces the rocker and arches.
  const seams: [number, "ink" | "fine"][] = [
    [1, "fine"],
    [2, "ink"],
    [3, "ink"],
    [4, "ink"],
    [5, "fine"],
    [6, "fine"],
  ];
  for (const [point, kind] of seams) {
    builder.addLine(curve(point, NOSE_X, NOSE_X + LENGTH, 0.04), kind);
    builder.addLine(curve(16 - point, NOSE_X, NOSE_X + LENGTH, 0.04), kind);
  }
  // Arch ticks: short radial marks that describe the wheel opening.
  for (const axle of [FRONT_AXLE_X, REAR_AXLE_X]) {
    for (let i = -4; i <= 4; i += 1) {
      const x = axle + i * 0.1;
      const station = stationFor(x);
      for (const side of [1, -1]) {
        const outer = inked(at(station, side > 0 ? 2 : 14));
        builder.addLine(
          [
            outer,
            outer
              .clone()
              .add(new THREE.Vector3(0, 0.03 + Math.abs(i) * 0.004, 0)),
          ],
          "rust",
        );
      }
    }
  }
  builder.addLine(curve(8, NOSE_X, -0.35), "ink");
  builder.addLine(curve(8, NOSE_X + LENGTH - 0.55, NOSE_X + LENGTH), "ink");
  builder.addLine(curve(8, 0.2, 0.9), "fine");

  // Nose and tail rims.
  builder.addLine(sections[0].points.map(inked), "ink", true);
  builder.addLine(sections[STATIONS].points.map(inked), "ink", true);

  // Glazing: base line, header and three pillars per side.
  builder.addLine(crossTop(-0.18, 5, 11), "ink");
  builder.addLine(crossTop(0.3, 5, 11), "ink");
  builder.addLine(crossTop(1.72, 5, 11), "ink");
  builder.addLine(crossTop(0.82, 5, 11), "fine");
  for (const [lowerX, upperX] of [
    [-0.19, 0.3],
    [0.33, 0.33],
    [1.7, 0.85],
  ] as const) {
    for (const side of [1, -1]) {
      const lower = inked(at(stationFor(lowerX), side > 0 ? 4 : 12));
      const upper = inked(at(stationFor(upperX), side > 0 ? 6 : 10));
      builder.addLine([lower, upper], "ink");
    }
  }

  // Roof rails and the side glass outline.
  for (const side of [1, -1]) {
    const rail: THREE.Vector3[] = [];
    for (
      let station = stationFor(0.3);
      station <= stationFor(1.72);
      station += 2
    )
      rail.push(inked(at(station, side > 0 ? 6 : 10)));
    builder.addLine(rail, "ink");
  }

  // Door cut-lines and handles.
  for (const side of [1, -1]) {
    for (const x of [-0.62, 0.62]) {
      const station = stationFor(x);
      const seamPoints: THREE.Vector3[] = [];
      for (let point = 2; point <= 6; point += 1) {
        seamPoints.push(inked(at(station, side > 0 ? point : 16 - point)));
      }
      builder.addLine(seamPoints, "fine");
    }
    const handle = stationFor(0.4);
    builder.addLine(
      [
        inked(at(handle, side > 0 ? 4 : 12)),
        inked(at(handle + 2, side > 0 ? 4 : 12)),
      ],
      "ink",
    );
    for (const x of [-1.02, -0.86, -0.7]) {
      builder.addLine(
        [
          inked(at(stationFor(x), side > 0 ? 3 : 13)),
          inked(at(stationFor(x + 0.06), side > 0 ? 3 : 13)),
        ],
        "rust",
      );
    }
  }

  // Door mirrors, a small signature on the shoulder line.
  for (const side of [1, -1]) {
    const mirrorCentre = new THREE.Vector3(-0.2, 0.93, side * 0.94);
    builder.addLine(
      [
        new THREE.Vector3(-0.05, 0.875, side * 0.9),
        new THREE.Vector3(-0.2, 0.93, side * 0.92),
      ],
      "ink",
    );
    builder.addLine(circlePoints(mirrorCentre, 0.052, "x", 24), "ink", true);
  }

  // Inner arch liners: paper panels that close off the far side of each wheel,
  // drawn as half discs around the hub so nothing escapes the wheel opening.
  for (const axle of [FRONT_AXLE_X, REAR_AXLE_X]) {
    for (const side of [1, -1]) {
      const centre = new THREE.Vector3(axle, WHEEL_RADIUS, side * 0.7);
      const rim: THREE.Vector3[] = [];
      for (let i = 0; i <= 24; i += 1) {
        const angle = (i / 24) * Math.PI;
        rim.push(
          new THREE.Vector3(
            axle + Math.cos(angle) * (ARCH_RADIUS - 0.015),
            WHEEL_RADIUS + Math.sin(angle) * (ARCH_RADIUS - 0.015) - 0.03,
            side * 0.7,
          ),
        );
      }
      const positions: number[] = [];
      for (let i = 0; i < rim.length - 1; i += 1) {
        const a = rim[i];
        const b = rim[i + 1];
        positions.push(
          centre.x,
          centre.y,
          centre.z,
          a.x,
          a.y,
          a.z,
          b.x,
          b.y,
          b.z,
        );
      }
      builder.addSurface(positions, "deep");
      builder.addLine(rim.slice(0, 2), "fine");
    }
  }

  addGlass(
    builder,
    0.44,
    0.5,
    [
      [6, 7],
      [7, 8],
      [8, 9],
      [9, 10],
    ],
    [1, -1],
  );
  addGlass(
    builder,
    0.53,
    0.605,
    [
      [4, 5],
      [5, 6],
    ],
    [1, -1],
  );
  addGlass(
    builder,
    0.63,
    0.8,
    [
      [4, 5],
      [5, 6],
    ],
    [1, -1],
  );
  addGlass(
    builder,
    0.84,
    0.925,
    [
      [6, 7],
      [7, 8],
      [8, 9],
      [9, 10],
    ],
    [1, -1],
  );
  // B-pillar and the hatch shut line at the base of the rear screen.
  for (const side of [1, -1]) {
    builder.addLine(
      [
        inked(at(stationFor(0.8), side > 0 ? 4 : 12)),
        inked(at(stationFor(0.61), side > 0 ? 6 : 10)),
      ],
      "ink",
    );
    builder.addLine(
      [
        inked(at(stationFor(0.615), side > 0 ? 4 : 12)),
        inked(at(stationFor(0.5), side > 0 ? 6 : 10)),
      ],
      "ink",
    );
  }
  builder.addLine(crossTop(0.83, 6, 10), "ink");
  addArchLip(builder);

  // Vent slats on the rear haunch.
  for (const side of [1, -1]) {
    for (let i = 0; i < 4; i += 1) {
      const x = 1.02 + i * 0.1;
      const station = stationFor(x);
      const face = at(station, side > 0 ? 4 : 12);
      builder.addLine(
        [
          new THREE.Vector3(x, face.y - 0.05, side * (face.z + 0.004)),
          new THREE.Vector3(x - 0.045, face.y - 0.115, side * (face.z + 0.004)),
        ],
        "rust",
      );
    }
  }

  // Bonnet crease pair: two quiet lines that ride the crown of the wing.
  for (const side of [1, -1]) {
    const crease: THREE.Vector3[] = [];
    for (let i = 0; i <= 40; i += 1) {
      const x = NOSE_X + 0.1 + (i / 40) * 1.9;
      const station = stationFor(x);
      const crownA = at(station, 7);
      const crownB = at(station, side > 0 ? 6 : 8);
      crease.push(inked(crownA.clone().lerp(crownB, 0.42)));
    }
    builder.addLine(crease, "fine");
  }

  // Hood and deck shut lines.
  builder.addLine(curve(6, NOSE_X + 0.12, -0.24), "fine");
  builder.addLine(crossTop(-0.215, 6, 10), "ink");
  builder.addLine(curve(6, 1.78, NOSE_X + LENGTH - 0.08), "fine");
  builder.addLine(crossTop(1.78, 6, 10), "fine");
  for (const side of [1, -1]) {
    builder.addLine(
      [
        inked(at(stationFor(1.78), side > 0 ? 7 : 9)),
        inked(at(stationFor(2.1), side > 0 ? 6 : 10)),
      ],
      "fine",
    );
  }

  // Front face: grille, lamps, bumper.
  const face = NOSE_X - 0.014;
  const grille = roundedRectPoints(
    new THREE.Vector3(face, 0.565, 0),
    0.72,
    0.16,
    0.055,
    "x",
  );
  builder.addLine(grille, "ink", true);
  for (let i = 0; i < 9; i += 1) {
    const z = -0.29 + i * 0.0725;
    builder.addLine(
      [
        new THREE.Vector3(face - 0.002, 0.505, z),
        new THREE.Vector3(face - 0.002, 0.625, z),
      ],
      "fine",
    );
  }
  for (const side of [1, -1]) {
    const centre = new THREE.Vector3(face, 0.675, side * 0.355);
    builder.addLine(circlePoints(centre, 0.082, "x", 36), "ink", true);
    builder.addLine(circlePoints(centre, 0.054, "x", 28), "rust", true);
    builder.addLine(
      [
        new THREE.Vector3(face, 0.68, side * 0.52),
        new THREE.Vector3(face, 0.735, side * 0.16),
      ],
      "fine",
    );
  }
  for (const y of [0.445, 0.477]) {
    builder.addLine(
      [
        new THREE.Vector3(face - 0.004, y, -0.47),
        new THREE.Vector3(face - 0.004, y, 0.47),
      ],
      "ink",
    );
  }
  for (const z of [-0.45, -0.31, 0.31, 0.45]) {
    builder.addLine(
      [
        new THREE.Vector3(face - 0.004, 0.435, z),
        new THREE.Vector3(face - 0.004, 0.49, z),
      ],
      "fine",
    );
  }

  // Tail face: lamps, bumper, exhaust.
  const tail = NOSE_X + LENGTH + 0.012;
  for (const side of [1, -1]) {
    builder.addLine(
      roundedRectPoints(
        new THREE.Vector3(tail, 0.7, side * 0.34),
        0.3,
        0.1,
        0.025,
        "x",
      ).map((point) => point.clone().setX(tail)),
      "ink",
      true,
    );
    builder.addLine(
      [
        new THREE.Vector3(tail, 0.69, side * 0.35),
        new THREE.Vector3(tail, 0.69, side * 0.46),
      ],
      "rust",
    );
  }
  for (const y of [0.545, 0.58]) {
    builder.addLine(
      [new THREE.Vector3(tail, y, -0.52), new THREE.Vector3(tail, y, 0.52)],
      "ink",
    );
  }
  for (const side of [1, -1]) {
    builder.addLine(
      circlePoints(new THREE.Vector3(tail, 0.48, side * 0.24), 0.045, "x", 24),
      "ink",
      true,
    );
  }
  builder.addLine(
    [new THREE.Vector3(tail, 0.63, -0.42), new THREE.Vector3(tail, 0.63, 0.42)],
    "fine",
  );

  // A single hand-written note, anchored to the flank in 3D.
  builder.addLine(
    [new THREE.Vector3(-0.6, 0.755, 0), new THREE.Vector3(-0.6, 0.755, 0)],
    "rust",
  );

  builder.finish();
  return builder;
}

function buildChassis(builder: PartBuilder) {
  const y = 0.335;
  const z = 0.55;
  const railFrom = new THREE.Vector3(-1.95, y, z);
  const railTo = new THREE.Vector3(1.92, y, z);
  const tubes: [THREE.Vector3, THREE.Vector3][] = [];

  for (const side of [1, -1]) {
    tubes.push([
      new THREE.Vector3(railFrom.x, y, side * z),
      new THREE.Vector3(railTo.x, y, side * z),
    ]);
    // Upper door-sill rail gives the frame depth.
    tubes.push([
      new THREE.Vector3(-1.55, 0.47, side * z),
      new THREE.Vector3(1.55, 0.47, side * z),
    ]);
    for (const x of [-1.75, -1.2, -0.45, 0.35, 1.15, 1.85]) {
      tubes.push([
        new THREE.Vector3(x, y, side * z),
        new THREE.Vector3(x, 0.47, side * z),
      ]);
    }
  }
  for (const x of [-1.95, -1.2, -0.45, 0.35, 1.15, 1.92]) {
    tubes.push([new THREE.Vector3(x, y, -z), new THREE.Vector3(x, y, z)]);
  }
  // Floor triangulation either side of the central tunnel.
  for (const side of [1, -1]) {
    const floorZ = side * 0.34;
    const nodes = [-1.95, -1.2, -0.45, 0.35, 1.15, 1.92];
    for (let i = 0; i < nodes.length - 1; i += 1) {
      const a = nodes[i];
      const b = nodes[i + 1];
      tubes.push([
        new THREE.Vector3(a, y, side * z),
        new THREE.Vector3(b, y, floorZ),
      ]);
      tubes.push([
        new THREE.Vector3(a, y, floorZ),
        new THREE.Vector3(b, y, side * z),
      ]);
    }
  }
  // Central tunnel and its cross braces.
  for (const side of [1, -1]) {
    tubes.push([
      new THREE.Vector3(-1.45, 0.44, side * 0.2),
      new THREE.Vector3(1.55, 0.44, side * 0.2),
    ]);
  }
  for (const x of [-1.2, -0.5, 0.25, 1.0, 1.5]) {
    tubes.push([
      new THREE.Vector3(x, 0.44, -0.2),
      new THREE.Vector3(x, 0.44, 0.2),
    ]);
  }
  // Front and rear cradles with damper towers.
  for (const [axle, sign] of [
    [FRONT_AXLE_X, 1],
    [REAR_AXLE_X, -1],
  ] as const) {
    for (const side of [1, -1]) {
      tubes.push([
        new THREE.Vector3(axle + sign * 0.22, y, side * z),
        new THREE.Vector3(axle, 0.5, side * 0.72),
      ]);
      tubes.push([
        new THREE.Vector3(axle - sign * 0.34, y, side * z),
        new THREE.Vector3(axle, 0.5, side * 0.72),
      ]);
      tubes.push([
        new THREE.Vector3(axle, 0.5, side * 0.72),
        new THREE.Vector3(axle - sign * 0.05, 0.82, side * 0.46),
      ]);
      tubes.push([
        new THREE.Vector3(axle - sign * 0.3, y, side * 0.28),
        new THREE.Vector3(axle - sign * 0.05, 0.82, side * 0.46),
      ]);
      tubes.push([
        new THREE.Vector3(axle - sign * 0.05, 0.82, side * 0.46),
        new THREE.Vector3(axle - sign * 0.28, 0.82, side * 0.46),
      ]);
      // A wishbone suggestion for the running gear.
      tubes.push([
        new THREE.Vector3(axle, 0.42, side * 0.74),
        new THREE.Vector3(axle + sign * 0.3, 0.36, side * 0.4),
      ]);
      tubes.push([
        new THREE.Vector3(axle, 0.42, side * 0.74),
        new THREE.Vector3(axle - sign * 0.28, 0.36, side * 0.4),
      ]);
      tubes.push([
        new THREE.Vector3(axle, 0.42, side * 0.74),
        new THREE.Vector3(axle, 0.34, side * 0.74),
      ]);
    }
    tubes.push([
      new THREE.Vector3(axle - sign * 0.34, y, -z),
      new THREE.Vector3(axle + sign * 0.34, y, z),
    ]);
    tubes.push([
      new THREE.Vector3(axle - sign * 0.34, y, z),
      new THREE.Vector3(axle + sign * 0.34, y, -z),
    ]);
  }

  tubes.forEach(([from, to]) =>
    builder.addTube(from, to, 0.017, {
      tone: "shade",
      edges: "fine",
      threshold: 42,
      segments: 10,
    }),
  );

  // Joints.
  const joints = new Map<string, THREE.Vector3>();
  tubes.forEach(([from, to]) => {
    for (const point of [from, to]) {
      const key = `${point.x.toFixed(2)}:${point.y.toFixed(2)}:${point.z.toFixed(2)}`;
      joints.set(key, point);
    }
  });
  joints.forEach((point) => {
    builder.addLine(circlePoints(point, 0.03, "y", 14), "rust", true);
  });

  // Floor pan hatching under the seats.
  for (let i = 0; i < 9; i += 1) {
    const x = -0.35 + i * 0.16;
    builder.addLine(
      [new THREE.Vector3(x, 0.3, -0.52), new THREE.Vector3(x, 0.3, 0.52)],
      "fine",
    );
  }
  builder.addLine(
    [
      new THREE.Vector3(-0.5, 0.3, -0.55),
      new THREE.Vector3(0.95, 0.3, -0.55),
      new THREE.Vector3(0.95, 0.3, 0.55),
      new THREE.Vector3(-0.5, 0.3, 0.55),
    ],
    "fine",
    true,
  );
  // Prop shaft.
  builder.addTube(
    new THREE.Vector3(-0.2, 0.4, 0),
    new THREE.Vector3(1.4, 0.4, 0),
    0.024,
    { tone: "paper", edges: "ink", threshold: 42, segments: 10 },
  );
  builder.finish();
  return builder;
}

function buildPowertrain(builder: PartBuilder) {
  const cx = -1.02;
  builder.addBox([0.78, 0.26, 0.3], [cx, 0.5, 0], {
    tone: "shade",
    edges: "ink",
  });
  builder.addBox([0.6, 0.12, 0.24], [cx, 0.35, 0], {
    tone: "paper",
    edges: "ink",
  });
  builder.addBox([0.24, 0.2, 0.28], [cx + 0.5, 0.46, 0], {
    tone: "paper",
    edges: "ink",
  });

  for (const side of [1, -1]) {
    const tilt = side * 0.5;
    builder.addBox([0.8, 0.15, 0.18], [cx, 0.655, side * 0.1], {
      tone: "paper",
      edges: "ink",
      rotation: [tilt, 0, 0],
    });
    builder.addBox([0.78, 0.045, 0.16], [cx, 0.735, side * 0.15], {
      tone: "shade",
      edges: "ink",
      rotation: [tilt, 0, 0],
    });
    for (let i = 0; i < 6; i += 1) {
      const x = cx - 0.32 + i * 0.128;
      const y = 0.795;
      const z = side * 0.2;
      builder.addCylinder(0.026, 0.034, 0.09, [x, y, z], {
        tone: "paper",
        edges: "ink",
        segments: 12,
      });
      builder.addLine(
        circlePoints(new THREE.Vector3(x, y + 0.048, z), 0.031, "y", 16),
        "rust",
        true,
      );
      builder.addLine(
        [
          new THREE.Vector3(x, 0.762, z),
          new THREE.Vector3(x, 0.665, side * 0.14),
        ],
        "fine",
      );
    }
    // Exhaust primaries falling away from the block.
    for (let i = 0; i < 3; i += 1) {
      const x = cx - 0.26 + i * 0.26;
      builder.addLine(
        [
          new THREE.Vector3(x, 0.5, side * 0.17),
          new THREE.Vector3(x - 0.06, 0.44, side * 0.26),
          new THREE.Vector3(x - 0.16, 0.4, side * 0.38),
          new THREE.Vector3(x - 0.4, 0.4, side * 0.38),
        ],
        "rust",
      );
    }
  }
  // Front cover, pulleys and belts.
  builder.addBox([0.04, 0.24, 0.26], [cx - 0.41, 0.5, 0], {
    tone: "paper",
    edges: "ink",
  });
  builder.addLine(
    circlePoints(new THREE.Vector3(cx - 0.44, 0.5, 0), 0.062, "x", 24),
    "ink",
    true,
  );
  builder.addLine(
    circlePoints(new THREE.Vector3(cx - 0.44, 0.58, 0.1), 0.036, "x", 20),
    "ink",
    true,
  );
  builder.addLine(
    [
      new THREE.Vector3(cx - 0.44, 0.44, 0),
      new THREE.Vector3(cx - 0.44, 0.6, 0),
      new THREE.Vector3(cx - 0.44, 0.6, 0.14),
    ],
    "fine",
  );
  builder.finish();
  return builder;
}

function buildCockpit(builder: PartBuilder) {
  builder.addBox([1.55, 0.045, 1.22], [0.45, 0.38, 0], {
    tone: "deep",
    edges: "ink",
  });
  builder.addBox([1.2, 0.16, 0.26], [0.4, 0.45, 0], {
    tone: "shade",
    edges: "ink",
  });
  for (let i = 0; i < 10; i += 1) {
    const x = -0.15 + i * 0.12;
    builder.addLine(
      [new THREE.Vector3(x, 0.405, -0.56), new THREE.Vector3(x, 0.405, 0.56)],
      "fine",
    );
  }

  // Dashboard and instruments.
  builder.addBox([0.16, 0.2, 1.16], [-0.02, 0.68, 0], {
    tone: "shade",
    edges: "ink",
  });
  builder.addBox([0.14, 0.12, 0.4], [-0.08, 0.79, -0.28], {
    tone: "paper",
    edges: "ink",
  });
  for (let i = 0; i < 3; i += 1) {
    const z = -0.4 + i * 0.12;
    builder.addLine(
      circlePoints(new THREE.Vector3(-0.16, 0.79, z), 0.042, "x", 24),
      "ink",
      true,
    );
    builder.addLine(
      [
        new THREE.Vector3(-0.165, 0.79, z),
        new THREE.Vector3(-0.165, 0.815, z + 0.012),
      ],
      "rust",
    );
  }
  for (let i = 0; i < 3; i += 1) {
    builder.addLine(
      [
        new THREE.Vector3(-0.13, 0.72, -0.48 + i * 0.13),
        new THREE.Vector3(-0.13, 0.745, -0.48 + i * 0.13),
      ],
      "fine",
    );
  }

  // Steering wheel, three wood spokes on a walnut rim.
  const wheelMatrix = new THREE.Matrix4().compose(
    new THREE.Vector3(-0.3, 0.78, -0.28),
    new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0.18, Math.PI / 2, 0, "YXZ"),
    ),
    new THREE.Vector3(1, 1, 1),
  );
  const placeOnWheel = (point: THREE.Vector3) =>
    point.clone().applyMatrix4(wheelMatrix);
  builder.addSolid(new THREE.TorusGeometry(0.17, 0.014, 8, 44), {
    tone: "paper",
    edges: "ink",
    threshold: 40,
    matrix: wheelMatrix,
  });
  builder.addLine(
    circlePoints(new THREE.Vector3(), 0.153, "z", 44).map(placeOnWheel),
    "rust",
    true,
  );
  builder.addLine(
    circlePoints(new THREE.Vector3(), 0.045, "z", 20).map(placeOnWheel),
    "ink",
    true,
  );
  for (let i = 0; i < 3; i += 1) {
    const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
    builder.addLine(
      [
        placeOnWheel(
          new THREE.Vector3(Math.cos(angle) * 0.04, Math.sin(angle) * 0.04, 0),
        ),
        placeOnWheel(
          new THREE.Vector3(Math.cos(angle) * 0.16, Math.sin(angle) * 0.16, 0),
        ),
      ],
      "ink",
    );
  }
  builder.addLine(
    [
      new THREE.Vector3(-0.22, 0.79, -0.28),
      new THREE.Vector3(-0.08, 0.7, -0.28),
    ],
    "fine",
  );

  // Seats, facing forward (-X).
  for (const side of [1, -1]) {
    const z = side * 0.3;
    builder.addBox([0.46, 0.1, 0.42], [0.33, 0.47, z], {
      tone: "paper",
      edges: "ink",
    });
    builder.addBox([0.15, 0.5, 0.4], [0.56, 0.68, z], {
      tone: "paper",
      edges: "ink",
      rotation: [0, 0, -0.2],
    });
    builder.addBox([0.11, 0.14, 0.22], [0.63, 0.93, z], {
      tone: "paper",
      edges: "ink",
      rotation: [0, 0, -0.2],
    });
    for (let i = 0; i < 3; i += 1) {
      builder.addLine(
        [
          new THREE.Vector3(0.61, 0.5 + i * 0.13, z - 0.13),
          new THREE.Vector3(0.61, 0.5 + i * 0.13, z + 0.13),
        ],
        "fine",
      );
    }
    builder.addLine(
      [
        new THREE.Vector3(0.48, 0.52, z - 0.18),
        new THREE.Vector3(0.48, 0.52, z + 0.18),
      ],
      "rust",
    );
  }

  // Centre console and gear lever.
  builder.addBox([0.5, 0.16, 0.18], [0.36, 0.5, 0], {
    tone: "shade",
    edges: "ink",
  });
  builder.addLine(
    [new THREE.Vector3(0.2, 0.58, 0), new THREE.Vector3(0.28, 0.68, 0.02)],
    "ink",
  );
  builder.addLine(
    circlePoints(new THREE.Vector3(0.28, 0.69, 0.02), 0.03, "y", 14),
    "ink",
    true,
  );

  // Rear parcel shelf.
  builder.addBox([0.4, 0.04, 1.0], [1.25, 0.55, 0], {
    tone: "deep",
    edges: "fine",
  });
  builder.finish();
  return builder;
}

function buildWheel() {
  const builder = new PartBuilder();
  builder.addTorus(0.297, 0.061, [0, 0, 0], {
    tone: "shade",
    edges: null,
  });
  for (const side of [1, -1]) {
    builder.addLine(
      circlePoints(new THREE.Vector3(0, 0, side * 0.058), 0.352, "z", 60),
      "ink",
      true,
    );
    builder.addLine(
      circlePoints(new THREE.Vector3(0, 0, side * 0.058), 0.238, "z", 48),
      "ink",
      true,
    );
    builder.addLine(
      circlePoints(new THREE.Vector3(0, 0, side * 0.036), 0.246, "z", 40),
      "fine",
      true,
    );
  }
  // Tread ticks.
  for (let i = 0; i < 40; i += 1) {
    const angle = (i / 40) * Math.PI * 2;
    const outer = new THREE.Vector3(
      Math.cos(angle) * 0.356,
      Math.sin(angle) * 0.356,
      0,
    );
    const inner = new THREE.Vector3(
      Math.cos(angle) * 0.33,
      Math.sin(angle) * 0.33,
      0,
    );
    builder.addLine([inner, outer], "fine");
  }
  // Rim bed.
  for (const side of [1, -1]) {
    builder.addLine(
      circlePoints(new THREE.Vector3(0, 0, side * 0.01), 0.232, "z", 44),
      "ink",
      true,
    );
  }
  // Laced spokes on both visible faces.
  for (const side of [1, -1]) {
    for (let i = 0; i < 32; i += 1) {
      const angle = (i / 32) * Math.PI * 2;
      const offset = (i % 2 === 0 ? 1 : -1) * 0.028;
      builder.addLine(
        [
          new THREE.Vector3(
            Math.cos(angle + 0.16) * 0.062,
            Math.sin(angle + 0.16) * 0.062,
            side * (0.07 + offset),
          ),
          new THREE.Vector3(
            Math.cos(angle) * 0.23,
            Math.sin(angle) * 0.23,
            side * 0.012,
          ),
        ],
        i % 4 === 0 ? "ink" : "fine",
      );
    }
  }
  // Hub, spinner and brake disc.
  builder.addCylinder(0.058, 0.068, 0.13, [0, 0, 0], {
    tone: "paper",
    edges: "ink",
    rotation: [Math.PI / 2, 0, 0],
    segments: 18,
  });
  builder.addLine(
    circlePoints(new THREE.Vector3(0, 0, 0.073), 0.034, "z", 24),
    "rust",
    true,
  );
  builder.addLine(
    circlePoints(new THREE.Vector3(0, 0, -0.005), 0.186, "z", 40),
    "fine",
    true,
  );
  builder.addLine(
    circlePoints(new THREE.Vector3(0, 0, -0.005), 0.09, "z", 24),
    "ink",
    true,
  );
  for (let i = 0; i < 24; i += 1) {
    const angle = (i / 24) * Math.PI * 2;
    builder.addLine(
      [
        new THREE.Vector3(
          Math.cos(angle) * 0.09,
          Math.sin(angle) * 0.09,
          -0.005,
        ),
        new THREE.Vector3(
          Math.cos(angle) * 0.18,
          Math.sin(angle) * 0.18,
          -0.005,
        ),
      ],
      "fine",
    );
  }
  builder.finish();
  return builder;
}

export type CarPart = {
  id: AssemblyId;
  builders: PartBuilder[];
  groups: THREE.Group[];
};

export type Car = {
  root: THREE.Group;
  parts: Record<AssemblyId, CarPart>;
  wheelPivots: THREE.Group[];
  wheelBase: THREE.Vector3[];
  anchors: Record<AssemblyId, THREE.Object3D>;
  setHighlight: (id: AssemblyId | null, hovered: AssemblyId | null) => void;
  dispose: () => void;
};

export function buildCar(): Car {
  const root = new THREE.Group();

  const coachwork = new PartBuilder();
  buildCoachwork(coachwork);
  root.add(coachwork.group);

  const chassis = new PartBuilder();
  buildChassis(chassis);
  root.add(chassis.group);

  const powertrain = new PartBuilder();
  buildPowertrain(powertrain);
  root.add(powertrain.group);

  const cockpit = new PartBuilder();
  buildCockpit(cockpit);
  root.add(cockpit.group);

  const wheelPivots: THREE.Group[] = [];
  const wheelBuilders: PartBuilder[] = [];
  const wheelBase: THREE.Vector3[] = [];
  for (const side of [1, -1]) {
    for (const x of [FRONT_AXLE_X, REAR_AXLE_X]) {
      const pivot = new THREE.Group();
      pivot.position.set(x, WHEEL_RADIUS, side * TRACK);
      const wheel = buildWheel();
      if (side < 0) wheel.group.rotation.y = Math.PI;
      pivot.add(wheel.group);
      root.add(pivot);
      wheelPivots.push(pivot);
      wheelBuilders.push(wheel);
      wheelBase.push(pivot.position.clone());
    }
  }

  const parts: Record<AssemblyId, CarPart> = {
    coachwork: {
      id: "coachwork",
      builders: [coachwork],
      groups: [coachwork.group],
    },
    chassis: { id: "chassis", builders: [chassis], groups: [chassis.group] },
    powertrain: {
      id: "powertrain",
      builders: [powertrain],
      groups: [powertrain.group],
    },
    cockpit: { id: "cockpit", builders: [cockpit], groups: [cockpit.group] },
    suspension: {
      id: "suspension",
      builders: wheelBuilders,
      groups: wheelPivots,
    },
  };

  const anchor = (parent: THREE.Object3D, x: number, y: number, z: number) => {
    const node = new THREE.Object3D();
    node.position.set(x, y, z);
    parent.add(node);
    return node;
  };

  const anchors: Record<AssemblyId, THREE.Object3D> = {
    coachwork: anchor(coachwork.group, 0.22, 1.335, 0.26),
    chassis: anchor(chassis.group, 0.88, 0.47, -0.5),
    powertrain: anchor(powertrain.group, -1.05, 0.84, 0.24),
    cockpit: anchor(cockpit.group, 0.52, 1.0, -0.31),
    suspension: anchor(wheelPivots[0], 0.02, 0.03, 0.06),
  };

  const setHighlight = (
    selected: AssemblyId | null,
    hovered: AssemblyId | null,
  ) => {
    const pending = selected ?? hovered;
    (Object.keys(parts) as AssemblyId[]).forEach((id) => {
      const mode: Highlight =
        pending === id ? "active" : pending ? "muted" : "normal";
      parts[id].builders.forEach((builder) => builder.setHighlight(mode));
    });
  };

  return {
    root,
    parts,
    wheelPivots,
    wheelBase,
    anchors,
    setHighlight,
    dispose() {
      Object.values(parts).forEach((part) =>
        part.builders.forEach((builder) => builder.dispose()),
      );
    },
  };
}
