'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import fs from 'fs';
import {addMatchers} from 'nuclide-test-helpers';
import parseServiceDefinition from '../lib/service-parser';
import path from 'path';
import type {Definition} from '../lib/types.js';

describe('Nuclide service parser test suite.', () => {
  beforeEach(function() {
    addMatchers(this);
  });

  for (const file of fs.readdirSync(path.join(__dirname, 'fixtures'))) {
    if (file.endsWith('.def')) {
      it(`Successfully parses ${file}`, () => {
        const fixturePath = path.join(__dirname, 'fixtures', file);
        const code = fs.readFileSync(fixturePath, 'utf8');
        const expected = JSON.parse(
          fs.readFileSync(path.join(__dirname, 'fixtures', file) + '.json', 'utf8'));
        const definitions = parseServiceDefinition(file, code);
        expect(mapDefinitions(definitions)).diffJson(expected);
      });
    }
  }

  it('duplicate global definitions throw', () => {
    const code = `
      export function f(): void {}
      export class f {
        m(): void {}
      }`;
    expect(() => {
      parseServiceDefinition('fileName', code);
    }).toThrow();
  });

  it('duplicate member definitions throw', () => {
    const code = `
      export class f {
        m(): void {}
        m(): void {}
      }`;
    expect(() => {
      parseServiceDefinition('fileName', code);
    }).toThrow();
  });

  it('Missing type definitions throw', () => {
    const code = `
      export class f {
        m(): Promise<MissingType> {}
      }`;
    expect(() => {
      parseServiceDefinition('fileName', code);
    }).toThrow();
  });

  it('More missing type definitions throw', () => {
    const code = `
      export class f {
        static m(): Observable<Map<string, {f: [string, ?Set<Array<MissingType>>]}>> {}
      }`;
    expect(() => {
      parseServiceDefinition('fileName', code);
    }).toThrow();
  });

  it('Missing types in functions throw', () => {
    const code = `
      export type UsesMissingType = {
        f: MissingType;
      };
      export function f(p: UsesMissingType): void {}
      `;
    expect(() => {
      parseServiceDefinition('fileName', code);
    }).toThrow();
  });

  it('Missing types in ctor args throw', () => {
    const code = `
      export class C {
        constructor(p: MissingType) {}
      }`;
    expect(() => {
      parseServiceDefinition('fileName', code);
    }).toThrow();
  });

  it('User defined type conflicting with builtin', () => {
    const code = `
      export class Object {
        constructor() {}
      }`;
    expect(() => {
      parseServiceDefinition('fileName', code);
    }).toThrow();
  });

  it('Promise may only be a return type', () => {
    const code = `
      export class C {
        constructor(p: Promise<string>) {}
      }`;
    expect(() => {
      parseServiceDefinition('fileName', code);
    }).toThrow();
  });

  it('Observable may only be a return type', () => {
    const code = `
      export class C {
        m(p: Array<Observable<number>>): void {}
      }`;
    expect(() => {
      parseServiceDefinition('fileName', code);
    }).toThrow();
  });

  it('void may only be a return type', () => {
    const code = `
      export class C {
        m(p: void): void {}
      }`;
    expect(() => {
      parseServiceDefinition('fileName', code);
    }).toThrow();
  });

  it('Constructors may not have return types', () => {
    const code = `
      export class C {
        constructor(): Promise<void> {}
      }`;
    expect(() => {
      parseServiceDefinition('fileName', code);
    }).toThrow();
  });

  it('Aliases cannot be recursive', () => {
    const code = `
      export type R = R;
    `;
    expect(() => {
      parseServiceDefinition('fileName', code);
    }).toThrow();
  });

  it('Aliases cannot be recursive throw constructed types', () => {
    const code = `
      export type R = Promise<R>;
    `;
    expect(() => {
      parseServiceDefinition('fileName', code);
    }).toThrow();
  });

  it('Aliases cannot be mutually recursive', () => {
    const code = `
      export type A = B;
      export type B = A;
    `;
    expect(() => {
      parseServiceDefinition('fileName', code);
    }).toThrow();
  });

  it('Complex Aliases cannot be mutually recursive', () => {
    const code = `
      export type A = Promise<T>;
      export type T = [O];
      export type O = {f: A};
    `;
    expect(() => {
      parseServiceDefinition('fileName', code);
    }).toThrow();
  });

  it('Return types must be promise/observable/void', () => {
    const code = `
      export type A = number;
      export function f(): A {};
    `;
    expect(() => {
      parseServiceDefinition('fileName', code);
    }).toThrow();
  });
});

function mapDefinitions(map: Map<string, Definition>): { [key: string]: Object } {
  const obj = {};
  for (const it of map.values()) {
    let value;
    switch (it.kind) {
      case 'interface':
        value = {
          constructorArgs: it.constructorArgs,
          instanceMethods: mapToJSON(it.instanceMethods),
          staticMethods: mapToJSON(it.staticMethods),
        };
        break;
      default:
        value = it;
        break;
    }
    obj[it.name] = value;
  }
  return obj;
}

function mapToJSON(map: Map): Object {
  const result = {};
  for (const it of map.entries()) {
    result[it[0]] = it[1];
  }
  return result;
}
