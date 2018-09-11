"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TreeExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("./Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _Icon() {
  const data = require("./Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

function _Tree() {
  const data = require("./Tree");

  _Tree = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const BasicTreeExample = () => React.createElement("div", null, "Trees", React.createElement(_Block().Block, null, React.createElement(_Tree().TreeList, null, React.createElement(_Tree().TreeItem, null, "TreeItem 1"), React.createElement(_Tree().TreeItem, null, "TreeItem 2"), React.createElement(_Tree().NestedTreeItem, {
  title: React.createElement("span", null, "NestedTreeItem 1 -- click me!"),
  onSelect: handleSelect,
  onConfirm: handleConfirm,
  onTripleClick: handleTripleClick,
  selected: true
}, React.createElement(_Tree().TreeItem, null, "TreeItem 3"), React.createElement(_Tree().TreeItem, null, "TreeItem 4")), React.createElement(_Tree().NestedTreeItem, {
  title: React.createElement("span", null, "NestedTreeItem 2"),
  collapsed: true
}))));

const AtomStyleguideTreeExample = () => React.createElement(_Block().Block, null, React.createElement(_Tree().TreeList, {
  showArrows: true
}, React.createElement(_Tree().NestedTreeItem, {
  title: React.createElement(_Icon().Icon, {
    icon: "file-directory"
  }, "A Directory")
}, React.createElement(_Tree().NestedTreeItem, {
  collapsed: false,
  title: React.createElement(_Icon().Icon, {
    icon: "file-directory"
  }, "Nested Directory")
}, React.createElement(_Tree().TreeItem, null, React.createElement(_Icon().Icon, {
  icon: "file-text"
}, "File one"))), React.createElement(_Tree().NestedTreeItem, {
  collapsed: true,
  title: React.createElement(_Icon().Icon, {
    icon: "file-directory"
  }, "Collapsed Nested Directory")
}, React.createElement(_Tree().TreeItem, null, React.createElement(_Icon().Icon, {
  icon: "file-text"
}, "File one"))), React.createElement(_Tree().TreeItem, null, React.createElement(_Icon().Icon, {
  icon: "file-text"
}, "File one")), React.createElement(_Tree().TreeItem, {
  selected: true
}, React.createElement(_Icon().Icon, {
  icon: "file-text"
}, "File three .selected!"))), React.createElement(_Tree().TreeItem, null, React.createElement(_Icon().Icon, {
  icon: "file-text"
}, ".icon-file-text")), React.createElement(_Tree().TreeItem, null, React.createElement(_Icon().Icon, {
  icon: "file-symlink-file"
}, ".icon-file-symlink-file"))));

const TreeExamples = {
  sectionName: 'Trees',
  description: 'Expandable, hierarchical lists.',
  examples: [{
    title: 'Basic Tree',
    component: BasicTreeExample
  }, {
    title: 'Reproducing the Atom style guide example:',
    component: AtomStyleguideTreeExample
  }]
};
exports.TreeExamples = TreeExamples;

function handleSelect() {
  atom.notifications.addInfo('selected!');
}

function handleConfirm() {
  atom.notifications.addInfo('confirmed!');
}

function handleTripleClick() {
  atom.notifications.addInfo('triple clicked!');
}