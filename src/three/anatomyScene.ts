import * as THREE from "three";
import { buildCar } from "./carModel";
import { separationWindows } from "../components/anatomy/assemblies";
import type { AssemblyId } from "../components/anatomy/assemblies";
import { PALETTE } from "./draft";

/**
 * The WebGL plate: a transparent canvas pinned behind the atelier typography.
 * Scroll only sets a target; the scene chases it with exponential damping so
 * every assembly carries a little mechanical weight as it separates.
 */

export type SceneView = {
  progress: number;
  calm: boolean;
  pointer: { x: number; y: number };
  selected: AssemblyId | null;
  hovered: AssemblyId | null;
};

export type AnchorPoint = { x: number; y: number };

export type AnatomyScene = {
  render: (view: SceneView) => void;
  resize: () => void;
  anchors: () => Record<AssemblyId, AnchorPoint>;
  width: () => number;
  height: () => number;
  dispose: () => void;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

function shadowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      8,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, "rgba(74, 62, 61, 0.30)");
    gradient.addColorStop(0.45, "rgba(74, 62, 61, 0.14)");
    gradient.addColorStop(0.75, "rgba(74, 62, 61, 0.04)");
    gradient.addColorStop(1, "rgba(74, 62, 61, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createAnatomyScene(canvas: HTMLCanvasElement): AnatomyScene {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(27, 1, 0.1, 80);
  const focus = new THREE.Vector3(0, 0.64, 0);
  camera.lookAt(focus);

  const hemi = new THREE.HemisphereLight(0xfffbf1, 0xc3ac8d, 2.15);
  const key = new THREE.DirectionalLight(0xfffdf4, 1.05);
  key.position.set(4.5, 8, 6.5);
  const fill = new THREE.DirectionalLight(0xf6e9d4, 0.5);
  fill.position.set(-7, 4, -4);
  const rim = new THREE.DirectionalLight(0xffffff, 0.35);
  rim.position.set(-2, 6, -8);
  scene.add(hemi, key, fill, rim);

  const car = buildCar();
  scene.add(car.root);

  // A soft pencil shadow and the drafting footprint beneath the machine.
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(6.6, 3.5),
    new THREE.MeshBasicMaterial({
      map: shadowTexture(),
      transparent: true,
      depthWrite: false,
      opacity: 0.62,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.005;
  shadow.renderOrder = 0;
  scene.add(shadow);

  const footprint: THREE.Line[] = [];
  const footprintMaterial = new THREE.LineBasicMaterial({
    color: PALETTE.rust,
    transparent: true,
    opacity: 0.28,
  });
  const ellipse = new THREE.EllipseCurve(0, 0, 2.5, 1.02, 0, Math.PI * 2);
  const ellipsePoints = ellipse
    .getPoints(90)
    .map((point) => new THREE.Vector3(point.x, 0.012, point.y));
  const ellipseLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(ellipsePoints),
    footprintMaterial,
  );
  scene.add(ellipseLine);
  footprint.push(ellipseLine);
  for (const x of [-2.25, 2.25]) {
    const tick = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, 0.012, -0.1),
        new THREE.Vector3(x, 0.012, 0.1),
      ]),
      footprintMaterial,
    );
    scene.add(tick);
    footprint.push(tick);
  }
  const centreLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.9, 0.012, 0),
      new THREE.Vector3(2.9, 0.012, 0),
    ]),
    new THREE.LineDashedMaterial({
      color: PALETTE.rust,
      transparent: true,
      opacity: 0.26,
      dashSize: 0.14,
      gapSize: 0.08,
    }),
  );
  centreLine.computeLineDistances();
  scene.add(centreLine);
  footprint.push(centreLine);

  const body = car.parts.coachwork.groups[0];
  const chassis = car.parts.chassis.groups[0];
  const powertrain = car.parts.powertrain.groups[0];
  const cockpit = car.parts.cockpit.groups[0];

  const temp = new THREE.Vector3();
  const positions = {} as Record<AssemblyId, THREE.Vector3>;
  const projected = {} as Record<AssemblyId, AnchorPoint>;
  (Object.keys(car.anchors) as AssemblyId[]).forEach((id) => {
    positions[id] = car.anchors[id].getWorldPosition(new THREE.Vector3());
    projected[id] = { x: 0, y: 0 };
  });

  let width = 1;
  let height = 1;
  let aspect = 1;
  let lastHighlight = "";

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    aspect = width / height;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  };

  const framing = (progress: number) => {
    const e = smooth(progress);
    const halfTan = Math.tan((camera.fov * Math.PI) / 360);
    const fraction = aspect > 1.35 ? 0.62 : aspect > 0.95 ? 0.8 : 1.1;
    const span = 5.15 + 2.15 * e;
    const distance = THREE.MathUtils.clamp(
      span / (2 * halfTan * aspect * fraction),
      7.4,
      34,
    );
    return { e, distance };
  };

  const render = (view: SceneView) => {
    const e = smooth(view.progress);
    const calm = view.calm ? 0 : 1;

    const t = (id: AssemblyId) => {
      const [start, end] = separationWindows[id];
      return smooth((view.progress - start) / (end - start));
    };
    const bodyT = t("coachwork");
    const cockpitT = t("cockpit");
    const engineT = t("powertrain");
    const chassisT = t("chassis");
    const wheelT = t("suspension");

    body.position.set(0, 1.26 * bodyT, 0);
    body.rotation.z = 0.012 * bodyT;
    chassis.position.set(0, -0.4 * chassisT, 0);
    powertrain.position.set(-0.52 * engineT, 0.08 * engineT, 0);
    cockpit.position.set(0.1 * cockpitT, 0.58 * cockpitT, 0);

    car.wheelPivots.forEach((pivot, index) => {
      const base = car.wheelBase[index];
      const side = Math.sign(base.z);
      const front = base.x < 0 ? -1 : 1;
      pivot.position.set(
        base.x + front * 0.14 * wheelT,
        base.y - 0.16 * wheelT,
        base.z + side * 0.52 * wheelT,
      );
    });

    // Camera: a slow dollied-out three-quarter that gains elevation.
    const { distance } = framing(view.progress);
    const azimuth =
      THREE.MathUtils.lerp(-0.66, -0.5, e) + view.pointer.x * 0.055 * calm;
    const elevation =
      THREE.MathUtils.lerp(0.245, 0.35, e) - view.pointer.y * 0.03 * calm;
    const targetY =
      THREE.MathUtils.lerp(0.58, 0.72, e) + (aspect < 0.95 ? 0.34 : 0);
    focus.set(0, targetY, 0);
    camera.position.set(
      Math.sin(azimuth) * Math.cos(elevation) * distance,
      targetY + Math.sin(elevation) * distance,
      Math.cos(azimuth) * Math.cos(elevation) * distance,
    );
    camera.lookAt(focus);
    car.root.rotation.y = 0.06 * e;

    shadow.material.opacity = 0.62 * (1 - e * 0.86);
    shadow.scale.setScalar(1 + e * 0.35);
    footprintMaterial.opacity = Math.max(0, 0.28 - e * 0.34);

    const highlightKey = `${view.selected ?? ""}|${view.hovered ?? ""}`;
    if (highlightKey !== lastHighlight) {
      lastHighlight = highlightKey;
      car.setHighlight(view.selected, view.hovered);
    }

    renderer.render(scene, camera);

    (Object.keys(car.anchors) as AssemblyId[]).forEach((id) => {
      car.anchors[id].getWorldPosition(temp);
      const point = temp.clone().project(camera);
      projected[id] = {
        x: (point.x * 0.5 + 0.5) * width,
        y: (-point.y * 0.5 + 0.5) * height,
      };
    });
  };

  const anchors = () => projected;

  resize();

  return {
    render,
    resize,
    anchors,
    width: () => width,
    height: () => height,
    dispose() {
      car.dispose();
      shadow.geometry.dispose();
      (shadow.material as THREE.MeshBasicMaterial).map?.dispose();
      (shadow.material as THREE.MeshBasicMaterial).dispose();
      footprint.forEach((line) => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
      footprintMaterial.dispose();
      renderer.dispose();
      scene.clear();
    },
  };
}
