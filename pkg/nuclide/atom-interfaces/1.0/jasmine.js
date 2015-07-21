/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*eslint-disable jasmine/no-disabled-tests, no-unused-vars */

// Type declarations for Jasmine v1.3
// https://jasmine.github.io/1.3/introduction.html

type JasmineMatcher = {
  not: JasmineMatcher;
  toBe(expected: mixed): boolean;
  toContain(item: mixed): boolean;
  toBeCloseTo(expected: number, precision: number): boolean;
  toBeDefined(): boolean;
  toBeFalsy(): boolean;
  toBeGreaterThan(expected: number): boolean;
  toBeLessThan(expected: number): boolean;
  toBeNull(): boolean;
  toBeUndefined(): boolean;
  toEqual(expected: mixed): boolean;
  toHaveBeenCalled(): boolean;
  toHaveBeenCalledWith(...args: Array<mixed>): boolean;
  toMatch(expected: mixed): boolean;
  toThrow(): boolean;
};

// Declaring, describing, and grouping tests
declare function afterEach(func: () => mixed): void;
declare function beforeEach(func: () => mixed): void;
declare function describe(title: string, spec: () => mixed): void;
declare function expect(actual: mixed): JasmineMatcher;
declare function it(title: string, spec: () => mixed): void;

// Disabling Specs and Suites
// https://jasmine.github.io/1.3/introduction.html#section-Disabling_Specs_and_Suites
declare function xdescribe(title: string, spec: () => mixed): void;
declare function xit(title: string, spec: () => mixed): void;

// Spies
// https://jasmine.github.io/1.3/introduction.html#section-Spies
type JasmineSpyCall = {
  args: Array<mixed>;
};

type JasmineSpy = {
  andCallFake(fake: () => mixed): void;
  andCallThrough(): void;
  andReturn<T>(value: T): T;
  callCount: number;
  calls: Array<JasmineSpyCall>;
  identity: string;
  mostRecentCall: JasmineSpyCall;
};

declare function spyOn(object: Object, method: string): JasmineSpy;

// Mocking the JavaScript Clock
// https://jasmine.github.io/1.3/introduction.html#section-Mocking_the_JavaScript_Clock
type JasmineMockClock = {
  tick(milliseconds: number): void;
  useMock(): void;
};

// Asynchronous Support
// https://jasmine.github.io/1.3/introduction.html#section-Asynchronous_Support
declare function runs(func: () => mixed): void;
declare function waitsFor(latchFunction: () => mixed, failureMessage: string, timeout: number): void;

// Jasmine global
declare var jasmine: {
  Clock: JasmineMockClock;
  any(expected: string | Object): mixed;
  createSpy(name?: string): JasmineSpy;
  createSpyObj(name: string, spyNames: Array<string>): mixed;
};
