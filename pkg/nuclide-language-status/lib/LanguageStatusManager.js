'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LanguageStatusManager = undefined;

var _ProviderRegistry;

function _load_ProviderRegistry() {
  return _ProviderRegistry = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/ProviderRegistry'));
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../../modules/nuclide-commons-ui/bindObservableAsProps');
}

var _TextEditorBanner;

function _load_TextEditorBanner() {
  return _TextEditorBanner = require('../../../modules/nuclide-commons-ui/TextEditorBanner');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _StatusComponent;

function _load_StatusComponent() {
  return _StatusComponent = _interopRequireDefault(require('./StatusComponent'));
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_SETTINGS_KIND = 'yellow'; /**
                                         * Copyright (c) 2015-present, Facebook, Inc.
                                         * All rights reserved.
                                         *
                                         * This source code is licensed under the license found in the LICENSE file in
                                         * the root directory of this source tree.
                                         *
                                         * 
                                         * @format
                                         */

class LanguageStatusManager {

  constructor() {
    this._deserializedSettings = new Map();

    this._onActiveTextEditor = _ => {
      const activePaneItems = atom.workspace.getPanes().map(pane => pane.getActiveItem());
      const textEditors = atom.workspace.getTextEditors();
      const activeTextEditors = activePaneItems.filter(item => textEditors.includes(item));
      // Dispose of status components on text editors that are no longer active.
      for (const [editor, disposable] of this._statusComponentDisposables) {
        if (!activeTextEditors.includes(editor)) {
          disposable.dispose();
          this._statusComponentDisposables.delete(editor);
        }
      }
      // Add status components to text editors that are now active.
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
      for (const [provider, kind] of newSettings) {
        if (this._settings.get(provider) !== kind) {
          changedSettings[provider.name] = kind;
        }
      }
      this._settings = newSettings;
      this._providersChanged.next();
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-language-status.settings-changed', {
        settings: this.serialize().settings,
        changedSettings
      });
    };

    this._addStatusComponent = editor => {
      const props = this._providersChanged.switchMap(() => {
        const providers = Array.from(this._providerRegistry.getAllProvidersForEditor(editor));
        // Add providers to settings map.
        for (const provider of providers) {
          if (!this._settings.has(provider)) {
            // TODO (T30575384): This is a hack for deserialization
            const deserializedKind = this._deserializedSettings.get(provider.name);
            this._settings.set(provider, deserializedKind != null ? deserializedKind : DEFAULT_SETTINGS_KIND);
          }
        }
        return providers.map(provider => {
          return provider.observeStatus(editor).startWith({ kind: 'null' }).map(data => ({
            provider,
            data
          }));
        }).reduce((a, b) => _rxjsBundlesRxMinJs.Observable.combineLatest(a, b, (x, y) => x.concat(y)), _rxjsBundlesRxMinJs.Observable.of([]));
      }).map(serverStatuses => ({
        serverStatuses,
        editor,
        settings: this._settings,
        onUpdateSettings: this._onUpdateSettings
      }));
      const StatusComponentWithProps = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props, (_StatusComponent || _load_StatusComponent()).default);
      const statusComponentWrapper = new (_TextEditorBanner || _load_TextEditorBanner()).TextEditorBanner(editor);
      statusComponentWrapper.renderUnstyled(_react.createElement(StatusComponentWithProps, null));
      this._disposables.addUntilDestroyed(editor, statusComponentWrapper);
      return statusComponentWrapper;
    };

    this._providerRegistry = new (_ProviderRegistry || _load_ProviderRegistry()).default();
    this._providersChanged = new _rxjsBundlesRxMinJs.BehaviorSubject();
    this._statusComponentDisposables = new Map();
    this._settings = new Map();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._disposables.add(() => this._statusComponentDisposables.forEach(d => d.dispose));
    this._disposables.add(atom.workspace.observeActiveTextEditor(this._onActiveTextEditor));
  }
  // TODO (T30575384): This is currently a hack for deserializing settings.
  // The (key,value) pairs in _deserializedSettings are (server name, kind)
  // are populated immediately after LanguageStatusManager is constructed.
  // When new entries are inserted into _settings, we look up whether or not
  // there is an entry in _deserializedSettings first and use it if there is
  // one, defaulting to DEFAULT_SETTINGS_KIND otherwise.


  serialize() {
    const serializedSettings = {};
    // TODO (T30575384): Figure out how to serialize information to uniquely
    // identify a provider instead of just the name.
    for (const [providerName, kind] of this._deserializedSettings) {
      serializedSettings[providerName] = kind;
    }
    // Add any changes made to the settings during this Nuclide session.
    for (const [provider, kind] of this._settings) {
      serializedSettings[provider.name] = kind;
    }

    return {
      settings: serializedSettings
    };
  }

  deserialize(state) {
    for (const key in state.settings) {
      this._deserializedSettings.set(key, state.settings[key]);
    }
  }

  dispose() {
    this._disposables.dispose();
  }

  addProvider(provider) {
    this._disposables.add(this._providerRegistry.addProvider(provider));
    this._providersChanged.next();

    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => this._removeProvider(provider));
  }

  _removeProvider(provider) {
    this._providerRegistry.removeProvider(provider);
    this._providersChanged.next();
  }

  // Atom doesn't provide a way to observe all text editors that are
  // visible. We manage this manually by looking at all the panes and
  // keeping track of the active text editors.
}
exports.LanguageStatusManager = LanguageStatusManager;