'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToolbarStatePreferences = exports.TaskRunner = undefined;
exports.createTask = createTask;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TaskRunner {

  constructor(id) {
    // flowlint-next-line sketchy-null-string:off
    this.id = id || 'build-system';
    // flowlint-next-line sketchy-null-string:off
    this.name = id || 'Build System';
    this._taskLists = new _rxjsBundlesRxMinJs.Subject();
  }

  getIcon() {
    return null;
  }

  setProjectRoot(projectRoot, callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  runTask(taskName) {
    return null;
  }
}

exports.TaskRunner = TaskRunner; /**
                                  * Copyright (c) 2015-present, Facebook, Inc.
                                  * All rights reserved.
                                  *
                                  * This source code is licensed under the license found in the LICENSE file in
                                  * the root directory of this source tree.
                                  *
                                  * 
                                  * @format
                                  */

class ToolbarStatePreferences {

  constructor(db) {
    this._db = db;
  }

  getItem(key) {
    const entry = this._db[0];
    return entry == null ? null : entry.value;
  }

  getEntries() {
    return this._db;
  }
}

exports.ToolbarStatePreferences = ToolbarStatePreferences;
function createTask(type, disabled) {
  return {
    type,
    label: type,
    description: type,
    icon: 'alert',
    disabled
  };
}