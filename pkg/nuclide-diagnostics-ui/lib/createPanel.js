Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.default = createDiagnosticsPanel;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _paneUtils;

function _load_paneUtils() {
  return _paneUtils = require('./paneUtils');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _DiagnosticsPanel;

function _load_DiagnosticsPanel() {
  return _DiagnosticsPanel = _interopRequireDefault(require('./DiagnosticsPanel'));
}

var _commonsNodeEvent;

function _load_commonsNodeEvent() {
  return _commonsNodeEvent = require('../../commons-node/event');
}

var _commonsNodeObservable;

function _load_commonsNodeObservable() {
  return _commonsNodeObservable = require('../../commons-node/observable');
}

var _nuclideUiBindObservableAsProps;

function _load_nuclideUiBindObservableAsProps() {
  return _nuclideUiBindObservableAsProps = require('../../nuclide-ui/bindObservableAsProps');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

function createDiagnosticsPanel(diagnostics, initialHeight, initialfilterByActiveTextEditor, disableLinter, onFilterByActiveTextEditorChange) {
  var rootElement = document.createElement('div');
  rootElement.className = 'nuclide-diagnostics-ui';
  var item = document.createElement('div');
  rootElement.appendChild(item);
  var bottomPanel = atom.workspace.addBottomPanel({ item: rootElement });

  var warnAboutLinterStream = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).BehaviorSubject(false);
  var setWarnAboutLinter = function setWarnAboutLinter(warn) {
    warnAboutLinterStream.next(warn);
  };

  var panelVisibilityStream = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(true), (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(bottomPanel.onDidChangeVisible.bind(bottomPanel))).distinctUntilChanged();

  // When the panel becomes visible for the first time, render the component.
  var subscription = panelVisibilityStream.filter(Boolean).take(1).subscribe(function () {
    var propsStream = getPropsStream(diagnostics, warnAboutLinterStream, initialHeight, initialfilterByActiveTextEditor, disableLinter, onFilterByActiveTextEditorChange, function () {
      bottomPanel.hide();
    }).publishReplay(1).refCount();

    var Component = (0, (_nuclideUiBindObservableAsProps || _load_nuclideUiBindObservableAsProps()).bindObservableAsProps)(
    // A stream that contains the props, but is "muted" when the panel's not visible.
    (0, (_commonsNodeObservable || _load_commonsNodeObservable()).toggle)(propsStream, panelVisibilityStream), (_DiagnosticsPanel || _load_DiagnosticsPanel()).default);
    (_reactForAtom || _load_reactForAtom()).ReactDOM.render((_reactForAtom || _load_reactForAtom()).React.createElement(Component, null), item);
  });

  // Currently, destroy() does not appear to be idempotent:
  // https://github.com/atom/atom/commit/734a79b7ec9f449669e1871871fd0289397f9b60#commitcomment-12631908
  bottomPanel.onDidDestroy(function () {
    subscription.unsubscribe();
    (_reactForAtom || _load_reactForAtom()).ReactDOM.unmountComponentAtNode(item);
  });

  return {
    atomPanel: bottomPanel,
    setWarnAboutLinter: setWarnAboutLinter
  };
}

function getPropsStream(diagnosticsStream, warnAboutLinterStream, initialHeight, initialfilterByActiveTextEditor, disableLinter, onFilterByActiveTextEditorChange, onDismiss) {
  var activeTextEditorPaths = (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(atom.workspace.observeActivePaneItem.bind(atom.workspace)).map(function (paneItem) {
    if (atom.workspace.isTextEditor(paneItem)) {
      var textEditor = paneItem;
      return textEditor ? textEditor.getPath() : null;
    }
  }).distinctUntilChanged();

  var sortedDiagnostics = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of([]), diagnosticsStream.map(function (diagnostics) {
    return diagnostics.slice().sort((_paneUtils || _load_paneUtils()).compareMessagesByFile);
  }));

  var filterByActiveTextEditorStream = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).BehaviorSubject(initialfilterByActiveTextEditor);
  var handleFilterByActiveTextEditorChange = function handleFilterByActiveTextEditorChange(filterByActiveTextEditor) {
    filterByActiveTextEditorStream.next(filterByActiveTextEditor);
    onFilterByActiveTextEditorChange(filterByActiveTextEditor);
  };

  // $FlowFixMe: We haven't typed this function with this many args.
  return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.combineLatest(activeTextEditorPaths, sortedDiagnostics, warnAboutLinterStream, filterByActiveTextEditorStream).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 4);

    var pathToActiveTextEditor = _ref2[0];
    var diagnostics = _ref2[1];
    var warnAboutLinter = _ref2[2];
    var filter = _ref2[3];
    return {
      pathToActiveTextEditor: pathToActiveTextEditor,
      diagnostics: diagnostics,
      warnAboutLinter: warnAboutLinter,
      disableLinter: disableLinter,
      filterByActiveTextEditor: filter,
      onFilterByActiveTextEditorChange: handleFilterByActiveTextEditorChange,
      initialHeight: initialHeight,
      onDismiss: onDismiss
    };
  });
}
module.exports = exports.default;