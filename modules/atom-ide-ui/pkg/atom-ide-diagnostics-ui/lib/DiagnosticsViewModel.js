'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DiagnosticsViewModel = exports.WORKSPACE_VIEW_URI = undefined;

var _react = _interopRequireWildcard(require('react'));

var _DiagnosticsView;

function _load_DiagnosticsView() {
  return _DiagnosticsView = _interopRequireDefault(require('./ui/DiagnosticsView'));
}

var _analytics;

function _load_analytics() {
  return _analytics = _interopRequireDefault(require('nuclide-commons-atom/analytics'));
}

var _observePaneItemVisibility;

function _load_observePaneItemVisibility() {
  return _observePaneItemVisibility = _interopRequireDefault(require('nuclide-commons-atom/observePaneItemVisibility'));
}

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('nuclide-commons-ui/renderReactRoot');
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('nuclide-commons-ui/bindObservableAsProps');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// The shape of the state that's shared between views (if there are multiple). Right now, this is
// the same as the component's Props, but that could change if we want to support multiple instances
// of the Diagnostics view each with different filters, for example.
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

const WORKSPACE_VIEW_URI = exports.WORKSPACE_VIEW_URI = 'atom://nuclide/diagnostics';

class DiagnosticsViewModel {

  constructor(states) {
    const visibility = (0, (_observePaneItemVisibility || _load_observePaneItemVisibility()).default)(this).distinctUntilChanged();
    this._visibilitySubscription = visibility.debounceTime(1000).distinctUntilChanged().filter(Boolean).subscribe(() => {
      (_analytics || _load_analytics()).default.track('diagnostics-show-table');
    });

    // "Mute" the props stream when the view is hidden so we don't do unnecessary updates.
    this._props = (0, (_observable || _load_observable()).toggle)(states, visibility);
  }

  destroy() {
    this._visibilitySubscription.unsubscribe();
  }

  getTitle() {
    return 'Diagnostics';
  }

  getIconName() {
    return 'law';
  }

  getURI() {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation() {
    return 'bottom';
  }

  serialize() {
    return {
      deserializer: 'atom-ide-ui.DiagnosticsViewModel'
    };
  }

  getElement() {
    if (this._element == null) {
      const Component = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(this._props, (_DiagnosticsView || _load_DiagnosticsView()).default);
      const element = (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.createElement(Component, null));
      element.classList.add('nuclide-diagnostics-ui');
      this._element = element;
    }
    return this._element;
  }
}
exports.DiagnosticsViewModel = DiagnosticsViewModel;