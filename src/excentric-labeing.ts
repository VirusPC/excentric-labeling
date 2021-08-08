type RawInfo = {
    x: number,
    y: number,
    //labelName: string,
    labelWidth: number,
    labelHeight: number
};

type ControlPoint = { x: number, y: number };

type LayoutInfo = {
    x: number,
    y: number,
    //name: string,
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

export default function exentricLabeling() {
    let maxLabelsNum = 10;
    let radius = 20;
    let verticallyCoherent = true;
    let horizontallyCoherent = false;
    let rawInfos: RawInfo[] = [];
    let labelsSpace = 3;
    let leftSpace = 20;
    let rightSpace = 20;

    function computeExentricLabelingLayout(cx: number, cy: number): LayoutInfo[] {
        let filteredRawInfos = filterObjInLens(rawInfos, cx, cy, radius);
        filteredRawInfos = filterObjWithMaxNumber(filteredRawInfos, maxLabelsNum);
        const layoutInfos = initLayoutInfos(filteredRawInfos);
        computeStartPoints(layoutInfos);
        if (!verticallyCoherent) {
            computePointsOnLens(layoutInfos, cx, cy, radius);
        }
        dividedIntoLeftOrRight(layoutInfos, cx, cy);
        computeMiddlePoints(layoutInfos, cx, cy, radius, labelsSpace, leftSpace, rightSpace);
        computeEndPoints(layoutInfos, cx, horizontallyCoherent);
        computeLabelBBox(layoutInfos);
        return layoutInfos;
    }

    computeExentricLabelingLayout.verticallyCoherent = function (_?: boolean) {
        if (_ !== undefined) {
            verticallyCoherent = _;
            return computeExentricLabelingLayout;
        }
        return verticallyCoherent;
    };
    computeExentricLabelingLayout.horizontallyCoherent = (_: boolean) => {
        if (_ !== undefined) {
            horizontallyCoherent = _;
            return computeExentricLabelingLayout;
        }
        return verticallyCoherent;
    };
    computeExentricLabelingLayout.radial = (_: boolean) => {
        if (_ !== undefined) {
            verticallyCoherent = !_;
            return computeExentricLabelingLayout;
        }
        return verticallyCoherent;
    };
    computeExentricLabelingLayout.maxLabelsNum = (_: number) => {
        if (_ !== undefined) {
            maxLabelsNum = _;
            return computeExentricLabelingLayout;
        }
        return maxLabelsNum;
    };
    computeExentricLabelingLayout.radius = (_: number) => {
        if (_ !== undefined) {
            radius = _;
            return computeExentricLabelingLayout;
        }
        return radius;
    };
    computeExentricLabelingLayout.rawInfos = (_: RawInfo[]) => {
        if (_ !== undefined) {
            rawInfos = _;
            return computeExentricLabelingLayout;
        }
        return rawInfos;
    };
    computeExentricLabelingLayout.labelsSpace = (_: number) => {
        if (_ !== undefined) {
            labelsSpace = _;
            return computeExentricLabelingLayout;
        }
        return labelsSpace;
    };
    computeExentricLabelingLayout.leftSpace = (_: number) => {
        if (_ !== undefined) {
            leftSpace = _;
            return computeExentricLabelingLayout;
        }
        return labelsSpace
    };
    computeExentricLabelingLayout.rightSpace = (_: number) => {
        if (_ !== undefined) {
            rightSpace = _;
            return computeExentricLabelingLayout;
        }
        return rightSpace;
    };
    computeExentricLabelingLayout.leftAndRightSpace = (_: number) => {
        if (_ !== undefined) {
            rightSpace = _;
            leftSpace = _;
            return computeExentricLabelingLayout;
        }
        return [leftSpace, rightSpace];
    };

    return computeExentricLabelingLayout;
}

function filterObjInLens(rawInfos: RawInfo[], cx: number, cy: number, r: number) {
    return rawInfos.filter(rawInfo => Math.sqrt((rawInfo.x - cx) ** 2 + (rawInfo.y - cy) ** 2) <= r);
}

function filterObjWithMaxNumber(rawInfos: RawInfo[], maxLabelsNum: number) {
    return rawInfos.slice(0, maxLabelsNum);
}

function initLayoutInfos(rawInfos: RawInfo[]): LayoutInfo[] {
    return rawInfos.map(initLayoutInfo);
}

function initLayoutInfo(rawInfo: RawInfo): LayoutInfo {
    const { x, y, labelWidth, labelHeight } = rawInfo
    return {
        x, y,
        //name: labelName,
        controlPoints: [],
        left: true,
        labelBBox: {
            x: 0, y: 0, width: labelWidth, height: labelHeight,
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

function computeMiddlePoints(layoutInfos: LayoutInfo[], cx: number, cy: number, r: number, labelsSpace: number, leftSpace: number, rightSpace: number): void {
    const sortAccordingY = (li1: LayoutInfo, li2: LayoutInfo) => li1.controlPoints[li1.controlPoints.length - 1].y - li2.controlPoints[li2.controlPoints.length - 1].y;
    const computeSpaceHeight = (layoutInfos: LayoutInfo[], labelsSpace: number) => layoutInfos.reduce((acc, layoutInfo) => acc + layoutInfo.labelBBox.height, 0) + labelsSpace * (layoutInfos.length - 1);

    const layoutInfosLeft: LayoutInfo[] = [];
    const layoutInfosRight: LayoutInfo[] = [];
    layoutInfos.forEach(layoutInfo => layoutInfo.left ? layoutInfosLeft.push(layoutInfo) : layoutInfosRight.push(layoutInfo));

    if (layoutInfosLeft.length > 0) computeOneSide(layoutInfosLeft, labelsSpace, true);
    if (layoutInfosRight.length > 0) computeOneSide(layoutInfosRight, labelsSpace, false);

    function computeOneSide(layoutInfosOneSide: LayoutInfo[], labelsSpace: number, left: boolean) {
        layoutInfosOneSide.sort(sortAccordingY);
        const spaceHeight = computeSpaceHeight(layoutInfosOneSide, labelsSpace);
        let labelY = cy - (spaceHeight / 2)
        layoutInfosOneSide.forEach((layoutInfo, i, layoutInfos) => {
            if (i !== 0) {
                labelY += layoutInfos[i - 1].labelBBox.height + labelsSpace;
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
