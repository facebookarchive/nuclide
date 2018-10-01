"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PathWithFileIconExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("./Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _PathWithFileIcon() {
  const data = _interopRequireWildcard(require("./PathWithFileIcon"));

  _PathWithFileIcon = function () {
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
function ListItem(props) {
  return (// $FlowFixMe(>=0.53.0) Flow suppress
    React.createElement("div", {
      className: "list-item"
    }, props.children)
  );
}

function BasicExample() {
  return React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement("p", null, "Simply wrap paths in <PathWithFileIcon /> to get the appropriate icons:"), React.createElement("div", null, React.createElement(ListItem, null, React.createElement(_PathWithFileIcon().default, {
    path: "maybe/some/javascript.js"
  })), React.createElement(ListItem, null, React.createElement(_PathWithFileIcon().default, {
    path: "how/about/php.php"
  })), React.createElement(ListItem, null, React.createElement(_PathWithFileIcon().default, {
    path: "text.txt"
  })), React.createElement(ListItem, null, React.createElement(_PathWithFileIcon().default, {
    path: "markdown.md"
  })), React.createElement(ListItem, null, React.createElement(_PathWithFileIcon().default, {
    path: "emptiness"
  })), React.createElement(ListItem, null, React.createElement(_PathWithFileIcon().default, {
    path: ".dotfile"
  })), React.createElement(ListItem, null, React.createElement(_PathWithFileIcon().default, {
    isFolder: true,
    path: "how/about/a/folder/"
  })))));
}

function DecorationIconExample() {
  return React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement("p", null, "PathWithFileIcon export a DecorationIcons object containing custom decorations. You can optionally pass one of those decorations to decorate the file icon with e.g. a small AtomIcon:"), React.createElement("div", null, React.createElement(ListItem, null, React.createElement(_PathWithFileIcon().default, {
    decorationIcon: _PathWithFileIcon().DecorationIcons.Warning,
    path: "fileA.js"
  })), React.createElement(ListItem, null, React.createElement(_PathWithFileIcon().default, {
    decorationIcon: _PathWithFileIcon().DecorationIcons.Error,
    path: "fileB.js"
  })), React.createElement(ListItem, null, React.createElement(_PathWithFileIcon().default, {
    decorationIcon: _PathWithFileIcon().DecorationIcons.Warning,
    isFolder: true,
    path: "folderA"
  })), React.createElement(ListItem, null, React.createElement(_PathWithFileIcon().default, {
    decorationIcon: _PathWithFileIcon().DecorationIcons.Error,
    isFolder: true,
    path: "folderB"
  })))));
}

const PathWithFileIconExamples = {
  sectionName: 'PathWithFileIcon',
  description: 'Renders a file icon for a given path iff the file-icons package is installed.',
  examples: [{
    title: 'File icon wrapper example',
    component: BasicExample
  }, {
    title: 'decorationIcon',
    component: DecorationIconExample
  }]
};
exports.PathWithFileIconExamples = PathWithFileIconExamples;