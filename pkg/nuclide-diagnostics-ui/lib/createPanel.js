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

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = createDiagnosticsPanel;

var _paneUtils;

function _load_paneUtils() {
  return _paneUtils = require('./paneUtils');
}

var _reactForAtom = require('react-for-atom');

var _DiagnosticsPanel;

function _load_DiagnosticsPanel() {
  return _DiagnosticsPanel = _interopRequireDefault(require('./DiagnosticsPanel'));
}

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _observable;

function _load_observable() {
  return _observable = require('../../commons-node/observable');
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../nuclide-ui/bindObservableAsProps');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createDiagnosticsPanel(diagnostics, initialHeight, initialfilterByActiveTextEditor, showTraces, disableLinter, onFilterByActiveTextEditorChange) {
  const rootElement = document.createElement('div');
  rootElement.className = 'nuclide-diagnostics-ui';
  const item = document.createElement('div');
  rootElement.appendChild(item);
  const bottomPanel = atom.workspace.addBottomPanel({ item: rootElement });

  const warnAboutLinterStream = new _rxjsBundlesRxMinJs.BehaviorSubject(false);
  const setWarnAboutLinter = warn => {
    warnAboutLinterStream.next(warn);
  };

  const panelVisibilityStream = _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of(true), (0, (_event || _load_event()).observableFromSubscribeFunction)(bottomPanel.onDidChangeVisible.bind(bottomPanel))).distinctUntilChanged();

  // When the panel becomes visible for the first time, render the component.
  const subscription = panelVisibilityStream.filter(Boolean).take(1).subscribe(() => {
    const propsStream = getPropsStream(diagnostics, warnAboutLinterStream, showTraces, initialHeight, initialfilterByActiveTextEditor, disableLinter, onFilterByActiveTextEditorChange, () => {
      bottomPanel.hide();
    }).publishReplay(1).refCount();

    const Component = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(
    // A stream that contains the props, but is "muted" when the panel's not visible.
    (0, (_observable || _load_observable()).toggle)(propsStream, panelVisibilityStream), (_DiagnosticsPanel || _load_DiagnosticsPanel()).default);
    _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(Component, null), item);
  });

  // Currently, destroy() does not appear to be idempotent:
  // https://github.com/atom/atom/commit/734a79b7ec9f449669e1871871fd0289397f9b60#commitcomment-12631908
  bottomPanel.onDidDestroy(() => {
    subscription.unsubscribe();
    _reactForAtom.ReactDOM.unmountComponentAtNode(item);
  });

  return {
    atomPanel: bottomPanel,
    setWarnAboutLinter: setWarnAboutLinter
  };
}

function getPropsStream(diagnosticsStream, warnAboutLinterStream, showTraces, initialHeight, initialfilterByActiveTextEditor, disableLinter, onFilterByActiveTextEditorChange, onDismiss) {
  const activeTextEditorPaths = (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.observeActivePaneItem.bind(atom.workspace)).map(paneItem => {
    if (atom.workspace.isTextEditor(paneItem)) {
      const textEditor = paneItem;
      return textEditor ? textEditor.getPath() : null;
    }
  }).distinctUntilChanged();

  const sortedDiagnostics = _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.of([]), diagnosticsStream.map(diagnostics => diagnostics.slice().sort((_paneUtils || _load_paneUtils()).compareMessagesByFile)));

  const filterByActiveTextEditorStream = new _rxjsBundlesRxMinJs.BehaviorSubject(initialfilterByActiveTextEditor);
  const handleFilterByActiveTextEditorChange = filterByActiveTextEditor => {
    filterByActiveTextEditorStream.next(filterByActiveTextEditor);
    onFilterByActiveTextEditorChange(filterByActiveTextEditor);
  };

  // $FlowFixMe: We haven't typed this function with this many args.
  return _rxjsBundlesRxMinJs.Observable.combineLatest(activeTextEditorPaths, sortedDiagnostics, warnAboutLinterStream, filterByActiveTextEditorStream, showTraces).map((_ref) => {
    var _ref2 = _slicedToArray(_ref, 5);

    let pathToActiveTextEditor = _ref2[0];
    let diagnostics = _ref2[1];
    let warnAboutLinter = _ref2[2];
    let filter = _ref2[3];
    let traces = _ref2[4];
    return {
      pathToActiveTextEditor: pathToActiveTextEditor,
      diagnostics: diagnostics,
      warnAboutLinter: warnAboutLinter,
      showTraces: traces,
      disableLinter: disableLinter,
      filterByActiveTextEditor: filter,
      onFilterByActiveTextEditorChange: handleFilterByActiveTextEditorChange,
      initialHeight: initialHeight,
      onDismiss: onDismiss
    };
  });
}
module.exports = exports['default'];