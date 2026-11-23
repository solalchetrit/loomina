/* Généré par gamification/memo/v2/sprites-ts.py : la taille de chaque dessin de Mémo (px), et où il tient la lumière du souvenir (pose f). */
type Sprite = { w: number; h: number; orb?: [number, number] };
type Poses = Record<"a" | "b" | "c" | "d" | "e" | "f" | "g" | "h", Sprite>;

export const MEMO_SPRITES: Record<1 | 2 | 3 | 4 | 5, Poses> = {
  1: { a: { w: 305, h: 328 }, b: { w: 305, h: 328 }, c: { w: 308, h: 337 }, d: { w: 332, h: 270 }, e: { w: 313, h: 350 }, f: { w: 360, h: 336, orb: [0.837, 0.216] }, g: { w: 320, h: 337 }, h: { w: 308, h: 342 } },
  2: { a: { w: 371, h: 371 }, b: { w: 371, h: 371 }, c: { w: 354, h: 375 }, d: { w: 374, h: 380 }, e: { w: 357, h: 394 }, f: { w: 396, h: 389, orb: [0.866, 0.285] }, g: { w: 371, h: 401 }, h: { w: 372, h: 388 } },
  3: { a: { w: 367, h: 402 }, b: { w: 367, h: 402 }, c: { w: 384, h: 393 }, d: { w: 387, h: 398 }, e: { w: 351, h: 407 }, f: { w: 388, h: 416, orb: [0.844, 0.153] }, g: { w: 403, h: 444 }, h: { w: 373, h: 406 } },
  4: { a: { w: 365, h: 414 }, b: { w: 365, h: 414 }, c: { w: 368, h: 389 }, d: { w: 368, h: 407 }, e: { w: 349, h: 427 }, f: { w: 397, h: 424, orb: [0.855, 0.173] }, g: { w: 366, h: 432 }, h: { w: 377, h: 424 } },
  5: { a: { w: 327, h: 438 }, b: { w: 327, h: 438 }, c: { w: 404, h: 397 }, d: { w: 342, h: 409 }, e: { w: 331, h: 451 }, f: { w: 397, h: 454, orb: [0.843, 0.144] }, g: { w: 367, h: 456 }, h: { w: 349, h: 441 } },
};
