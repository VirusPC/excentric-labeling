import { expect } from "@jest/globals";
import excentricLabeling from "../src/index";

test("test import", () => {
    expect(typeof excentricLabeling).toBe('function');
    expect(typeof excentricLabeling()).toBe('function');
})