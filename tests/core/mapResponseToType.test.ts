import { describe, it, expect } from "vitest";
import { generateResponseType } from "../../src";
import type { apiResponse } from "../../src/core/callSuppliedApi";
import {clear} from "console";

describe("generateResponseType", () => {
    it("generates a type alias for an array of objects", () => {
        const resp: apiResponse = {
            responseStatus: "OK",
            responseCode: 200,
            responseBody: [
                { foo: 1, bar: "baz" },
                { foo: 2, bar: "buz" }
            ]
        };
        const out = generateResponseType(resp, "Countries");
        expect(out).toContain("type Countries = {");
        expect(out).toContain("foo: number;");
        expect(out).toContain("bar: string;");
        expect(out).toContain("}[];");
    });

    it("generates a type alias for an object", () => {
        const resp: apiResponse = {
            responseStatus: "OK",
            responseCode: 200,
            responseBody: { hello: "world", num: 42, nest: { q: true } }
        };
        const out = generateResponseType(resp, "Root");
        expect(out).toContain("type Root = {");
        expect(out).toContain("hello: string;");
        expect(out).toContain("num: number;");
        expect(out).toContain("};");
    });

    it("handles a primitive value field by inferring field type", () => {
        const num: apiResponse = {
            responseStatus: "OK",
            responseCode: 200,
            responseBody: { test: 42 }
        };
        const outNum = generateResponseType(num, "Num");
        expect(outNum).toContain("type Num = {");
        expect(outNum).toContain("test: number;");
        expect(outNum).toContain("};");

        const str: apiResponse = {
            responseStatus: "OK",
            responseCode: 200,
            responseBody: { test: "x" }
        };
        const outStr = generateResponseType(str, "Str");
        expect(outStr).toContain("type Str = {");
        expect(outStr).toContain("test: string;");
        expect(outStr).toContain("};");

        const bool: apiResponse = {
            responseStatus: "OK",
            responseCode: 200,
            responseBody: { test: true }
        };
        const outBool = generateResponseType(bool, "Boo");
        expect(outBool).toContain("type Boo = {");
        expect(outBool).toContain("test: boolean;");
        expect(outBool).toContain("};");
    });

    it("handles null root by throwing", () => {
        const resp: apiResponse = {
            responseStatus: "OK",
            responseCode: 200,
            responseBody: undefined
        };
        expect(() => generateResponseType(resp, "Nil")).toThrow();
    });

    it("handles empty array root", () => {
        const resp: apiResponse = {
            responseStatus: "OK",
            responseCode: 200,
            responseBody: []
        };
        const out = generateResponseType(resp, "E");
        expect(out).toContain("type E = any[];");
    });

    it("handles nested arrays", () => {
        const resp: apiResponse = {
            responseStatus: "OK",
            responseCode: 200,
            responseBody: [[{ foo: 1 }]]
        };
        const out = generateResponseType(resp, "Deep");
        expect(out).toContain("type Deep = {");
        expect(out).toContain("foo: number;");
        expect(out).toContain("}[][];");
    });
});
