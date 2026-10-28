import type { Box, BoxKind } from './types';

// Volume simple posé au sol (ou suspendu avec z0).
export const item = (kind: BoxKind, tag: string, x0: number, y0: number, x1: number, y1: number, z1: number, z0 = 0): Box =>
  ({ kind, tag, min: [x0, y0, z0], max: [x1, y1, z1] });
