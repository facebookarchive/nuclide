'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let resultFunction = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (provider, editor) {
    const path = editor.getPath();
    if (path == null) {
      return null;
    }
    return provider.getCoverage(path);
  });

  return function resultFunction(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeCoverageProvider = consumeCoverageProvider;
exports.consumeStatusBar = consumeStatusBar;
exports.getDiagnosticsProvider = getDiagnosticsProvider;

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _analytics;

function _load_analytics() {
  return _analytics = _interopRequireDefault(require('nuclide-commons-atom/analytics'));
}

var _ActiveEditorRegistry;

function _load_ActiveEditorRegistry() {
  return _ActiveEditorRegistry = _interopRequireDefault(require('nuclide-commons-atom/ActiveEditorRegistry'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _StatusBarTile;

function _load_StatusBarTile() {
  return _StatusBarTile = require('./StatusBarTile');
}

var _coverageDiagnostics;

function _load_coverageDiagnostics() {
  return _coverageDiagnostics = require('./coverageDiagnostics');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const STATUS_BAR_PRIORITY = 1000;

class Activation {

  constructor(state) {
    this._toggleEvents = new _rxjsBundlesRxMinJs.Subject();
    this._shouldRenderDiagnostics = this._toggleEvents.scan(prev => !prev, false);

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._activeEditorRegistry = new (_ActiveEditorRegistry || _load_ActiveEditorRegistry()).default(resultFunction, {
      updateOnEdit: false
    });

    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-type-coverage:toggle-inline-display', () => this._toggleEvents.next()));

    this._disposables.add(this._toggleEvents.subscribe(() => (_analytics || _load_analytics()).default.track('nuclide-type-coverage:toggle')));
  }

  consumeCoverageProvider(provider) {
    return this._activeEditorRegistry.consumeProvider(provider);
  }

  consumeStatusBar(statusBar) {
    const item = document.createElement('div');
    item.className = 'inline-block';

    const statusBarTile = statusBar.addLeftTile({
      item,
      priority: STATUS_BAR_PRIORITY
    });

    const resultStream = this._activeEditorRegistry.getResultsStream();
    _reactDom.default.render(_react.createElement((_StatusBarTile || _load_StatusBarTile()).StatusBarTile, {
      results: resultStream,
      isActive: this._shouldRenderDiagnostics,
      onClick: () => this._toggleEvents.next()
    }), item);
    const disposable = new _atom.Disposable(() => {
      _reactDom.default.unmountComponentAtNode(item);
      statusBarTile.destroy();
    });
    this._disposables.add(disposable);
    return disposable;
  }

  getDiagnosticsProvider() {
    return (0, (_coverageDiagnostics || _load_coverageDiagnostics()).diagnosticProviderForResultStream)(this._activeEditorRegistry.getResultsStream(), this._shouldRenderDiagnostics);
  }

  dispose() {
    this._disposables.dispose();
  }
}

let activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function consumeCoverageProvider(provider) {
  if (!(activation != null)) {
    throw new Error('Invariant violation: "activation != null"');
  }

  return activation.consumeCoverageProvider(provider);
}

function consumeStatusBar(statusBar) {
  if (!(activation != null)) {
    throw new Error('Invariant violation: "activation != null"');
  }

  return activation.consumeStatusBar(statusBar);
}

function getDiagnosticsProvider() {
  if (!(activation != null)) {
    throw new Error('Invariant violation: "activation != null"');
  }

  return activation.getDiagnosticsProvider();
}