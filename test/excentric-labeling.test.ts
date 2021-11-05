import { expect } from "@jest/globals";
import excentricLabeling from "../src/index";

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

function a({a:a}){}