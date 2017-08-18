/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {AutoImportsManager} from '../src/lib/AutoImportsManager';

describe('AutoImportsManager', () => {
  it('Can provide a basic missing value import', () => {
    const file1 = 'export function Foo(){return 1;}';
    const file2 = 'Foo();';
    const autoImportsManager = new AutoImportsManager([]);
    autoImportsManager.indexFile('file1.js', file1);
    const missingImports = autoImportsManager.findMissingImports(
      'file2.js',
      file2,
    );
    expect(missingImports).toBeDefined();
    expect(missingImports.length).toBe(1);
    expect(missingImports[0].symbol.id).toBe('Foo');
    expect(missingImports[0].symbol.type).toBe('value');
  });
  it('Can provide a basic missing type import', () => {
    const file1 = "export type MyType = 'string' ";
    const file2 = "const val: MyType = 'something'";
    const autoImportsManager = new AutoImportsManager([]);
    autoImportsManager.indexFile('file1.js', file1);
    const missingImports = autoImportsManager.findMissingImports(
      'file2.js',
      file2,
    );
    expect(missingImports).toBeDefined();
    expect(missingImports.length).toBe(1);
    expect(missingImports[0].symbol.id).toBe('MyType');
    expect(missingImports[0].symbol.type).toBe('type');
  });
  it('Open files are automatically indexed', () => {
    const file1 = "export type MyType = 'string' ";
    const file2 = "const val: MyType = 'something'";
    const autoImportsManager = new AutoImportsManager([]);
    autoImportsManager.indexFile('file1.js', file1);
    const missingImports = autoImportsManager.findMissingImports(
      'file2.js',
      file2,
    );
    expect(missingImports).toBeDefined();
    expect(missingImports.length).toBe(1);
    expect(missingImports[0].symbol.id).toBe('MyType');
    expect(missingImports[0].symbol.type).toBe('type');
  });

  it('Does not provide imports if no import with that id is indexed.', () => {
    const file = 'const val :  Atom$Point = {a: 1, b: 2}';
    const autoImportsManager = new AutoImportsManager([]);
    const missingImports = autoImportsManager.findMissingImports(
      'file1,js',
      file,
    );
    expect(missingImports).toBeDefined();
    expect(missingImports.length).toBe(0);
  });
});
