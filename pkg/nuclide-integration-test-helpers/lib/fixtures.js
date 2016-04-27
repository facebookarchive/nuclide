Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copies a specified subdirectory of integration-test-helpers/spec/fixtures to a temporary
 * location.  The fixtureName parameter must contain a directory named .hg-rename.  After the
 * directory specified by fixtureName is copied, its .hg-rename folder will be renamed to .hg, so
 * that it can act as a mercurial repository.
 *
 * @param fixtureName The name of the subdirectory of the fixtures/ directory within the
 * nuclide-test-helpers package directory that should be copied.  Must contain a .hg-rename folder.
 * @returns the path to the temporary directory that this function creates.
 */

var copyMercurialFixture = _asyncToGenerator(function* (fixtureName) {
  var repo = yield _nuclideTestHelpers.fixtures.copyFixture(fixtureName, _path2['default'].join(__dirname, '../spec'));
  var pathToHg = _path2['default'].join(repo, '.hg-rename');
  (0, _assert2['default'])((0, _fsPlus.existsSync)(pathToHg), 'Directory: ' + pathToHg + ' was not found.');
  (0, _fsPlus.moveSync)(pathToHg, _path2['default'].join(repo, '.hg'));
  return (0, _fsPlus.absolute)(repo);
}

/**
 * Set the project.  If there are one or more projects set previously, this replaces them all with
 * the one(s) provided as the argument `projectPath`.
 */
);

exports.copyMercurialFixture = copyMercurialFixture;
exports.setLocalProject = setLocalProject;

/*
 * Copies a specified subdirectory of integration-test-helpers/spec/fixtures
 * to a temporary location.
 *
 * @param fixtureName The name of the subdirectory of the fixtures/ directory within the
 * nuclide-test-helpers package directory that should be copied.
 * @returns the path to the temporary directory that this function creates.
 */

var copyFixture = _asyncToGenerator(function* (fixtureName) {
  var fixturePath = yield _nuclideTestHelpers.fixtures.copyFixture(fixtureName, _path2['default'].join(__dirname, '../spec'));
  return (0, _fsPlus.absolute)(fixturePath);
});

exports.copyFixture = copyFixture;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _fsPlus = require('fs-plus');

var _nuclideTestHelpers = require('../../nuclide-test-helpers');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function setLocalProject(projectPath) {
  if (Array.isArray(projectPath)) {
    atom.project.setPaths(projectPath);
  } else {
    atom.project.setPaths([projectPath]);
  }
}