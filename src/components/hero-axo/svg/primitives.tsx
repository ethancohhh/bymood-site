import type { Box, Surface } from '../scene/types';
import { boxFaces, facadeWindows, gableFaces, plantShapes, surfaceShapes, treeShapes, tubBasin } from './iso';

function Faces({ box }: { box: Box }) {
  return <>{boxFaces(box).map(face => <polygon key={face.side} className={`axo-face-${face.side}`} points={face.points} pathLength={1} />)}</>;
}

export function Solid({ box }: { box: Box }) {
  if (box.kind === 'plant') {
    const { pot, leafPaths } = plantShapes(box);
    return <g className="axo-box axo-plant">
      <Faces box={pot} />
      {leafPaths.map(({ blade, rib }, i) => <g key={i} className="axo-leaf"><path d={blade} /><path className="axo-leaf-rib" d={rib} /></g>)}
    </g>;
  }
  if (box.kind === 'tree') {
    const { shadow, trunk, branches, crown, tufts } = treeShapes(box);
    return <g className="axo-box axo-tree">
      <ellipse className="axo-tree-shadow" {...shadow} />
      <path className="axo-trunk" d={trunk} />
      {/* Balancement autour du pied du tronc, déphasé d'un arbre à l'autre. */}
      <g className="axo-canopy" style={{ transformOrigin: `${shadow.cx}px ${shadow.cy}px`, animationDelay: `${-(Math.abs(shadow.cx * 7 + shadow.cy) % 9).toFixed(1)}s` }}>
        <path className="axo-crown" d={crown} />
        <path className="axo-branches" d={branches} />
        <path className="axo-tufts" d={tufts} />
      </g>
    </g>;
  }
  if (box.kind === 'gable') {
    const { north, south, east, roof } = gableFaces(box);
    return <g className="axo-box axo-gable">
      <polygon className="axo-face-top" points={north} />
      <polygon className="axo-face-x" points={east} />
      <polygon className="axo-face-y" points={south} />
      <polygon className="axo-roof" points={roof} />
      <path className="axo-windows" d={facadeWindows(box)} />
    </g>;
  }
  return <g className={`axo-box axo-${box.kind}`}>
    <Faces box={box} />
    {box.kind === 'tub' && <polygon className="axo-tub-basin" points={tubBasin(box)} />}
    {box.kind === 'building' && <path className="axo-windows" d={facadeWindows(box)} />}
  </g>;
}

export function Covering({ surface }: { surface: Surface }) {
  const { outline, lines, fills } = surfaceShapes(surface);
  return <g className={`axo-surface axo-${surface.kind}`}>
    {outline && <polygon points={outline} />}
    {lines && <path d={lines} />}
    {fills && <path className="axo-surface-fill" d={fills} />}
  </g>;
}
