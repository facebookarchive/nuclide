'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setup = undefined;

var _path = _interopRequireDefault(require('path'));

var _FileTreeController;

function _load_FileTreeController() {
  return _FileTreeController = _interopRequireDefault(require('../lib/FileTreeController'));
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

const setup = exports.setup = () => {
  const fixturesPath = _path.default.resolve(__dirname, './fixtures');
  atom.project.setPaths([fixturesPath]);
  const workspaceElement = atom.views.getView(atom.workspace);
  // Attach the workspace to the DOM so focus can be determined in tests below.
  const testContainer = document.createElement('div');

  if (!document.body) {
    throw new Error('Invariant violation: "document.body"');
  }

  document.body.appendChild(testContainer);
  testContainer.appendChild(workspaceElement);
  // console.log(document.body.innerHTML);
  const controller = new (_FileTreeController || _load_FileTreeController()).default(null);
  return { controller };
};