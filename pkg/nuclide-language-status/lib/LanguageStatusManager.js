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

var _StatusComponent;

function _load_StatusComponent() {
  return _StatusComponent = _interopRequireDefault(require('./StatusComponent'));
}

var _react = _interopRequireWildcard(require('react'));

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

class LanguageStatusManager {

  constructor() {
    this._onTextEditor = editor => {
      const props = this._providersChanged.switchMap(() => {
        const providers = Array.from(this._providerRegistry.getAllProvidersForEditor(editor));
        return providers.map(provider => {
          return provider.observeStatus(editor).startWith({ kind: 'null' }).map(data => ({
            provider,
            data
          }));
        }).reduce((a, b) => _rxjsBundlesRxMinJs.Observable.combineLatest(a, b, (x, y) => x.concat(y)), _rxjsBundlesRxMinJs.Observable.of([]));
      }).map(serverStatuses => ({ serverStatuses, editor }));
      const StatusComponentWithProps = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props, (_StatusComponent || _load_StatusComponent()).default);
      const statusComponentWrapper = new (_TextEditorBanner || _load_TextEditorBanner()).TextEditorBanner(editor);
      statusComponentWrapper.renderUnstyled(_react.createElement(StatusComponentWithProps, null));
      this._disposables.add(statusComponentWrapper);
      editor.onDidDestroy(() => {
        this._disposables.remove(statusComponentWrapper);
        statusComponentWrapper.dispose();
      });
    };

    this._providerRegistry = new (_ProviderRegistry || _load_ProviderRegistry()).default();
    this._providersChanged = new _rxjsBundlesRxMinJs.BehaviorSubject();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._disposables.add(atom.workspace.observeTextEditors(this._onTextEditor));
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

}
exports.LanguageStatusManager = LanguageStatusManager;