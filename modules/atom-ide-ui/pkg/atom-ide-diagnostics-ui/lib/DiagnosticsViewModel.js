'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DiagnosticsViewModel = exports.WORKSPACE_VIEW_URI = undefined;

var _paneUtils;

function _load_paneUtils() {
  return _paneUtils = require('./paneUtils');
}

var _react = _interopRequireDefault(require('react'));

var _DiagnosticsView;

function _load_DiagnosticsView() {
  return _DiagnosticsView = _interopRequireDefault(require('./DiagnosticsView'));
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

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('nuclide-commons-atom/text-editor');
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
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

const WORKSPACE_VIEW_URI = exports.WORKSPACE_VIEW_URI = 'atom://nuclide/diagnostics'; /**
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

const RENDER_DEBOUNCE_TIME = 100;

class DiagnosticsViewModel {

  constructor(diagnostics, showTracesStream, onShowTracesChange, disableLinter, warnAboutLinterStream, initialfilterByActiveTextEditor, onFilterByActiveTextEditorChange) {
    // TODO(T17495163)
    this._visibilitySubscription = (0, (_observePaneItemVisibility || _load_observePaneItemVisibility()).default)(this).subscribe(visible => {
      this.didChangeVisibility(visible);
    });
    this._visibility = new _rxjsBundlesRxMinJs.BehaviorSubject(true);

    this._visibilitySubscription = this._visibility.debounceTime(1000).distinctUntilChanged().filter(Boolean).subscribe(() => {
      (_analytics || _load_analytics()).default.track('diagnostics-show-table');
    });

    // A stream that contains the props, but is "muted" when the panel's not visible.
    this._props = (0, (_observable || _load_observable()).toggle)(getPropsStream(diagnostics, warnAboutLinterStream, showTracesStream, onShowTracesChange, disableLinter, initialfilterByActiveTextEditor, onFilterByActiveTextEditorChange).publishReplay(1).refCount(), this._visibility.distinctUntilChanged());
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

  didChangeVisibility(visible) {
    this._visibility.next(visible);
  }

  getElement() {
    if (this._element == null) {
      const Component = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(this._props, (_DiagnosticsView || _load_DiagnosticsView()).default);
      const element = (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.default.createElement(Component, null));
      element.classList.add('nuclide-diagnostics-ui');
      this._element = element;
    }
    return this._element;
  }
}

exports.DiagnosticsViewModel = DiagnosticsViewModel;
function getPropsStream(diagnosticsStream, warnAboutLinterStream, showTracesStream, onShowTracesChange, disableLinter, initialfilterByActiveTextEditor, onFilterByActiveTextEditorChange) {
  const center = atom.workspace.getCenter();
  const activeTextEditorPaths = (0, (_event || _load_event()).observableFromSubscribeFunction)(center.observeActivePaneItem.bind(center)).filter(paneItem => (0, (_textEditor || _load_textEditor()).isValidTextEditor)(paneItem)).switchMap(textEditor_ => {
    const textEditor = textEditor_;
    // An observable that emits the editor path and then, when the editor's destroyed, null.
    return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of(textEditor.getPath()), (0, (_event || _load_event()).observableFromSubscribeFunction)(textEditor.onDidDestroy.bind(textEditor)).take(1).mapTo(null));
  }).distinctUntilChanged();

  const sortedDiagnostics = _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of([]), diagnosticsStream.debounceTime(RENDER_DEBOUNCE_TIME).map(diagnostics => diagnostics.slice().sort((_paneUtils || _load_paneUtils()).compareMessagesByFile)),
  // If the diagnostics stream ever terminates, clear all messages.
  _rxjsBundlesRxMinJs.Observable.of([]));

  const filterByActiveTextEditorStream = new _rxjsBundlesRxMinJs.BehaviorSubject(initialfilterByActiveTextEditor);
  const handleFilterByActiveTextEditorChange = filterByActiveTextEditor => {
    filterByActiveTextEditorStream.next(filterByActiveTextEditor);
    onFilterByActiveTextEditorChange(filterByActiveTextEditor);
  };

  return _rxjsBundlesRxMinJs.Observable.combineLatest(activeTextEditorPaths, sortedDiagnostics, warnAboutLinterStream, filterByActiveTextEditorStream, showTracesStream).map(([pathToActiveTextEditor, diagnostics, warnAboutLinter, filter, traces]) => ({
    pathToActiveTextEditor,
    diagnostics,
    warnAboutLinter,
    showTraces: traces,
    onShowTracesChange,
    disableLinter,
    filterByActiveTextEditor: filter,
    onFilterByActiveTextEditorChange: handleFilterByActiveTextEditorChange
  }));
}