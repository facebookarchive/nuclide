'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _FileTreeSelectors;

function _load_FileTreeSelectors() {
  return _FileTreeSelectors = _interopRequireWildcard(require('./FileTreeSelectors'));
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// $FlowFixMe(>=0.53.0) Flow suppress
class ProjectSelectionManager {

  constructor(store, actions) {
    this._store = store;
    this._actions = actions;
  }

  addExtraContent(content) {
    this._actions.addExtraProjectSelectionContent(content);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => this._actions.removeExtraProjectSelectionContent(content));
  }

  getExtraContent() {
    return (_FileTreeSelectors || _load_FileTreeSelectors()).getExtraProjectSelectionContent(this._store);
  }
}
exports.default = ProjectSelectionManager; /**
                                            * Copyright (c) 2015-present, Facebook, Inc.
                                            * All rights reserved.
                                            *
                                            * This source code is licensed under the license found in the LICENSE file in
                                            * the root directory of this source tree.
                                            *
                                            * 
                                            * @format
                                            */