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
exports.DebuggingActivation = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../../commons-atom/consumeFirstProvider'));
}

var _ReactNativeProcessInfo;

function _load_ReactNativeProcessInfo() {
  return _ReactNativeProcessInfo = require('./ReactNativeProcessInfo');
}

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Connects the executor to the debugger.
 */
let DebuggingActivation = exports.DebuggingActivation = class DebuggingActivation {

  constructor() {
    this._disposables = new _atom.CompositeDisposable(atom.commands.add('atom-workspace', {
      'nuclide-react-native:start-debugging': () => this._startDebugging()
    }), new _atom.Disposable(() => {
      if (this._startDebuggingSubscription != null) {
        this._startDebuggingSubscription.unsubscribe();
      }
    }));
  }

  dispose() {
    this._disposables.dispose();
  }

  _startDebugging() {
    if (this._startDebuggingSubscription != null) {
      this._startDebuggingSubscription.unsubscribe();
    }

    // Stop any current debugger and show the debugger view.
    const workspace = atom.views.getView(atom.workspace);
    atom.commands.dispatch(workspace, 'nuclide-debugger:stop-debugging');
    atom.commands.dispatch(workspace, 'nuclide-debugger:show');

    const debuggerServiceStream = _rxjsBundlesRxMinJs.Observable.fromPromise((0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-debugger.remote'));
    const processInfoLists = _rxjsBundlesRxMinJs.Observable.fromPromise(getProcessInfoList());
    this._startDebuggingSubscription = debuggerServiceStream.combineLatest(processInfoLists).subscribe((_ref) => {
      var _ref2 = _slicedToArray(_ref, 2);

      let debuggerService = _ref2[0],
          processInfoList = _ref2[1];

      const processInfo = processInfoList[0];
      if (processInfo != null) {
        debuggerService.startDebugging(processInfo);
      }
    });
  }
};


function getProcessInfoList() {
  // TODO(matthewwithanm): Use project root instead of first directory.
  const currentProjectDir = atom.project.getDirectories()[0];

  // TODO: Check if it's an RN app?
  // TODO: Query packager for running RN app?

  if (currentProjectDir == null) {
    return Promise.resolve([]);
  }

  const targetUri = currentProjectDir.getPath();
  return Promise.resolve([new (_ReactNativeProcessInfo || _load_ReactNativeProcessInfo()).ReactNativeProcessInfo(targetUri)]);
}