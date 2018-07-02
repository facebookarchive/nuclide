"use strict";

var _fs = _interopRequireDefault(require("fs"));

function _textEditDiff() {
  const data = require("../text-edit-diff");

  _textEditDiff = function () {
    return data;
  };

  return data;
}

var _atom = require("atom");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
const fixturePath = require.resolve("../__mocks__/fixtures/text-edit-diff-file.txt");

describe('toUnifiedDiff', () => {
  let buffer = null;
  beforeEach(() => {
    const text = _fs.default.readFileSync(fixturePath, 'utf8');

    buffer = new _atom.TextBuffer(text);
  });
  it('should handle empty text edits', () => {
    const diff = (0, _textEditDiff().toUnifiedDiff)('foo', buffer, []);
    expect(diff).toEqual('--- foo\n+++ foo');
  });
  it('should handle a single text edit with 0 context lines', () => {
    const diff = (0, _textEditDiff().toUnifiedDiff)('foo', buffer, [{
      oldRange: new _atom.Range([4, 29], [4, 32]),
      newText: '12345'
    }], 0);
    expect(diff).toEqual(`--- foo
+++ foo
@@ -5,1 +5,1 @@
-  return fibonacci(fibonacci(100));
+  return fibonacci(fibonacci(12345));`);
  });
  it('should handle a single text edits with 1 context line', () => {
    const diff = (0, _textEditDiff().toUnifiedDiff)('foo', buffer, [{
      oldRange: new _atom.Range([4, 29], [4, 32]),
      newText: '12345'
    }], 1);
    expect(diff).toEqual(`--- foo
+++ foo
@@ -4,3 +4,3 @@
 function foo() {
-  return fibonacci(fibonacci(100));
+  return fibonacci(fibonacci(12345));
 }`);
  });
  it('should handle truncated context lines', () => {
    const diff = (0, _textEditDiff().toUnifiedDiff)('foo', buffer, [{
      oldRange: new _atom.Range([4, 29], [4, 32]),
      newText: '12345'
    }], 10);
    expect(diff).toEqual(`--- foo
+++ foo
@@ -1,8 +1,8 @@
 function fibonacci(n: number): number {
   return n < 2 ? 1 : fibonacci(n - 1) + fibonacci(n - 2);
 }
 function foo() {
-  return fibonacci(fibonacci(100));
+  return fibonacci(fibonacci(12345));
 }
 console.log(foo());
 `);
  });
  it('should handle multiple text edits', () => {
    const diff = (0, _textEditDiff().toUnifiedDiff)('foo', buffer, [{
      oldRange: new _atom.Range([0, 9], [0, 18]),
      newText: 'fib'
    }, {
      oldRange: new _atom.Range([1, 21], [1, 30]),
      newText: 'fib'
    }, {
      oldRange: new _atom.Range([1, 40], [1, 49]),
      newText: 'fib'
    }, {
      oldRange: new _atom.Range([4, 9], [4, 18]),
      newText: 'fib'
    }, {
      oldRange: new _atom.Range([4, 19], [4, 28]),
      newText: 'fib'
    }], 0);
    expect(diff).toEqual(`--- foo
+++ foo
@@ -1,1 +1,1 @@
-function fibonacci(n: number): number {
+function fib(n: number): number {
@@ -2,1 +2,1 @@
-  return n < 2 ? 1 : fibonacci(n - 1) + fibonacci(n - 2);
+  return n < 2 ? 1 : fib(n - 1) + fib(n - 2);
@@ -5,1 +5,1 @@
-  return fibonacci(fibonacci(100));
+  return fib(fib(100));`);
  });
  it('should merge text edits based on context', () => {
    const diff = (0, _textEditDiff().toUnifiedDiff)('foo', buffer, [{
      oldRange: new _atom.Range([0, 9], [0, 18]),
      newText: 'fib'
    }, {
      oldRange: new _atom.Range([1, 21], [1, 30]),
      newText: 'fib'
    }, {
      oldRange: new _atom.Range([1, 40], [1, 49]),
      newText: 'fib'
    }, {
      oldRange: new _atom.Range([4, 9], [4, 18]),
      newText: 'fib'
    }, {
      oldRange: new _atom.Range([4, 19], [4, 28]),
      newText: 'fib'
    }], 1);
    expect(diff).toEqual(`--- foo
+++ foo
@@ -1,3 +1,3 @@
-function fibonacci(n: number): number {
-  return n < 2 ? 1 : fibonacci(n - 1) + fibonacci(n - 2);
+function fib(n: number): number {
+  return n < 2 ? 1 : fib(n - 1) + fib(n - 2);
 }
@@ -4,3 +4,3 @@
 function foo() {
-  return fibonacci(fibonacci(100));
+  return fib(fib(100));
 }`);
  });
  it('should handle multiline text edits', () => {
    const diff = (0, _textEditDiff().toUnifiedDiff)('foo', buffer, [{
      oldRange: new _atom.Range([4, 19], [4, 35]),
      newText: '\n    fibonacci(100)\n  );'
    }, {
      oldRange: new _atom.Range([6, 12], [6, 19]),
      newText: '\n  foo()\n);'
    }], 0);
    expect(diff).toEqual(`--- foo
+++ foo
@@ -5,1 +5,3 @@
-  return fibonacci(fibonacci(100));
+  return fibonacci(
+    fibonacci(100)
+  );
@@ -7,1 +9,3 @@
-console.log(foo());
+console.log(
+  foo()
+);`);
  });
});