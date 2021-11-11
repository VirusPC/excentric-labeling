# Excentric Labeling

[![](https://img.shields.io/npm/l/excentric-labeling?registry_uri=https%3A%2F%2Fregistry.npmjs.com)](https://github.com/VirusPC/excentric-labeling/blob/master/LICENSE)

## Introduction

**Excentric Labeling** is a labeling technique, which is presented by [Jean-Daniel Fekete](https://scholar.google.com/citations?user=PMZ3h7sAAAAJ&hl=en&oi=sra) and [Catherine Plaisant](https://scholar.google.com/citations?user=VnwWgwIAAAAJ&hl=en&oi=sra) in this [paper](https://dl.acm.org/doi/abs/10.1145/302979.303148). In this repository, we implement the layout algorithm about it.

![demo](https://raw.githubusercontent.com/VirusPC/excentric-labeling/master/readme-images/demo.png)

## Installation

### Browser

```html
<script src="https://unpkg.com/excentric-labeling@3.0.0/dist/index.js"></script>
```

Then anywhere in your JavaScript code.

`js
const excentricLabeling = window.excentricLabeling
`

### Via NPM

`npm i excentric-labeling`

Then anywhere in your code.

```js
import excentricLabeling from "excentricLabeling"
```

OR

```js
const excentricLabeling = require("excentric-labeling");
```

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
interface Computer {
    // if isInfosFiltered equals true, then computer will filter out the elements outside the lens
    (rawInfos: RawInfo[], cx: number, cy: number, isInfosFiltered: boolean): LayoutInfo[];
    elementsNumInLens: (() => number);
    labelWidth: (() => number)
        & ((size: number) => Computer);
    labelHeight: (() => number)
        & ((size: number) => Computer);
    radius: (() => number)
        & ((radius: number) => Computer);
    maxLabelsNum: (() => number)
        & ((maxLabelsNum: number) => Computer);
    verticallyCoherent: (() => boolean)
        & ((verticallyCoherent: boolean) => Computer);
    horizontallyCoherent: (() => boolean)
        & ((horizontallyCoherent: boolean) => Computer);
    spaceBetweenLabels: (() => number)
        & ((spaceBetweenLabels: number) => Computer);
    leftSpace: (() => number)
        & ((space: number) => Computer);
    rightSpace: (() => number)
        & ((space: number) => Computer);
    leftAndRightSpace: (() => [number, number])
        & ((space: number) => Computer) 
        & ((space: [number, number]) => Computer);
}

```

## Notes

Be aware that the order will be changed
