Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copies a specified subdirectory of spec/fixtures to a temporary
 * location.  The fixtureName parameter must contain a directory named .hg-rename.  After the
 * directory specified by fixtureName is copied, its .hg-rename folder will be renamed to .hg, so
 * that it can act as a mercurial repository.
 *
 * @param fixtureName The name of the subdirectory of the fixtures/ directory within the
 * nuclide-test-helpers package directory that should be copied.  Must contain a .hg-rename folder.
 * @returns the path to the temporary directory that this function creates.
 */

var copyMercurialFixture = _asyncToGenerator(function* (fixtureName) {
  var repo = yield (_nuclideTestHelpers2 || _nuclideTestHelpers()).fixtures.copyFixture(fixtureName, getTestDir());
  var pathToHg = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(repo, '.hg-rename');
  (0, (_assert2 || _assert()).default)((0, (_fsPlus2 || _fsPlus()).existsSync)(pathToHg), 'Directory: ' + pathToHg + ' was not found.');
  (0, (_fsPlus2 || _fsPlus()).moveSync)(pathToHg, (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(repo, '.hg'));
  return (0, (_fsPlus2 || _fsPlus()).absolute)(repo);
}

/**
 * Set the project.  If there are one or more projects set previously, this replaces them all with
 * the one(s) provided as the argument `projectPath`.
 */
);

exports.copyMercurialFixture = copyMercurialFixture;
exports.setLocalProject = setLocalProject;

/*
 * Copies a specified subdirectory of spec/fixtures to a temporary location.
 *
 * @param fixtureName The name of the subdirectory of the fixtures/ directory within the
 * nuclide-test-helpers package directory that should be copied.
 * @returns the path to the temporary directory that this function creates.
 */

var copyFixture = _asyncToGenerator(function* (fixtureName) {
  var fixturePath = yield (_nuclideTestHelpers2 || _nuclideTestHelpers()).fixtures.copyFixture(fixtureName, getTestDir());
  return (0, (_fsPlus2 || _fsPlus()).absolute)(fixturePath);
});

exports.copyFixture = copyFixture;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _fsPlus2;

function _fsPlus() {
  return _fsPlus2 = require('fs-plus');
}

var _nuclideTestHelpers2;

function _nuclideTestHelpers() {
  return _nuclideTestHelpers2 = require('../../nuclide-test-helpers');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

function getTestDir() {
  var _atom$getLoadSettings = atom.getLoadSettings();

  var testPaths = _atom$getLoadSettings.testPaths;

  var specPath = testPaths[0];
  // This happens when we run all the specs at once.
  if ((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(specPath) === 'spec') {
    return specPath;
  }
  return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(specPath);
}
function setLocalProject(projectPath) {
  if (Array.isArray(projectPath)) {
    atom.project.setPaths(projectPath);
  } else {
    atom.project.setPaths([projectPath]);
  }
}