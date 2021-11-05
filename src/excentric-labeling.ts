type RawInfo = {
    x: number,
    y: number,
    labelWidth?: number,  // Optional. If setted, it will override the settings of the computor
    labelHeight?: number, // Optional. If setted, it will override the settings of the computor
    [redundantProp: string]: any,
};

type ControlPoint = { x: number, y: number };

type LayoutInfo = {
    x: number,
    y: number,
    left: boolean,  // indicate if label on the left or right
    controlPoints: ControlPoint[],
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

/**
 * A dynamic technique to label a neighborhood of objects located around the cursor.
 * Paper link: https://dl.acm.org/doi/abs/10.1145/302979.303148
 * @returns Computed position for each label
 */
export default function excentricLabeling(): Computor {
    let _radius = 20;
    let _maxLabelsNum = 10;
    let _verticallyCoherent = true;
    let _horizontallyCoherent = false;
    let _spaceBetweenLabels = 3;
    let _leftSpace = 20;
    let _rightSpace = 20;
    let _labelWidth = 20;
    let _labelHeight = 10;

    const computeExcentricLabelingLayout: Computor = (rawInfos: RawInfo[], cx: number, cy: number) => {
        let filteredRawInfos = filterObjInLens(rawInfos, cx, cy, _radius);
        filteredRawInfos = filterObjWithMaxNumber(filteredRawInfos, _maxLabelsNum);
        const layoutInfos = initLayoutInfos(filteredRawInfos, _labelWidth, _labelHeight);
        computeStartPoints(layoutInfos);
        if (!_verticallyCoherent) {
            computePointsOnLens(layoutInfos, cx, cy, _radius);
        }
        dividedIntoLeftOrRight(layoutInfos, cx, cy);
        computeMiddlePoints(layoutInfos, cx, cy, _radius, _spaceBetweenLabels, _leftSpace, _rightSpace);
        computeEndPoints(layoutInfos, cx, _horizontallyCoherent);
        computeLabelBBox(layoutInfos);
        return layoutInfos;
    }

    function labelWidth(): number;
    function labelWidth(labelWidth: number): Computor;
    function labelWidth(labelWidth?: number) {
        if (labelWidth === undefined) return _labelWidth;
        _labelWidth = labelWidth;
        return computeExcentricLabelingLayout;
    };

    function labelHeight(): number;
    function labelHeight(labelHeight: number): Computor;
    function labelHeight(labelHeight?: number) {
        if (labelHeight === undefined) return _labelHeight;
        _labelHeight = labelHeight;
        return computeExcentricLabelingLayout;
    };

    function radius(): number;
    function radius(radius: number): Computor;
    function radius(radius?: number) {
        if (radius === undefined) return _radius;
        _radius = radius;
        return computeExcentricLabelingLayout;
    };

    function maxLabelsNum(): number;
    function maxLabelsNum(maxLabelsNum: number): Computor;
    function maxLabelsNum(maxLabelsNum?: number) {
        if (maxLabelsNum === undefined) return _maxLabelsNum;
        _maxLabelsNum = maxLabelsNum;
        return computeExcentricLabelingLayout;
    };

    function verticallyCoherent(): boolean;
    function verticallyCoherent(verticallyCoherent: boolean): Computor;
    function verticallyCoherent(verticallyCoherent?: boolean) {
        if (verticallyCoherent === undefined) return _verticallyCoherent;
        _verticallyCoherent = verticallyCoherent;
        return computeExcentricLabelingLayout;
    };

    function horizontallyCoherent(): boolean;
    function horizontallyCoherent(horizontallyCoherent: boolean): Computor;
    function horizontallyCoherent(horizontallyCoherent?: boolean) {
        if (horizontallyCoherent === undefined) return _horizontallyCoherent;
        _horizontallyCoherent = horizontallyCoherent;
        return computeExcentricLabelingLayout;
    };

    function spaceBetweenLabels(): number;
    function spaceBetweenLabels(spaceBetweenLabels: number): Computor;
    function spaceBetweenLabels(spaceBetweenLabels?: number) {
        if (spaceBetweenLabels === undefined) return _spaceBetweenLabels;
        _spaceBetweenLabels = spaceBetweenLabels;
        return computeExcentricLabelingLayout;
    };

    function leftSpace(): number;
    function leftSpace(leftSpace: number): Computor;
    function leftSpace(leftSpace?: number) {
        if (leftSpace === undefined) return _leftSpace;
        _leftSpace = leftSpace;
        return computeExcentricLabelingLayout;
    };

    function rightSpace(): number;
    function rightSpace(rightSpace: number): Computor;
    function rightSpace(rightSpace?: number) {
        if (rightSpace === undefined) return _rightSpace;
        _rightSpace = rightSpace;
        return computeExcentricLabelingLayout;
    };

    function leftAndRightSpace(): [number, number];
    function leftAndRightSpace(space: number): Computor;
    function leftAndRightSpace(space: [number, number]): Computor;
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

    computeExcentricLabelingLayout.radius = radius;
    computeExcentricLabelingLayout.maxLabelsNum = maxLabelsNum;
    computeExcentricLabelingLayout.labelWidth = labelWidth;
    computeExcentricLabelingLayout.labelHeight = labelHeight;
    computeExcentricLabelingLayout.verticallyCoherent = verticallyCoherent;
    computeExcentricLabelingLayout.horizontallyCoherent = horizontallyCoherent;
    computeExcentricLabelingLayout.spaceBetweenLabels = spaceBetweenLabels;
    computeExcentricLabelingLayout.leftSpace = leftSpace;
    computeExcentricLabelingLayout.rightSpace = rightSpace;
    computeExcentricLabelingLayout.leftAndRightSpace = leftAndRightSpace;

    return computeExcentricLabelingLayout;
}

function filterObjInLens(rawInfos: RawInfo[], cx: number, cy: number, r: number) {
    return rawInfos.filter(rawInfo => Math.sqrt((rawInfo.x - cx) ** 2 + (rawInfo.y - cy) ** 2) <= r);
}

function filterObjWithMaxNumber(rawInfos: RawInfo[], maxLabelsNum: number) {
    return rawInfos.slice(0, maxLabelsNum);
}

function initLayoutInfos(rawInfos: RawInfo[], _labelWidth: number, _labelHeight: number): LayoutInfo[] {
    return rawInfos.map((rawInfo) => initLayoutInfo(rawInfo, _labelWidth, _labelHeight));
}

function initLayoutInfo(rawInfo: RawInfo, _labelWidth: number, _labelHeight: number): LayoutInfo {
    const { x, y, labelWidth, labelHeight } = rawInfo
    return {
        x, y,
        //name: labelName,
        controlPoints: [],
        left: true,
        labelBBox: {
            x: 0,
            y: 0,
            width: labelWidth ?? _labelWidth,
            height: labelHeight ?? _labelHeight,
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
