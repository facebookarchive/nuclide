Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.jasmineIntegrationTestSetup = jasmineIntegrationTestSetup;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _event2;

function _event() {
  return _event2 = require('./event');
}

var _fixtures2;

function _fixtures() {
  return _fixtures2 = require('./fixtures');
}

var _packageUtils2;

function _packageUtils() {
  return _packageUtils2 = require('./package-utils');
}

var _remoteUtils2;

function _remoteUtils() {
  return _remoteUtils2 = require('./remote-utils');
}

var _waitsForFile2;

function _waitsForFile() {
  return _waitsForFile2 = require('./waitsForFile');
}

// Smallish, yet realistic testing window dimensions.
var TEST_WINDOW_HEIGHT = 600;
var TEST_WINDOW_WIDTH = 1000;

function jasmineIntegrationTestSetup() {
  // Allow jasmine to interact with the DOM.
  jasmine.attachToDOM(atom.views.getView(atom.workspace));

  // This prevents zombie buck/java processes from hanging the tests
  process.env.NO_BUCKD = '1';

  // Set the testing window dimensions.
  var styleCSS = '\n    height: ' + TEST_WINDOW_HEIGHT + 'px;\n    width: ' + TEST_WINDOW_WIDTH + 'px;\n  ';
  document.querySelector('#jasmine-content').setAttribute('style', styleCSS);

  // Unmock timer functions.
  jasmine.useRealClock();
}

exports.activateAllPackages = (_packageUtils2 || _packageUtils()).activateAllPackages;
exports.addRemoteProject = (_remoteUtils2 || _remoteUtils()).addRemoteProject;
exports.copyFixture = (_fixtures2 || _fixtures()).copyFixture;
exports.copyMercurialFixture = (_fixtures2 || _fixtures()).copyMercurialFixture;
exports.deactivateAllPackages = (_packageUtils2 || _packageUtils()).deactivateAllPackages;
exports.dispatchKeyboardEvent = (_event2 || _event()).dispatchKeyboardEvent;
exports.setLocalProject = (_fixtures2 || _fixtures()).setLocalProject;
exports.startNuclideServer = (_remoteUtils2 || _remoteUtils()).startNuclideServer;
exports.stopNuclideServer = (_remoteUtils2 || _remoteUtils()).stopNuclideServer;
exports.waitsForFile = (_waitsForFile2 || _waitsForFile()).waitsForFile;
exports.waitsForFilePosition = (_waitsForFile2 || _waitsForFile()).waitsForFilePosition;