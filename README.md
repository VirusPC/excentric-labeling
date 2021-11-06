# Excentric Labeling

A layout algorithm about excentric labeling.

Paper link: https://dl.acm.org/doi/abs/10.1145/302979.303148

![demo](https://github.com/viruspc/excentric-labeling/blob/gh-pages/readme-images/demo.png)

## Usage

### Example

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

### Input

`RawInfo[]`, the position of points. User can specify the width and/or height for the point. Otherwise, the algorithm will use the width and height from settings: `computor.labelWidth(20)`, `computor.labelHeight(10)`.

```ts
type RawInfo = {
    x: number,
    y: number,
    labelWidth?: number,
    labelHeight?: number,
    [redundantProp: string]: any,
};
```

### Output:

`LayoutInfo[]`

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

## API

After the computor is created, users can configure it or get configuration information through the following API. If you provide no paramter, it will return the corresponding setting's value. Otherwise, it will set the corresponding setting's value with the given parameter, and return the computor itself to facilitate method chaining.

```ts
interface Computor {
    (rawInfos: RawInfo[], cx: number, cy: number): LayoutInfo[];
    labelWidth: (() => number)
        & ((size: number) => Computor);
    labelHeight: (() => number)
        & ((size: number) => Computor);
    radius: (() => number)
        & ((radius: number) => Computor);
    maxLabelsNum: (() => number)
        & ((maxLabelsNum: number) => Computor);
    verticallyCoherent: (() => boolean)
        & ((verticallyCoherent: boolean) => Computor);
    horizontallyCoherent: (() => boolean)
        & ((horizontallyCoherent: boolean) => Computor);
    spaceBetweenLabels: (() => number)
        & ((spaceBetweenLabels: number) => Computor);
    leftSpace: (() => number)
        & ((space: number) => Computor);
    rightSpace: (() => number)
        & ((space: number) => Computor);
    leftAndRightSpace: (() => [number, number])
        & ((space: number) => Computor) 
        & ((space: [number, number]) => Computor);
}
```

## Notes

Be aware that the order will be changed
