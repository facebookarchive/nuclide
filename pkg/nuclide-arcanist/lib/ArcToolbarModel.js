'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArcToolbarModel = exports.TASKS = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TASKS = exports.TASKS = [];

/*
 * This will provide the toolbar functionality for the open-source-supported HHVM targets.
 * e.g. HHVM Debugger
 */
let ArcToolbarModel = exports.ArcToolbarModel = class ArcToolbarModel {

  constructor(outputMessages) {
    this._outputMessages = outputMessages;
  }

  setCwdApi(cwdApi) {
    this._cwdApi = cwdApi;
  }

  logOutput(text, level) {
    this._outputMessages.next({ text: text, level: level });
  }

  getActiveProjectPath() {
    if (this._cwdApi == null) {
      return atom.project.getPaths()[0];
    }
    const workingDirectory = this._cwdApi.getCwd();
    if (workingDirectory != null) {
      return workingDirectory.getPath();
    } else {
      return null;
    }
  }

  onChange(callback) {
    return new _atom.Disposable(() => {});
  }

  setActiveBuildTarget(value) {
    throw new Error('arc build targets not supported');
  }

  isArcSupported() {
    return false;
  }

  getActiveBuildTarget() {
    return '';
  }

  getName() {
    return 'Arcanist';
  }

  getTaskList() {
    return TASKS;
  }

  arcBuild() {
    return (0, _asyncToGenerator.default)(function* () {
      throw new Error('arc build not supported');
    })();
  }

  getBuildTargets() {
    throw new Error('arc build not supported');
  }

  updateBuildTargets() {
    throw new Error('arc build not supported');
  }

  getBuildTargetsError() {
    throw new Error('arc build not supported');
  }

  viewActivated() {
    throw new Error('arc build not supported');
  }

  viewDeactivated() {
    throw new Error('arc build not supported');
  }

};