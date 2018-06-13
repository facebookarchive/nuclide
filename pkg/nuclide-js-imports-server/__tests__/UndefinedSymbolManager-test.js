'use strict';

var _babylon;

function _load_babylon() {
  return _babylon = _interopRequireWildcard(require('babylon'));
}

var _UndefinedSymbolManager;

function _load_UndefinedSymbolManager() {
  return _UndefinedSymbolManager = require('../src/lib/UndefinedSymbolManager');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const babylonOptions = {
  sourceType: 'module',
  plugins: ['jsx', 'flow', 'exportExtensions']
};

describe('UndefinedSymbolManager', () => {
  /* Value Tests */
  it('Should find undefined values in a function', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'function myFunc(){return x; };';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols).toBeDefined();
    expect(undefinedSymbols.length).toBe(1);
    expect(undefinedSymbols[0].id).toBe('x');
    expect(undefinedSymbols[0].type).toBe('value');
  });
  it('Should find undefined React in JSX component', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'const x = <Component />;';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols).toBeDefined();
    expect(undefinedSymbols.length).toBe(2);
    expect(undefinedSymbols[0].id).toBe('React');
    expect(undefinedSymbols[0].type).toBe('value');
    expect(undefinedSymbols[1].id).toBe('Component');
    expect(undefinedSymbols[1].type).toBe('value');
  });
  it('Should find undefined React in JSX tag', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'const x = <div />;';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols).toBeDefined();
    expect(undefinedSymbols.length).toBe(1);
    expect(undefinedSymbols[0].id).toBe('React');
    expect(undefinedSymbols[0].type).toBe('value');
  });
  it('Should find undefined React in JSX fragment', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'const x = <>test</>;';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols).toBeDefined();
    expect(undefinedSymbols.length).toBe(1);
    expect(undefinedSymbols[0].id).toBe('React');
    expect(undefinedSymbols[0].type).toBe('value');
  });
  it('Should not find undefined React in JSX component with @csx tag', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = '/**@csx*/ const x = <Component />;';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols).toBeDefined();
    expect(undefinedSymbols.length).toBe(1);
    expect(undefinedSymbols[0].id).toBe('Component');
    expect(undefinedSymbols[0].type).toBe('value');
  });
  it('Should have special treatment for the fbt tag', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'const x = <fbt key="value"/>;';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols).toBeDefined();
    expect(undefinedSymbols.length).toBe(1);
    expect(undefinedSymbols[0].id).toBe('fbt');
    expect(undefinedSymbols[0].type).toBe('value');
  });
  it('Should not declare all globals as undefined', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'var x = 10; function myFunc(){ return x; };';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols).toBeDefined();
    expect(undefinedSymbols.length).toBe(0);
  });
  it('Should not declare as undefined if imported', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = "import {x} from './someFile'; function myFunc(){ return x;}";
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols).toBeDefined();
    expect(undefinedSymbols.length).toBe(0);
  });
  it('Should not declare as undefined if declared after', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'export type Y = { f(x: X): void }; class X implements Y {}';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols).toBeDefined();
    expect(undefinedSymbols.length).toBe(0);
  });
  it('Should find undefined object', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'myFunc.doSomething();';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols).toBeDefined();
    expect(undefinedSymbols.length).toBe(1);
    expect(undefinedSymbols[0].id).toBe('myFunc');
    expect(undefinedSymbols[0].type).toBe('value');
  });
  it('Should catch undefined assignment', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'const val = iamnotdefined;';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols).toBeDefined();
    expect(undefinedSymbols.length).toBe(1);
    expect(undefinedSymbols[0].id).toBe('iamnotdefined');
    expect(undefinedSymbols[0].type).toBe('value');
  });
  it('Should allow loose declarations', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'iamnotdefined = 1; x = iamnotdefined;';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols).toBeDefined();
    expect(undefinedSymbols.length).toBe(0);
  });
  it('Should allow labelled statements', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'loop: while (true) continue loop;';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols).toBeDefined();
    expect(undefinedSymbols.length).toBe(0);
  });
  it('Should handle /* global */ comments', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = `
      /* global Test, Test2: false, Test3 */
      const x = Test + Test2 + Test3 + Test4;
    `;
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols).toBeDefined();
    expect(undefinedSymbols.length).toBe(1);
    expect(undefinedSymbols[0].id).toBe('Test4');
  });

  /* Type Tests */
  it('Should find undeclared types in assignment', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'const val : MyType = 10';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols).toBeDefined();
    expect(undefinedSymbols.length).toBe(1);
    expect(undefinedSymbols[0].id).toBe('MyType');
    expect(undefinedSymbols[0].type).toBe('type');
  });
  it('Should find undeclared types in function', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'function myFunc(): SomeType {return 10;}';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols).toBeDefined();
    expect(undefinedSymbols.length).toBe(1);
    expect(undefinedSymbols[0].id).toBe('SomeType');
    expect(undefinedSymbols[0].type).toBe('type');
  });
  it('Should not declare as undefined, if type is imported', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = "import type MyType from 'module'; const val : MyType = 10;";
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols).toBeDefined();
    expect(undefinedSymbols.length).toBe(0);
  });
  it('Should not declare as undefined if declared as var', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'const x = {}; function myFunc(): x {}';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols).toBeDefined();
    expect(undefinedSymbols.length).toBe(0);
  });
  it('Should not declare as undefined if declared as object destructure', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'const {x} = {}; function myFunc(): x {}';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols).toBeDefined();
    expect(undefinedSymbols.length).toBe(0);
  });
  it('Should not declare as undefined if declared as array destructure', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'const [x] = []; function myFunc(): x {}';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols).toBeDefined();
    expect(undefinedSymbols.length).toBe(0);
  });
  it('Should store location correctly', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'new ClassThatDoesNotExist();';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols.length).toBe(1);
    expect(undefinedSymbols[0].id).toBe('ClassThatDoesNotExist');
    expect(undefinedSymbols[0].type).toBe('value');
    expect(undefinedSymbols[0].location.start.line).toBe(1);
    expect(undefinedSymbols[0].location.start.col).toBe(4);
    expect(undefinedSymbols[0].location.end.line).toBe(1);
    expect(undefinedSymbols[0].location.end.col).toBe(25);
  });

  /* False Positive Tests */
  it('Builtins do not trigger diagnostics', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager(['']);
    const program = 'new Iterator();';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols.length).toBe(0);
  });
  it('Globals do not trigger diagnostics', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager(['process']);
    const program = 'const dir = process.cwd()';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols.length).toBe(0);
  });
  it('Type identifiers should not trigger diagnostics', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'type MyType = {a: number, b: string}';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols.length).toBe(0);
  });
  it('Class imports should be treated as types', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = "import {SomeClass} from 'file'; var instance: SomeClass; ";
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols.length).toBe(0);
  });
  it('TypeAliases are not treated as undeclared types', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = "type MyType = 'string' | 'number' ";
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols.length).toBe(0);
  });
  it('Keeps track of types declared before', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = "type MyType = 'string' | 'number'; const val: MyType = 10; ";
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols.length).toBe(0);
  });
  it('Keeps track of types declared after', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = "const val: MyType = 10; type MyType = 'string' | 'number';";
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols.length).toBe(0);
  });
  it('Works correctly with typeof', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'type X = typeof Y;';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols.length).toBe(1);
    expect(undefinedSymbols[0].id).toBe('Y');
    expect(undefinedSymbols[0].type).toBe('value');
  });
  it('Works correctly with type members', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'type X = Immutable.Map.XYZ;';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols.length).toBe(1);
    expect(undefinedSymbols[0].id).toBe('Immutable');
    expect(undefinedSymbols[0].type).toBe('type');
  });
  it('No false positives with generics', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'class GenericList<A> { returnsA(something: A): A { return something; }}';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols.length).toBe(0);
  });
  it('No false positives from ObjectTypeIndexers', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = 'type log4js$Config = { levels?: {[name: string]: string},}';
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols.length).toBe(0);
  });
  it('No false positives from React elements', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = "import React from 'react'; class Element {render(): React.Element<any> {return (<li></li>);}}";
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols.length).toBe(0);
  });
  it('Do not provide undefined symbols for declared flow modules', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = "import SomeModule from 'a'; const thing: SomeModule.SomeType = 5;";
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols.length).toBe(0);
  });
  it('Should work with declare type', () => {
    const manager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager([]);
    const program = `
      declare type Options = {};
      declare function f(options: Options): void;
      declare var Variable: string;
    `;
    const ast = (_babylon || _load_babylon()).parse(program, babylonOptions);
    const undefinedSymbols = manager.findUndefined(ast);
    expect(undefinedSymbols.length).toBe(0);
  });

  it('should not error with non-standard environments', () => {
    // eslint-disable-next-line no-new
    new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager(['asdf']);
  });
});