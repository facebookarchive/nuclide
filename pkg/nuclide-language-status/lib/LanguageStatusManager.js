"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LanguageStatusManager = void 0;

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _ProviderRegistry() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/ProviderRegistry"));

  _ProviderRegistry = function () {
    return data;
  };

  return data;
}

function _bindObservableAsProps() {
  const data = require("../../../modules/nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
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

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _StatusComponent() {
  const data = _interopRequireDefault(require("./StatusComponent"));

  _StatusComponent = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const FEATURE_CONFIG_SETTINGS = 'nuclide-language-status.settings';
const DEFAULT_SETTINGS_KIND = 'yellow';

class LanguageStatusManager {
  constructor() {
    this._onActiveTextEditor = _ => {
      const activePaneItems = atom.workspace.getPanes().map(pane => pane.getActiveItem());
      const textEditors = atom.workspace.getTextEditors();
      const activeTextEditors = activePaneItems.filter(item => textEditors.includes(item)); // Dispose of status components on text editors that are no longer active.

      for (const [editor, disposable] of this._statusComponentDisposables) {
        if (!activeTextEditors.includes(editor)) {
          disposable.dispose();

          this._statusComponentDisposables.delete(editor);
        }
      } // Add status components to text editors that are now active.


      for (const editor of activeTextEditors) {
        if (editor == null) {
          continue;
        }

        if (!this._statusComponentDisposables.has(editor)) {
          this._statusComponentDisposables.set(editor, this._addStatusComponent(editor));
        }
      }
    };

    this._onUpdateSettings = newSettings => {
      const changedSettings = {};

      for (const [name, kind] of newSettings) {
        if (this._settings.get(name) !== kind) {
          changedSettings[name] = kind;
        }

        this._settings.set(name, kind);
      }

      _featureConfig().default.set(FEATURE_CONFIG_SETTINGS, Array.from(this._settings));

      this._providersChanged.next();

      (0, _nuclideAnalytics().track)('nuclide-language-status.settings-changed', {
        settings: this._settings,
        changedSettings
      });
    };

    this._addStatusComponent = editor => {
      const props = this._providersChanged.switchMap(() => {
        const providers = Array.from(this._providerRegistry.getAllProvidersForEditor(editor));
        return providers.map(provider => {
          if (!this._settings.has(provider.name)) {
            this._settings.set(provider.name, DEFAULT_SETTINGS_KIND);
          }

          return provider.observeStatus(editor).startWith({
            kind: 'null'
          }).map(data => ({
            provider,
            data
          }));
        }).reduce((a, b) => _RxMin.Observable.combineLatest(a, b, (x, y) => x.concat(y)), _RxMin.Observable.of([]));
      }).map(serverStatuses => ({
        serverStatuses,
        editor,
        settings: this._settings,
        onUpdateSettings: this._onUpdateSettings
      }));

      const StatusComponentWithProps = (0, _bindObservableAsProps().bindObservableAsProps)(props, _StatusComponent().default);

      const disposable = this._renderStatusComponent(editor, React.createElement(StatusComponentWithProps, null));

      this._disposables.addUntilDestroyed(editor, disposable);

      return disposable;
    };

    this._providerRegistry = new (_ProviderRegistry().default)();
    this._providersChanged = new _RxMin.BehaviorSubject();
    this._statusComponentDisposables = new Map();
    this._settings = new Map(_featureConfig().default.getWithDefaults(FEATURE_CONFIG_SETTINGS, []));
    this._disposables = new (_UniversalDisposable().default)();

    this._disposables.add(() => this._statusComponentDisposables.forEach(d => d.dispose));

    this._disposables.add(atom.workspace.observeActiveTextEditor(this._onActiveTextEditor));
  }

  dispose() {
    this._disposables.dispose();
  }

  addProvider(provider) {
    this._disposables.add(this._providerRegistry.addProvider(provider));

    this._providersChanged.next();

    return new (_UniversalDisposable().default)(() => this._removeProvider(provider));
  }

  _removeProvider(provider) {
    this._providerRegistry.removeProvider(provider);

    this._providersChanged.next();
  } // Atom doesn't provide a way to observe all text editors that are
  // visible. We manage this manually by looking at all the panes and
  // keeping track of the active text editors.


  _renderStatusComponent(editor, component) {
    const parentDiv = (0, _nullthrows().default)(editor.getElement().parentElement);
    const div = document.createElement('div');
    div.style.height = '0';
    const disposable = {
      dispose: () => {
        _reactDom.default.unmountComponentAtNode(div);

        div.remove();
      }
    };
    parentDiv.appendChild(div);

    _reactDom.default.render(component, div);

    return disposable;
  }

}

exports.LanguageStatusManager = LanguageStatusManager;