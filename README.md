# Excentric Labeling

A layout algorithm about excentric labeling. Given

Paper link: https://dl.acm.org/doi/abs/10.1145/302979.303148

## Usage

Input: `RawInfo[]`
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
    controlPoints: ControlPoint[],
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

Be aware that the order will changed.

type ControlPoint = { x: number, y: number };
