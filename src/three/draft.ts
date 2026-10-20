import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * The atelier's 3D ink. One palette, three line weights and two paper fills.
 * Everything is generated as vector geometry, so the WebGL drawing keeps the
 * same hand-drafted character as the SVG plates elsewhere in the archive.
 */
export const PALETTE = {
  ink: 0x4a3e3d,
  rust: 0x8c2d19,
  paper: 0xf3e8d4,
  paperShade: 0xe8dac2,
  paperDeep: 0xdcc9ac,
} as const;

export const INK = new THREE.Color(PALETTE.ink);
export const RUST = new THREE.Color(PALETTE.rust);

export type LineKind = "ink" | "fine" | "rust";
export type FillTone = "paper" | "shade" | "deep" | "glass";

export type Highlight = "normal" | "active" | "muted";

const COLOR = {
  normal: {
    ink: new THREE.Color(PALETTE.ink),
    fine: new THREE.Color(PALETTE.ink),
    rust: new THREE.Color(PALETTE.rust),
    paper: new THREE.Color(PALETTE.paper),
    shade: new THREE.Color(PALETTE.paperShade),
    deep: new THREE.Color(PALETTE.paperDeep),
    glass: new THREE.Color(0xcab89c),
  },
  active: {
    ink: new THREE.Color(PALETTE.rust),
    fine: new THREE.Color(PALETTE.rust),
    rust: new THREE.Color(PALETTE.rust),
    paper: new THREE.Color(0xf5e8d4),
    shade: new THREE.Color(0xe9d5b8),
    deep: new THREE.Color(0xddc4a3),
    glass: new THREE.Color(0xd0b79c),
  },
  muted: {
    ink: new THREE.Color(0x8e8278),
    fine: new THREE.Color(0x9c9187),
    rust: new THREE.Color(0xb08376),
    paper: new THREE.Color(0xf1e7d4),
    shade: new THREE.Color(0xe5d7c1),
    deep: new THREE.Color(0xd8c7ae),
    glass: new THREE.Color(0xdfd2bd),
  },
} as const;

const OPACITY = {
  normal: { ink: 0.86, fine: 0.3, rust: 0.78, fill: 1 },
  active: { ink: 1, fine: 0.42, rust: 1, fill: 1 },
  muted: { ink: 0.24, fine: 0.1, rust: 0.18, fill: 1 },
} as const;

export function pushPoints(
  target: number[],
  points: THREE.Vector3[],
  closed = false,
) {
  const count = closed ? points.length : points.length - 1;
  for (let i = 0; i < count; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    target.push(a.x, a.y, a.z, b.x, b.y, b.z);
  }
  return target;
}

/** Points on a circle in a cardinal plane. */
export function circlePoints(
  center: THREE.Vector3,
  radius: number,
  axis: "x" | "y" | "z",
  segments = 44,
  from = 0,
  to = Math.PI * 2,
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const angle = from + ((to - from) * i) / segments;
    const c = Math.cos(angle) * radius;
    const s = Math.sin(angle) * radius;
    if (axis === "x")
      points.push(new THREE.Vector3(center.x, center.y + c, center.z + s));
    else if (axis === "y")
      points.push(new THREE.Vector3(center.x + c, center.y, center.z + s));
    else points.push(new THREE.Vector3(center.x + c, center.y + s, center.z));
  }
  return points;
}

/** A rounded rectangle in a cardinal plane, drawn as one clean line. */
export function roundedRectPoints(
  center: THREE.Vector3,
  width: number,
  height: number,
  radius: number,
  axis: "x" | "y" | "z",
  segments = 7,
): THREE.Vector3[] {
  const corners: [number, number, number][] = [
    [width / 2 - radius, height / 2 - radius, 0],
    [-width / 2 + radius, height / 2 - radius, Math.PI / 2],
    [-width / 2 + radius, -height / 2 + radius, Math.PI],
    [width / 2 - radius, -height / 2 + radius, (Math.PI * 3) / 2],
  ];
  const points: THREE.Vector3[] = [];
  corners.forEach(([cx, cy, start]) => {
    for (let i = 0; i <= segments; i += 1) {
      const angle = start + (Math.PI / 2) * (i / segments);
      const c = cx + Math.cos(angle) * radius;
      const s = cy + Math.sin(angle) * radius;
      if (axis === "x")
        points.push(new THREE.Vector3(center.x, center.y + s, center.z + c));
      else if (axis === "y")
        points.push(new THREE.Vector3(center.x + c, center.y, center.z + s));
      else points.push(new THREE.Vector3(center.x + c, center.y + s, center.z));
    }
  });
  return points;
}

export function lineGeometry(positions: number[]) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.computeBoundingSphere();
  return geometry;
}

type SolidOptions = {
  tone?: FillTone;
  edges?: LineKind | null;
  threshold?: number;
  matrix?: THREE.Matrix4;
};

/**
 * Accumulates the solids and strokes of one assembly, then merges them into a
 * handful of draw calls. Each assembly owns its materials so that a selected
 * part can be re-inked in rust without touching the rest of the drawing.
 */
export class PartBuilder {
  readonly group = new THREE.Group();
  private readonly fills: Record<FillTone, THREE.BufferGeometry[]> = {
    paper: [],
    shade: [],
    deep: [],
    glass: [],
  };
  private readonly strokes: Record<LineKind, number[]> = {
    ink: [],
    fine: [],
    rust: [],
  };
  private readonly materials: {
    fill: Record<FillTone, THREE.MeshLambertMaterial>;
    line: Record<LineKind, THREE.LineBasicMaterial>;
  } = {
    fill: {
      paper: new THREE.MeshLambertMaterial({
        color: COLOR.normal.paper,
        side: THREE.DoubleSide,
        flatShading: false,
      }),
      shade: new THREE.MeshLambertMaterial({
        color: COLOR.normal.shade,
        side: THREE.DoubleSide,
      }),
      deep: new THREE.MeshLambertMaterial({
        color: COLOR.normal.deep,
        side: THREE.DoubleSide,
      }),
      glass: new THREE.MeshLambertMaterial({
        color: COLOR.normal.glass,
        side: THREE.DoubleSide,
      }),
    },
    line: {
      ink: new THREE.LineBasicMaterial({
        color: COLOR.normal.ink,
        transparent: true,
        opacity: OPACITY.normal.ink,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -4,
      }),
      fine: new THREE.LineBasicMaterial({
        color: COLOR.normal.fine,
        transparent: true,
        opacity: OPACITY.normal.fine,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -4,
      }),
      rust: new THREE.LineBasicMaterial({
        color: COLOR.normal.rust,
        transparent: true,
        opacity: OPACITY.normal.rust,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -4,
      }),
    },
  };
  private highlight: Highlight = "normal";
  private finished = false;

  addLine(points: THREE.Vector3[], kind: LineKind = "ink", closed = false) {
    pushPoints(this.strokes[kind], points, closed);
    return this;
  }

  addSegments(positions: number[], kind: LineKind = "ink") {
    for (const value of positions) this.strokes[kind].push(value);
    return this;
  }

  /** Raw triangle soup, used for glazing laid directly on the body loft. */
  addSurface(positions: number[], tone: FillTone = "glass") {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    // Match the attribute set of Box/Cylinder/Torus solids so a tone can merge
    // raw panels (arch liners, glazing) with primitive geometry safely.
    const count = positions.length / 3;
    geometry.setAttribute(
      "uv",
      new THREE.Float32BufferAttribute(new Float32Array(count * 2), 2),
    );
    geometry.computeVertexNormals();
    this.fills[tone].push(geometry);
    return this;
  }

  addSolid(geometry: THREE.BufferGeometry, options: SolidOptions = {}) {
    const { tone = "paper", edges = "ink", threshold = 28, matrix } = options;
    const solid = geometry.clone();
    if (matrix) solid.applyMatrix4(matrix);
    this.fills[tone].push(solid);
    if (edges) {
      const edgeGeometry = new THREE.EdgesGeometry(solid, threshold);
      const source = edgeGeometry.getAttribute("position")
        .array as ArrayLike<number>;
      for (let i = 0; i < source.length; i += 1)
        this.strokes[edges].push(source[i]);
      edgeGeometry.dispose();
    }
    return this;
  }

  addBox(
    size: [number, number, number],
    position: [number, number, number],
    options: SolidOptions & { rotation?: [number, number, number] } = {},
  ) {
    const geometry = new THREE.BoxGeometry(...size);
    const matrix = new THREE.Matrix4().compose(
      new THREE.Vector3(...position),
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(...(options.rotation ?? [0, 0, 0])),
      ),
      new THREE.Vector3(1, 1, 1),
    );
    return this.addSolid(geometry, { ...options, matrix });
  }

  addCylinder(
    radiusTop: number,
    radiusBottom: number,
    height: number,
    position: [number, number, number],
    options: SolidOptions & {
      rotation?: [number, number, number];
      segments?: number;
    } = {},
  ) {
    const geometry = new THREE.CylinderGeometry(
      radiusTop,
      radiusBottom,
      height,
      options.segments ?? 16,
    );
    const matrix = new THREE.Matrix4().compose(
      new THREE.Vector3(...position),
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(...(options.rotation ?? [0, 0, 0])),
      ),
      new THREE.Vector3(1, 1, 1),
    );
    return this.addSolid(geometry, { ...options, matrix });
  }

  addTorus(
    radius: number,
    tube: number,
    position: [number, number, number],
    options: SolidOptions & { rotation?: [number, number, number] } = {},
  ) {
    const geometry = new THREE.TorusGeometry(radius, tube, 8, 48);
    const matrix = new THREE.Matrix4().compose(
      new THREE.Vector3(...position),
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(...(options.rotation ?? [0, 0, 0])),
      ),
      new THREE.Vector3(1, 1, 1),
    );
    return this.addSolid(geometry, { ...options, matrix });
  }

  /** A thin round tube between two points, drawn as a solid with ink edges. */
  addTube(
    from: THREE.Vector3,
    to: THREE.Vector3,
    radius: number,
    options: SolidOptions & { segments?: number } = {},
  ) {
    const direction = new THREE.Vector3().subVectors(to, from);
    const length = direction.length();
    if (length < 0.0001) return this;
    const geometry = new THREE.CylinderGeometry(
      radius,
      radius,
      length,
      options.segments ?? 7,
      1,
      false,
    );
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize(),
    );
    const matrix = new THREE.Matrix4().compose(
      from.clone().add(to).multiplyScalar(0.5),
      quaternion,
      new THREE.Vector3(1, 1, 1),
    );
    return this.addSolid(geometry, { ...options, matrix });
  }

  /** Merge accumulated geometry into live meshes. Call once, after building. */
  finish(options: { castLines?: boolean; lineOrder?: number } = {}) {
    if (this.finished) return this.group;
    this.finished = true;
    (["paper", "shade", "deep", "glass"] as FillTone[]).forEach((tone) => {
      if (!this.fills[tone].length) return;
      const merged = mergeGeometries(this.fills[tone], false);
      if (!merged) return;
      merged.computeBoundingSphere();
      const mesh = new THREE.Mesh(merged, this.materials.fill[tone]);
      mesh.renderOrder = 1;
      this.group.add(mesh);
      this.fills[tone].length = 0;
    });
    (["fine", "ink", "rust"] as LineKind[]).forEach((kind) => {
      if (!this.strokes[kind].length) return;
      const lines = new THREE.LineSegments(
        lineGeometry(this.strokes[kind]),
        this.materials.line[kind],
      );
      lines.renderOrder = options.lineOrder ?? 2;
      lines.frustumCulled = false;
      this.group.add(lines);
      this.strokes[kind].length = 0;
    });
    this.setHighlight(options.castLines === false ? "muted" : this.highlight);
    return this.group;
  }

  setHighlight(mode: Highlight) {
    this.highlight = mode;
    const color = COLOR[mode];
    const opacity = OPACITY[mode];
    (["ink", "fine", "rust"] as LineKind[]).forEach((kind) => {
      const material = this.materials.line[kind];
      material.color.copy(color[kind]);
      material.opacity = opacity[kind];
    });
    (["paper", "shade", "deep", "glass"] as FillTone[]).forEach((tone) => {
      this.materials.fill[tone].color.copy(color[tone]);
    });
    return this;
  }

  dispose() {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
        child.geometry.dispose();
      }
    });
    Object.values(this.materials.fill).forEach((material) =>
      material.dispose(),
    );
    Object.values(this.materials.line).forEach((material) =>
      material.dispose(),
    );
  }
}
