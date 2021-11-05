# Excentric Labeling

A layout algorithm about excentric labeling.

Paper link: https://dl.acm.org/doi/abs/10.1145/302979.303148

## Usage

Example:

```ts
import excentricLabeling from "excent";

declare const rawData: RawInfo[];
declare const x: number;
declare const y: number;

const computor: Computor = excentricLabeling();
computor.labelWidth(20)
    .labelHeight(5)
    .radius(10)

const result= computor(rawData, x, y)
```

Input: `RawInfo[]`, the position of points. User can specify the width and/or height for the point. Otherwise, the algorithm will use the width and height from settings: `computor.labelWidth(20)`, `computor.labelHeight(10)`.

```ts
type RawInfo = {
    x: number,
    y: number,
    labelWidth?: number,
    labelHeight?: number,
    [redundantProp: string]: any,
};
```

Output: `LayoutInfo[]`

```ts
type LayoutInfo = {
    x: number,
    y: number,
    left: boolean,
    controlPoints: {x: number, y: number}[],
    labelBBox: {
        x: number,
        y: number,
        width: number,
        height: number
    },
    rawInfo: RawInfo
};
```

## Notes

Be aware that the order will be changed
