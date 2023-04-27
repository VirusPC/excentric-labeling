export type RawInfo = {
    x: number,
    y: number,
    labelWidth?: number,  // Optional. If setted, it will override the settings of the computer
    labelHeight?: number, // Optional. If setted, it will override the settings of the computer
    [redundantProp: string]: any,
};

export type LayoutInfo = {
    x: number,
    y: number,
    left: boolean,  // indicate if label on the left or right
    controlPoints: { x: number, y: number }[],
    labelBBox: {
        x: number,
        y: number,
        width: number,
        height: number
    },
    rawInfo: RawInfo
};

// Since the following types facilitate developer to write code but users cannot read param and return types directly
// we remove these helper types
// type GetParamFunc<T> =  () => T;
// type SetParamFunc<T> =  (param: T) => T;
// type GetOrSetParamFunc<T> = GetParamFunc<T> & SetParamFunc<T>;

interface Computer {
    (rawInfos: RawInfo[], cx: number, cy: number, isInfosFiltered?: boolean): LayoutInfo[];
    elementsInLens: (() => RawInfo[]);
    elementsNumInLens: (() => number);
    defaultLabelWidth: (() => number)
    & ((size: number) => Computer);
    defaultLabelHeight: (() => number)
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

/**
 * A dynamic technique to label a neighborhood of objects located around the cursor.
 * Paper link: https://dl.acm.org/doi/abs/10.1145/302979.303148
 * @returns Computed position for each label
 */
export default function excentricLabeling(): Computer {
    let _radius = 20;
    let _maxLabelsNum = 10;
    let _verticallyCoherent = true;
    let _horizontallyCoherent = false;
    let _spaceBetweenLabels = 3;
    let _leftSpace = 20;
    let _rightSpace = 20;
    let _defaultLabelWidth = 20;
    let _defaultLabelHeight = 10;
    let _elementsInLens: RawInfo[] = [];

    const computeExcentricLabelingLayout: Computer = (rawInfos: RawInfo[], cx: number, cy: number, isInfosFiltered: boolean = false) => {
        let filteredRawInfos = rawInfos;
        if (!isInfosFiltered) filteredRawInfos = filterElementsInLens(filteredRawInfos, cx, cy, _radius);
        sortRawInfosByDistance({ x: cx, y: cy }, filteredRawInfos);
        _elementsInLens = filteredRawInfos;
        const filteredRawInfosWithNumLimit = filterElementsWithMaxNumber(filteredRawInfos, _maxLabelsNum);
        const layoutInfos = initLayoutInfos(filteredRawInfosWithNumLimit, _defaultLabelWidth, _defaultLabelHeight);
        computeStartPoints(layoutInfos);
        if (!_verticallyCoherent) computePointsOnLens(layoutInfos, cx, cy, _radius);
        dividedIntoLeftOrRight(layoutInfos, cx, cy);
        computeMiddlePoints(layoutInfos, cx, cy, _radius, _spaceBetweenLabels, _leftSpace, _rightSpace);
        computeEndPoints(layoutInfos, cx, _horizontallyCoherent);
        computeLabelBBox(layoutInfos);
        return layoutInfos;
    }

    function elementsNumInLens(): number {
        return _elementsInLens.length;
    }

    function elementsInLens(): RawInfo[] {
        return _elementsInLens;
    }

    function defaultLabelWidth(): number;
    function defaultLabelWidth(defaultLabelWidth: number): Computer;
    function defaultLabelWidth(defaultLabelWidth?: number) {
        if (defaultLabelWidth === undefined) return _defaultLabelWidth;
        _defaultLabelWidth = defaultLabelWidth;
        return computeExcentricLabelingLayout;
    };

    function defaultLabelHeight(): number;
    function defaultLabelHeight(defaultLabelHeight: number): Computer;
    function defaultLabelHeight(defaultLabelHeight?: number) {
        if (defaultLabelHeight === undefined) return _defaultLabelHeight;
        _defaultLabelHeight = defaultLabelHeight;
        return computeExcentricLabelingLayout;
    };

    function radius(): number;
    function radius(radius: number): Computer;
    function radius(radius?: number) {
        if (radius === undefined) return _radius;
        _radius = radius;
        return computeExcentricLabelingLayout;
    };

    function maxLabelsNum(): number;
    function maxLabelsNum(maxLabelsNum: number): Computer;
    function maxLabelsNum(maxLabelsNum?: number) {
        if (maxLabelsNum === undefined) return _maxLabelsNum;
        _maxLabelsNum = maxLabelsNum;
        return computeExcentricLabelingLayout;
    };

    function verticallyCoherent(): boolean;
    function verticallyCoherent(verticallyCoherent: boolean): Computer;
    function verticallyCoherent(verticallyCoherent?: boolean) {
        if (verticallyCoherent === undefined) return _verticallyCoherent;
        _verticallyCoherent = verticallyCoherent;
        return computeExcentricLabelingLayout;
    };

    function horizontallyCoherent(): boolean;
    function horizontallyCoherent(horizontallyCoherent: boolean): Computer;
    function horizontallyCoherent(horizontallyCoherent?: boolean) {
        if (horizontallyCoherent === undefined) return _horizontallyCoherent;
        _horizontallyCoherent = horizontallyCoherent;
        return computeExcentricLabelingLayout;
    };

    function spaceBetweenLabels(): number;
    function spaceBetweenLabels(spaceBetweenLabels: number): Computer;
    function spaceBetweenLabels(spaceBetweenLabels?: number) {
        if (spaceBetweenLabels === undefined) return _spaceBetweenLabels;
        _spaceBetweenLabels = spaceBetweenLabels;
        return computeExcentricLabelingLayout;
    };

    function leftSpace(): number;
    function leftSpace(leftSpace: number): Computer;
    function leftSpace(leftSpace?: number) {
        if (leftSpace === undefined) return _leftSpace;
        _leftSpace = leftSpace;
        return computeExcentricLabelingLayout;
    };

    function rightSpace(): number;
    function rightSpace(rightSpace: number): Computer;
    function rightSpace(rightSpace?: number) {
        if (rightSpace === undefined) return _rightSpace;
        _rightSpace = rightSpace;
        return computeExcentricLabelingLayout;
    };

    function leftAndRightSpace(): [number, number];
    function leftAndRightSpace(space: number): Computer;
    function leftAndRightSpace(space: [number, number]): Computer;
    function leftAndRightSpace(space?: number | [number, number]) {
        if (space === undefined) return [_leftSpace, _rightSpace];
        if (typeof space === "number") {
            _leftSpace = space;
            _rightSpace = space;
        } else {
            [_spaceBetweenLabels, _rightSpace] = space;
        }
        return computeExcentricLabelingLayout;
    };

    computeExcentricLabelingLayout.elementsNumInLens = elementsNumInLens;
    computeExcentricLabelingLayout.elementsInLens = elementsInLens;
    computeExcentricLabelingLayout.radius = radius;
    computeExcentricLabelingLayout.maxLabelsNum = maxLabelsNum;
    computeExcentricLabelingLayout.defaultLabelWidth = defaultLabelWidth;
    computeExcentricLabelingLayout.defaultLabelHeight = defaultLabelHeight;
    computeExcentricLabelingLayout.verticallyCoherent = verticallyCoherent;
    computeExcentricLabelingLayout.horizontallyCoherent = horizontallyCoherent;
    computeExcentricLabelingLayout.spaceBetweenLabels = spaceBetweenLabels;
    computeExcentricLabelingLayout.leftSpace = leftSpace;
    computeExcentricLabelingLayout.rightSpace = rightSpace;
    computeExcentricLabelingLayout.leftAndRightSpace = leftAndRightSpace;

    return computeExcentricLabelingLayout;
}

/**
 * RNN Search
 */
function filterElementsInLens(rawInfos: RawInfo[], cx: number, cy: number, r: number) {
    return rawInfos.filter(rawInfo => Math.sqrt((rawInfo.x - cx) ** 2 + (rawInfo.y - cy) ** 2) <= r);
}

function filterElementsWithMaxNumber(rawInfos: RawInfo[], maxLabelsNum: number) {
    return rawInfos.slice(0, maxLabelsNum);
}

function initLayoutInfos(rawInfos: RawInfo[], _defaultLabelWidth: number, _defaultLabelHeight: number): LayoutInfo[] {
    return rawInfos.map((rawInfo) => initLayoutInfo(rawInfo, _defaultLabelWidth, _defaultLabelHeight));
}

function initLayoutInfo(rawInfo: RawInfo, _defaultLabelWidth: number, _defaultLabelHeight: number): LayoutInfo {
    const { x, y, labelWidth: defaultLabelWidth, labelHeight: defaultLabelHeight } = rawInfo
    return {
        x, y,
        //name: labelName,
        controlPoints: [],
        left: true,
        labelBBox: {
            x: 0,
            y: 0,
            width: defaultLabelWidth ?? _defaultLabelWidth,
            height: defaultLabelHeight ?? _defaultLabelHeight,
        },
        rawInfo: rawInfo
    }
}

function computeStartPoints(layoutInfos: LayoutInfo[]) {
    for (const layoutInfo of layoutInfos) {
        layoutInfo.controlPoints.push({
            x: layoutInfo.x,
            y: layoutInfo.y,
        });
    }
}

function computePointsOnLens(layoutInfos: LayoutInfo[], cx: number, cy: number, r: number): void {
    for (const layoutInfo of layoutInfos) {
        const startPoint = layoutInfo.controlPoints[0];
        if (startPoint === undefined) throw Error("no start points");
        const rad = Math.atan2(startPoint.y - cy, startPoint.x - cx);
        const endPoint = {
            x: cx + r * Math.cos(rad),
            y: cy + r * Math.sin(rad)
        }
        layoutInfo.controlPoints.push(endPoint);
    }
}

function computeMiddlePoints(layoutInfos: LayoutInfo[], cx: number, cy: number, r: number, spaceBetweenLabels: number, leftSpace: number, rightSpace: number): void {
    const sortAccordingY = (li1: LayoutInfo, li2: LayoutInfo) => li1.controlPoints[li1.controlPoints.length - 1].y - li2.controlPoints[li2.controlPoints.length - 1].y;
    const computeSpaceHeight = (layoutInfos: LayoutInfo[], spaceBetweenLabels: number) => layoutInfos.reduce((acc, layoutInfo) => acc + layoutInfo.labelBBox.height, 0) + spaceBetweenLabels * (layoutInfos.length - 1);

    const layoutInfosLeft: LayoutInfo[] = [];
    const layoutInfosRight: LayoutInfo[] = [];
    layoutInfos.forEach(layoutInfo => layoutInfo.left ? layoutInfosLeft.push(layoutInfo) : layoutInfosRight.push(layoutInfo));

    if (layoutInfosLeft.length > 0) computeOneSide(layoutInfosLeft, spaceBetweenLabels, true);
    if (layoutInfosRight.length > 0) computeOneSide(layoutInfosRight, spaceBetweenLabels, false);

    function computeOneSide(layoutInfosOneSide: LayoutInfo[], spaceBetweenLabels: number, left: boolean) {
        layoutInfosOneSide.sort(sortAccordingY);
        const spaceHeight = computeSpaceHeight(layoutInfosOneSide, spaceBetweenLabels);
        let labelY = cy - (spaceHeight / 2)
        layoutInfosOneSide.forEach((layoutInfo, i, layoutInfos) => {
            if (i !== 0) {
                labelY += layoutInfos[i - 1].labelBBox.height + spaceBetweenLabels;
            }
            layoutInfo.controlPoints.push({
                x: left ? cx - r - leftSpace : cx + r + rightSpace,
                y: labelY + (layoutInfo.labelBBox.height >> 1)
            });
        });
    }
}

function computeEndPoints(layoutInfos: LayoutInfo[], cx: number, horizontallyCoherent: boolean): void {
    const computeMaxLabelWidth = (layoutInfos: LayoutInfo[]) => Math.max(...layoutInfos.map(layoutInfo => layoutInfo.labelBBox.width));
    const layoutInfosLeft: LayoutInfo[] = [];
    const layoutInfosRight: LayoutInfo[] = [];
    layoutInfos.forEach(layoutInfo => layoutInfo.left ? layoutInfosLeft.push(layoutInfo) : layoutInfosRight.push(layoutInfo));

    if (layoutInfosLeft.length > 0) computeOneSide(layoutInfosLeft, true);
    if (layoutInfosRight.length > 0) computeOneSide(layoutInfosRight, false);
    if (horizontallyCoherent) moveHorizontally(layoutInfos);

    function computeOneSide(layoutInfosOneSide: LayoutInfo[], left: boolean) {
        const maxWidth = computeMaxLabelWidth(layoutInfosOneSide);
        layoutInfosOneSide.forEach(layoutInfo => {
            const controlPointsNum = layoutInfo.controlPoints.length;
            const middleControlPoint = layoutInfo.controlPoints[controlPointsNum - 1];
            const space = maxWidth - layoutInfo.labelBBox.width;
            layoutInfo.controlPoints.push({
                x: middleControlPoint.x + (left ? -(space) : 0),
                y: middleControlPoint.y,
            })
        });
    }
    function moveHorizontally(layoutInfos: LayoutInfo[]) {
        layoutInfos.forEach(layoutInfo => {
            const endControlPoint = layoutInfo.controlPoints[layoutInfo.controlPoints.length - 1];
            endControlPoint.x += layoutInfo.x - cx;
        })
    }
}

function dividedIntoLeftOrRight(layoutInfos: LayoutInfo[], cx: number, cy: number) {
    layoutInfos.forEach(layoutInfo => {
        layoutInfo.left = layoutInfo.x < cx;
    });
}

function computeLabelBBox(layoutInfos: LayoutInfo[]) {
    layoutInfos.forEach(layoutInfo => {
        const bbox = layoutInfo.labelBBox;
        const lastControlPoint = layoutInfo.controlPoints[layoutInfo.controlPoints.length - 1];
        bbox.x = lastControlPoint.x + (layoutInfo.left ? -bbox.width : 0);
        bbox.y = lastControlPoint.y - (layoutInfo.labelBBox.height >> 1);
    });
}


function sortRawInfosByDistance(center: { x: number, y: number }, points: RawInfo[]): RawInfo[] {
    points.sort((point1, point2) => distance(center, point1) - distance(center, point2));
    return points;
}

function distance(point1: { x: number, y: number }, point2: { x: number, y: number }) {
    return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
}