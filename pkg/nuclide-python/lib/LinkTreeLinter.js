"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _debounced() {
  const data = require("../../../modules/nuclide-commons-atom/debounced");

  _debounced = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _shallowequal() {
  const data = _interopRequireDefault(require("shallowequal"));

  _shallowequal = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("./constants");

  _constants = function () {
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
 * 
 * @format
 */
const DEBOUNCE_INTERVAL = 1000; // TODO(hansonw): increase when code action UI supports more

const NUM_SUGGESTIONS = 3;

class LinkTreeLinter {
  constructor() {
    this._disposedPaths = new Set();
  }

  consumeBuckTaskRunner(service) {
    this._buckTaskRunnerService = service;
    return new (_UniversalDisposable().default)(() => {
      this._buckTaskRunnerService = null;
    });
  }

  consumeCwdApi(api) {
    this._cwdApi = api;
    return new (_UniversalDisposable().default)(() => {
      this._cwdApi = null;
    });
  }

  observeMessages() {
    return (0, _debounced().observeActiveEditorsDebounced)(DEBOUNCE_INTERVAL).let(_observable().compact).switchMap(editor => {
      const path = editor.getPath();

      if (path == null || this._disposedPaths.has(path) || !_constants().GRAMMAR_SET.has(editor.getGrammar().scopeName)) {
        return _RxMin.Observable.of([]);
      } // If the CWD doesn't contain the file, Buck isn't going to work.


      const cwd = this._cwdApi == null ? null : this._cwdApi.getCwd();

      if (cwd != null && !_nuclideUri().default.contains(cwd, path)) {
        return _RxMin.Observable.of([]);
      }

      const pythonService = (0, _nuclideRemoteConnection().getPythonServiceByNuclideUri)(path);
      return _RxMin.Observable.fromPromise(pythonService.getBuildableTargets(path)).filter(targets => targets.length > 0).switchMap(targets => {
        const buckService = this._buckTaskRunnerService;

        if (buckService == null || editor.getLineCount() === 0) {
          return _RxMin.Observable.of([]);
        }

        const position = [[0, 0], [0, editor.lineTextForBufferRow(0).length]];
        const disposed = new _RxMin.Subject(); // If the user happened to build a viable target - great!

        const taskCompleted = (0, _event().observableFromSubscribeFunction)(cb => buckService.onDidCompleteTask(task => {
          if (targets.includes(task.buildTarget)) {
            cb();
          }
        }));
        const solutions = targets.slice(0, NUM_SUGGESTIONS).map(target => ({
          title: target,
          position,
          apply: () => {
            (0, _nuclideAnalytics().track)('python.link-tree-built', {
              target,
              path
            });
            buckService.setBuildTarget(target);
            atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-task-runner:toggle-buck-toolbar', {
              visible: true
            }); // TODO: Ideally this would actually trigger the build -
            // but there's no way to wait for 'build' to be enabled.

            this._disposedPaths.add(path);

            disposed.next();
          }
        }));
        solutions.push({
          title: 'No thanks',
          position,
          apply: () => {
            (0, _nuclideAnalytics().track)('python.link-tree-ignored', {
              path
            });

            this._disposedPaths.add(path);

            disposed.next();
          }
        });
        return _RxMin.Observable.of([{
          kind: 'action',
          severity: 'info',
          location: {
            file: path,
            position
          },
          excerpt: 'For better language services, build a binary or unittest\n' + 'that uses this file with Buck. Suggestions:',
          solutions
        }]).concat(_RxMin.Observable.never()).takeUntil(disposed).takeUntil(taskCompleted);
      }).takeUntil((0, _event().observableFromSubscribeFunction)(cb => editor.onDidDestroy(cb))).concat(_RxMin.Observable.of([]));
    }).catch((err, continuation) => {
      (0, _log4js().getLogger)('LinkTreeLinter').error(err);
      return continuation;
    }).distinctUntilChanged(_shallowequal().default);
  }

}

exports.default = LinkTreeLinter;