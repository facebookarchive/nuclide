'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileChangesExamples = undefined;

var _react = _interopRequireWildcard(require('react'));

var _diffparser;

function _load_diffparser() {
  return _diffparser = _interopRequireDefault(require('diffparser'));
}

var _FileChanges;

function _load_FileChanges() {
  return _FileChanges = _interopRequireDefault(require('./FileChanges'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const sampleUnifiedDiff = `
diff --git a/some/folder/filename.js b/some/folder/filename.js
index abc123..cde456 100644
--- a/some/folder/filename.js
+++ b/some/folder/filename.js
@@ -36,6 +36,7 @@ export type SomeContext = {
   foo: bar,
 };

+import newdep from 'newdep';
 import {bla} from 'bla';
 import {qwe} from 'qwe';
 import {ertyu} from 'ertyu';
@@ -97,11 +98,11 @@ export default class MoreContext extends Something {
   props: Props;
   state: State;

-  thing: Thing;
+  thing: ?Thing;

   constructor(a, b) {
     super(a, b);
-    this.thing = new Thing();
+    this.thing = null;

     const foobar =
       barfoo;
@@ -144,8 +145,20 @@ export default class MoreContext extends Something {
   /**
    * Public API
    */
-  focus(): void {
-    this._getFoo().bar();
+  // comment comment
+  // comment comment
+  // comment comment
+  // comment comment
+  // comment comment
+  setup(): void {
+    invariant(1 === 1);
+    this.foobar();
+  }
+
+  teardown(): void {
+    invariant(this.thing != null);
+    this.thing.foo();
+    this.thing = null;
   }

   // end of hunk
`; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */

class FileChangesExample extends _react.Component {
  render() {
    const diff = (0, (_diffparser || _load_diffparser()).default)(sampleUnifiedDiff);
    const changes = diff.map(file => _react.createElement((_FileChanges || _load_FileChanges()).default, { diff: file, key: `${file.from}:${file.to}` }));
    return _react.createElement(
      'div',
      null,
      changes
    );
  }
}

const FileChangesExamples = exports.FileChangesExamples = {
  sectionName: 'FileChanges',
  description: 'Displays unified diffs in separate, per-hunk TextEditor instances',
  examples: [{
    title: 'Basic example',
    component: FileChangesExample
  }]
};