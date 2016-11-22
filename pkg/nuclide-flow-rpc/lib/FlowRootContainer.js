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
exports.FlowRootContainer = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _FlowRoot;

function _load_FlowRoot() {
  return _FlowRoot = require('./FlowRoot');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let FlowRootContainer = exports.FlowRootContainer = class FlowRootContainer {
  // string rather than NuclideUri because this module will always execute at the location of the
  // file, so it will always be a real path and cannot be prefixed with nuclide://
  constructor(execInfoContainer) {
    this._execInfoContainer = execInfoContainer;
    this._disposed = false;
    this._flowRootMap = new Map();

    // No need to dispose of this subscription since we want to keep it for the entire life of this
    // object. When this object is garbage collected the subject should be too.
    this._flowRoot$ = new _rxjsBundlesRxMinJs.Subject();
    this._flowRoot$.subscribe(flowRoot => {
      this._flowRootMap.set(flowRoot.getPathToRoot(), flowRoot);
    });
  }

  getRootForPath(path) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this._checkForDisposal();
      const rootPath = yield _this._execInfoContainer.findFlowConfigDir(path);
      // During the await above, this may have been disposed. If so, return null to stop the current
      // operation.
      if (rootPath == null || _this._disposed) {
        return null;
      }

      let instance = _this._flowRootMap.get(rootPath);
      if (!instance) {
        instance = new (_FlowRoot || _load_FlowRoot()).FlowRoot(rootPath, _this._execInfoContainer);
        _this._flowRoot$.next(instance);
      }
      return instance;
    })();
  }

  runWithRoot(file, f) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this2._checkForDisposal();
      const instance = yield _this2.getRootForPath(file);
      if (instance == null) {
        return null;
      }

      return yield f(instance);
    })();
  }

  runWithOptionalRoot(file, f) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this3._checkForDisposal();
      const instance = file == null ? null : yield _this3.getRootForPath(file);
      return yield f(instance);
    })();
  }

  getAllRoots() {
    this._checkForDisposal();
    return this._flowRootMap.values();
  }

  getServerStatusUpdates() {
    this._checkForDisposal();
    return this._flowRoot$.flatMap(root => {
      const pathToRoot = root.getPathToRoot();
      // The status update stream will be completed when a root is disposed, so there is no need to
      // use takeUntil here to truncate the stream and release resources.
      return root.getServerStatusUpdates().map(status => ({ pathToRoot: pathToRoot, status: status }));
    });
  }

  dispose() {
    this._checkForDisposal();
    this._flowRootMap.forEach(instance => instance.dispose());
    this._flowRootMap.clear();
    this._disposed = true;
  }

  _checkForDisposal() {
    if (!!this._disposed) {
      throw new Error('Method called on disposed FlowRootContainer');
    }
  }
};