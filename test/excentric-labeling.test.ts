import { expect } from "@jest/globals";
import excentricLabeling from "../src/index";
import { RawInfo } from "../src/excentric-labeling";

const screenWidth = 1000;
const screenHeight= 1000;
const testData = generateTestData(screenWidth, screenHeight, 1000);

test("test import", () => {
    expect(typeof excentricLabeling).toBe('function');
    expect(typeof excentricLabeling()).toBe('function');
})

test("test verticallyCoherent", () => {
    const a = excentricLabeling();
    a.verticallyCoherent(true);
    expect(a.verticallyCoherent()).toBe(true);
    a.verticallyCoherent(false);
    expect(a.verticallyCoherent()).toBe(false);
})

test("test equivalent", () => {
    const a = excentricLabeling();
    a.verticallyCoherent(true);
    const b = excentricLabeling();
    b.verticallyCoherent(false);
    expect(a.verticallyCoherent()).toBe(true);
})

test("test order", () => {
    const computor = excentricLabeling();
    computor.radius(500);
    const queryPoint = {x: 500, y: 500};
    const results = computor(testData, queryPoint.x, queryPoint.y) as any;
    const dists = results.map((a: any) => distance(queryPoint, a));
    const dists2 = [...dists].sort();
    console.log(dists);
    expect(dists).toEqual(dists2);
    
})

function generateTestData(width: number, height: number, size: number): RawInfo[] {
    const rawInfos: RawInfo[] = [];
    for (let i = 0; i < size; ++i) {
        rawInfos.push({
            x: getRandomIntInclusive(0, width),
            y: getRandomIntInclusive(0, height),
            label: i.toString(),
            labelWidth: 30,
            labelHeight: 10
        });
    }
    return rawInfos;
}


function getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function distance(point1: { x: number, y: number }, point2: { x: number, y: number }) {
    return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
}