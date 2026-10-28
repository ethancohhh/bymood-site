import { Fragment, useId, useRef, type CSSProperties } from 'react';
import { scene } from '../scene';
import type { Box, Level, Vec2 } from '../scene/types';
import { project, SCALE, slabShapes, sortBoxes } from './iso';
import { Covering, Solid } from './primitives';
import { useHeroMotion } from './useHeroMotion';

// Écartement ajouté entre deux niveaux dans la vue éclatée, en mètres ; à l'apparition,
// les niveaux partent d'un écart réduit avant de s'ouvrir.
const EXPLODE_GAP = 5.5;
const CLOSED_GAP = 0.8;

type DrawnLevel = { level: Level; lift: number; boxes: Box[]; slab: ReturnType<typeof slabShapes> };

const drawn: DrawnLevel[] = scene.levels.map((level, i) => ({
  level,
  lift: level.elevation + i * EXPLODE_GAP,
  boxes: sortBoxes(level.boxes),
  slab: slabShapes(level.slab),
}));
const context = sortBoxes(scene.context.boxes);

// Hauteur atteinte par un niveau à l'aplomb d'un angle, pour faire partir les rappels pointillés.
const heightAt = (level: Level, [x, y]: Vec2) => Math.max(0, ...level.boxes
  .filter(b => b.min[0] - 0.25 <= x && x <= b.max[0] + 0.25 && b.min[1] - 0.25 <= y && y <= b.max[1] + 0.25)
  .map(b => b.max[2]));

function guides(lower: DrawnLevel, upper: DrawnLevel) {
  return upper.level.slab.outline.map(corner => {
    const from = project(corner[0], corner[1], lower.lift + heightAt(lower.level, corner));
    const to = project(corner[0], corner[1], upper.lift - upper.level.slab.thickness);
    return `M${from.join(',')}V${to[1]}`;
  }).join('');
}

// Cadrage en bannière : la maison occupe toute la hauteur, centrée aux trois quarts de la
// largeur ; le quartier remplit le reste, jusque sous le texte du hero.
export const BANNER_RATIO = 2.4;
const HOUSE_CENTER = 0.74;

function bannerViewBox(margin = 36) {
  const points = drawn.flatMap(({ level, lift }) => [
    ...level.slab.outline.flatMap(([x, y]) => [project(x, y, lift - level.slab.thickness), project(x, y, lift)]),
    ...level.boxes.flatMap(({ min, max }) => [project(min[0], max[1], lift + max[2]), project(max[0], min[1], lift + max[2]), project(max[0], max[1], lift)]),
  ]);
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  const height = Math.max(...ys) - Math.min(...ys) + 2 * margin;
  const width = height * BANNER_RATIO;
  const center = (Math.min(...xs) + Math.max(...xs)) / 2;
  return [center - width * HOUSE_CENTER, Math.min(...ys) - margin, width, height].map(Math.round);
}

const [vx, vy, vw, vh] = bannerViewBox();

// Positions de la vue éclatée exposées au CSS (animation d'ouverture, resserrement au scroll).
const levelStyle = (level: Level, i: number) => ({
  '--lift-open': `${-(level.elevation + i * EXPLODE_GAP) * SCALE}px`,
  '--lift-closed': `${-(level.elevation + i * CLOSED_GAP) * SCALE}px`,
  '--gap': `${i * (EXPLODE_GAP - CLOSED_GAP) * SCALE}px`,
  '--depth': i,
}) as CSSProperties;

export function HeroAxoBanner() {
  const id = useId().replaceAll(':', '');
  const fade = `${id}-fade`;
  const ref = useRef<SVGSVGElement>(null);
  useHeroMotion(ref);
  return <svg ref={ref} className="hero-axo" viewBox={`${vx} ${vy} ${vw} ${vh}`} preserveAspectRatio="xMaxYMid slice" role="img" aria-labelledby={`${id}-title ${id}-description`} focusable="false">
    <title id={`${id}-title`}>Une maison dessinée en vue éclatée</title>
    <desc id={`${id}-description`}>Axonométrie imaginaire d’une maison en L dans son quartier : le rez-de-chaussée, l’étage et le toit-terrasse sont écartés les uns des autres et reliés par des rappels pointillés. Les murs sont coupés pour montrer l’aménagement : séjour avec cuisine ouverte, bureau, chambres, salle de bains, escalier et terrasse plantée. Autour, des rues bordées d’arbres, des voitures garées et des maisons voisines.</desc>
    <defs>
      {/* Fondu du quartier : très léger sous le texte à gauche, adouci en haut et en bas. */}
      <linearGradient id={`${fade}-x`} gradientUnits="userSpaceOnUse" x1={vx} x2={vx + vw} y1="0" y2="0">
        <stop offset="0.3" stopColor="black" />
        <stop offset="0.45" stopColor="#3a3a3a" />
        <stop offset="0.6" stopColor="white" />
      </linearGradient>
      <linearGradient id={`${fade}-y`} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={vy} y2={vy + vh}>
        <stop offset="0" stopColor="black" />
        <stop offset="0.12" stopColor="white" />
        <stop offset="0.86" stopColor="white" />
        <stop offset="1" stopColor="black" />
      </linearGradient>
      <mask id={`${fade}-x-mask`} maskUnits="userSpaceOnUse" x={vx} y={vy} width={vw} height={vh}>
        <rect x={vx} y={vy} width={vw} height={vh} fill={`url(#${fade}-x)`} />
      </mask>
      <mask id={`${fade}-y-mask`} maskUnits="userSpaceOnUse" x={vx} y={vy} width={vw} height={vh}>
        <rect x={vx} y={vy} width={vw} height={vh} fill={`url(#${fade}-y)`} />
      </mask>
    </defs>
    <g className="axo-city" mask={`url(#${fade}-x-mask)`}><g mask={`url(#${fade}-y-mask)`}><g className="axo-city-shift">
      <g className="axo-surfaces">{scene.context.surfaces.map((surface, k) => <Covering key={k} surface={surface} />)}</g>
      {context.map((b, k) => <Solid key={k} box={b} />)}
    </g></g></g>
    <g className="axo-house">
      {drawn.map((current, i) => <Fragment key={current.level.id}>
        {i > 0 && <g className="axo-level-shift" style={{ '--depth': i - 0.5 } as CSSProperties}><path className="axo-guides" d={guides(drawn[i - 1], current)} /></g>}
        <g className="axo-level-shift" style={levelStyle(current.level, i)}>
          <g className="axo-level" data-level={current.level.id}>
            <g className="axo-slab">
              {current.slab.holeSides.map((points, k) => <polygon key={`h${k}`} className="axo-slab-hole" points={points} pathLength={1} />)}
              {current.slab.sides.map((points, k) => <polygon key={`s${k}`} className="axo-slab-side" points={points} pathLength={1} />)}
              <path className="axo-slab-top" d={current.slab.top} pathLength={1} />
            </g>
            <g className="axo-surfaces">{current.level.surfaces?.map((surface, k) => <Covering key={k} surface={surface} />)}</g>
            {current.boxes.map((b, k) => <Solid key={k} box={b} />)}
          </g>
        </g>
      </Fragment>)}
    </g>
  </svg>;
}
