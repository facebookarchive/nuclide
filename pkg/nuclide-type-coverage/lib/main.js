"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeCoverageProvider = consumeCoverageProvider;
exports.consumeStatusBar = consumeStatusBar;
exports.getDiagnosticsProvider = getDiagnosticsProvider;

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _analytics() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/analytics"));

  _analytics = function () {
    return data;
  };

  return data;
}

function _ActiveEditorRegistry() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/ActiveEditorRegistry"));

  _ActiveEditorRegistry = function () {
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

function _StatusBarTile() {
  const data = require("./StatusBarTile");

  _StatusBarTile = function () {
    return data;
  };

  return data;
}

function _coverageDiagnostics() {
  const data = require("./coverageDiagnostics");

  _coverageDiagnostics = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

async function resultFunction(provider, editor) {
  const path = editor.getPath();

  if (path == null) {
    return null;
  }

  return provider.getCoverage(path);
}

class Activation {
  constructor(state) {
    this._toggleEvents = new _RxMin.Subject();
    this._shouldRenderDiagnostics = this._toggleEvents.scan(prev => !prev, false);
    this._disposables = new (_UniversalDisposable().default)();
    this._activeEditorRegistry = new (_ActiveEditorRegistry().default)(resultFunction, {
      updateOnEdit: false
    });

    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-type-coverage:toggle-inline-display', () => this._toggleEvents.next()), this._shouldRenderDiagnostics.subscribe(shouldRender => this._activeEditorRegistry._providerRegistry._providers.forEach(provider => provider.onToggle && provider.onToggle(shouldRender))));

    this._disposables.add(this._toggleEvents.subscribe(() => _analytics().default.track('nuclide-type-coverage:toggle')));
  }

  consumeCoverageProvider(provider) {
    return this._activeEditorRegistry.consumeProvider(provider);
  }

  consumeStatusBar(statusBar) {
    const item = document.createElement('span');
    const statusBarTile = statusBar.addLeftTile({
      item,
      priority: STATUS_BAR_PRIORITY
    });

    const resultStream = this._activeEditorRegistry.getResultsStream();

    _reactDom.default.render(React.createElement(_StatusBarTile().StatusBarTile, {
      results: resultStream,
      isActive: this._shouldRenderDiagnostics,
      onClick: () => this._toggleEvents.next()
    }), item);

    const disposable = new (_UniversalDisposable().default)(() => {
      _reactDom.default.unmountComponentAtNode(item);

      statusBarTile.destroy();
    });

    this._disposables.add(disposable);

    return disposable;
  }

  getDiagnosticsProvider() {
    return (0, _coverageDiagnostics().diagnosticProviderForResultStream)(this._activeEditorRegistry.getResultsStream(), this._shouldRenderDiagnostics);
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
    throw new Error("Invariant violation: \"activation != null\"");
  }

  return activation.consumeCoverageProvider(provider);
}

function consumeStatusBar(statusBar) {
  if (!(activation != null)) {
    throw new Error("Invariant violation: \"activation != null\"");
  }

  return activation.consumeStatusBar(statusBar);
}

function getDiagnosticsProvider() {
  if (!(activation != null)) {
    throw new Error("Invariant violation: \"activation != null\"");
  }

  return activation.getDiagnosticsProvider();
}