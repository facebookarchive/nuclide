'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _debounced;

function _load_debounced() {
  return _debounced = require('../../../modules/nuclide-commons-atom/debounced');
}

var _event;

function _load_event() {
  return _event = require('../../../modules/nuclide-commons/event');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _observable;

function _load_observable() {
  return _observable = require('../../../modules/nuclide-commons/observable');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
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

const DEBOUNCE_INTERVAL = 1000;
// TODO(hansonw): increase when code action UI supports more
const NUM_SUGGESTIONS = 3;

class LinkTreeLinter {
  constructor() {
    this._disposedPaths = new Set();
  }

  // Once the user interacts with a diagnostic, hide it forever.


  consumeBuckTaskRunner(service) {
    this._buckTaskRunnerService = service;
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._buckTaskRunnerService = null;
    });
  }

  consumeCwdApi(api) {
    this._cwdApi = api;
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._cwdApi = null;
    });
  }

  observeMessages() {
    return (0, (_debounced || _load_debounced()).observeActiveEditorsDebounced)(DEBOUNCE_INTERVAL).let((_observable || _load_observable()).compact).switchMap(editor => {
      const path = editor.getPath();
      if (path == null || this._disposedPaths.has(path) || !(_constants || _load_constants()).GRAMMAR_SET.has(editor.getGrammar().scopeName)) {
        return _rxjsBundlesRxMinJs.Observable.of([]);
      }
      // If the CWD doesn't contain the file, Buck isn't going to work.
      const cwd = this._cwdApi == null ? null : this._cwdApi.getCwd();
      if (cwd != null && !(_nuclideUri || _load_nuclideUri()).default.contains(cwd, path)) {
        return _rxjsBundlesRxMinJs.Observable.of([]);
      }
      const pythonService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getPythonServiceByNuclideUri)(path);
      return _rxjsBundlesRxMinJs.Observable.fromPromise(pythonService.getBuildableTargets(path)).filter(targets => targets.length > 0).switchMap(targets => {
        const buckService = this._buckTaskRunnerService;
        if (buckService == null || editor.getLineCount() === 0) {
          return _rxjsBundlesRxMinJs.Observable.of([]);
        }
        const position = [[0, 0], [0, editor.lineTextForBufferRow(0).length]];
        const disposed = new _rxjsBundlesRxMinJs.Subject();
        // If the user happened to build a viable target - great!
        const taskCompleted = (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => buckService.onDidCompleteTask(task => {
          if (targets.includes(task.buildTarget)) {
            cb();
          }
        }));
        const solutions = targets.slice(0, NUM_SUGGESTIONS).map(target => ({
          title: target,
          position,
          apply: () => {
            (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('python.link-tree-built', { target, path });
            buckService.setBuildTarget(target);
            atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-task-runner:toggle-buck-toolbar', { visible: true });
            // TODO: Ideally this would actually trigger the build -
            // but there's no way to wait for 'build' to be enabled.
            this._disposedPaths.add(path);
            disposed.next();
          }
        }));
        solutions.push({
          title: 'No thanks',
          position,
          apply: () => {
            (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('python.link-tree-ignored', { path });
            this._disposedPaths.add(path);
            disposed.next();
          }
        });
        return _rxjsBundlesRxMinJs.Observable.of([{
          kind: 'action',
          severity: 'info',
          location: {
            file: path,
            position
          },
          excerpt: 'For better language services, build a binary or unittest\n' + 'that uses this file with Buck. Suggestions:',
          solutions
        }]).concat(_rxjsBundlesRxMinJs.Observable.never()).takeUntil(disposed).takeUntil(taskCompleted);
      }).takeUntil((0, (_event || _load_event()).observableFromSubscribeFunction)(cb => editor.onDidDestroy(cb))).concat(_rxjsBundlesRxMinJs.Observable.of([]));
    }).catch((err, continuation) => {
      (0, (_log4js || _load_log4js()).getLogger)('LinkTreeLinter').error(err);
      return continuation;
    }).distinctUntilChanged((_shallowequal || _load_shallowequal()).default);
  }
}
exports.default = LinkTreeLinter;