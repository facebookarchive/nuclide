"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setup = void 0;

var _path = _interopRequireDefault(require("path"));

function _FileTreeActions() {
  const data = _interopRequireDefault(require("../lib/FileTreeActions"));

  _FileTreeActions = function () {
    return data;
  };

  return data;
}

function _registerCommands() {
  const data = _interopRequireDefault(require("../lib/registerCommands"));

  _registerCommands = function () {
    return data;
  };

  return data;
}

function _FileTreeStore() {
  const data = _interopRequireDefault(require("../lib/FileTreeStore"));

  _FileTreeStore = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

/* eslint-disable nuclide-internal/prefer-nuclide-uri */
const setup = (store, actions) => {
  const fixturesPath = _path.default.resolve(__dirname, './fixtures');

  atom.project.setPaths([fixturesPath]);
  actions.updateRootDirectories();
  const workspaceElement = atom.views.getView(atom.workspace); // Attach the workspace to the DOM so focus can be determined in tests below.

  const testContainer = document.createElement('div');

  if (!document.body) {
    throw new Error("Invariant violation: \"document.body\"");
  }

  document.body.appendChild(testContainer);
  testContainer.appendChild(workspaceElement); // console.log(document.body.innerHTML);

  (0, _registerCommands().default)(store, actions);
};

exports.setup = setup;