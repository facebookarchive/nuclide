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

var _paneUtils2;

function _paneUtils() {
  return _paneUtils2 = require('./paneUtils');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _DiagnosticsPanel2;

function _DiagnosticsPanel() {
  return _DiagnosticsPanel2 = _interopRequireDefault(require('./DiagnosticsPanel'));
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var _commonsNodeObservable2;

function _commonsNodeObservable() {
  return _commonsNodeObservable2 = require('../../commons-node/observable');
}

var _nuclideUiBindObservableAsProps2;

function _nuclideUiBindObservableAsProps() {
  return _nuclideUiBindObservableAsProps2 = require('../../nuclide-ui/bindObservableAsProps');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var DEFAULT_TABLE_WIDTH = 600;

function createDiagnosticsPanel(diagnostics, initialHeight, initialfilterByActiveTextEditor, disableLinter, onFilterByActiveTextEditorChange) {
  var item = document.createElement('div');

  // A FixedDataTable must specify its own width. We always want it to match that of the bottom
  // panel. Unfortunately, there is no way to register for resize events on a DOM element: it is
  // only possible to listen for resize events on a window. (MutationObserver does not help here.)
  //
  // As such, we employ a hack inspired by http://stackoverflow.com/a/20888342/396304.
  // We create an invisible iframe with 100% width, so it will match the width of the panel. We
  // subscribe to its resize events and use that as a proxy for the panel being resized and update
  // the width of the FixedDataTable accordingly.
  var iframe = window.document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '1px';
  iframe.style.position = 'absolute';
  iframe.style.visibility = 'hidden';
  iframe.style.border = 'none';

  // Both the iframe and the host element for the React component are children of the root element
  // that serves as the item for the panel.
  var rootElement = document.createElement('div');
  rootElement.className = 'nuclide-diagnostics-ui';
  rootElement.appendChild(iframe);
  rootElement.appendChild(item);

  var bottomPanel = atom.workspace.addBottomPanel({ item: rootElement });

  var warnAboutLinterStream = new (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).BehaviorSubject(false);
  var setWarnAboutLinter = function setWarnAboutLinter(warn) {
    warnAboutLinterStream.next(warn);
  };

  var panelVisibilityStream = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of(true), (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(bottomPanel.onDidChangeVisible.bind(bottomPanel))).distinctUntilChanged();

  // When the panel becomes visible for the first time, render the component.
  var subscription = panelVisibilityStream.filter(Boolean).take(1).subscribe(function () {
    var propsStream = getPropsStream(diagnostics, warnAboutLinterStream, initialHeight, initialfilterByActiveTextEditor, disableLinter, iframe.contentWindow, onFilterByActiveTextEditorChange, function () {
      bottomPanel.hide();
    }).publishReplay(1).refCount();

    var Component = (0, (_nuclideUiBindObservableAsProps2 || _nuclideUiBindObservableAsProps()).bindObservableAsProps)(
    // A stream that contains the props, but is "muted" when the panel's not visible.
    (0, (_commonsNodeObservable2 || _commonsNodeObservable()).toggle)(propsStream, panelVisibilityStream), (_DiagnosticsPanel2 || _DiagnosticsPanel()).default);
    (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement(Component, null), item);
  });

  // Currently, destroy() does not appear to be idempotent:
  // https://github.com/atom/atom/commit/734a79b7ec9f449669e1871871fd0289397f9b60#commitcomment-12631908
  bottomPanel.onDidDestroy(function () {
    subscription.unsubscribe();
    (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(item);
  });

  return {
    atomPanel: bottomPanel,
    setWarnAboutLinter: setWarnAboutLinter
  };
}

function getPropsStream(diagnosticsStream, warnAboutLinterStream, initialHeight, initialfilterByActiveTextEditor, disableLinter, win, onFilterByActiveTextEditorChange, onDismiss) {
  var activeTextEditorPaths = (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(atom.workspace.observeActivePaneItem.bind(atom.workspace)).map(function (paneItem) {
    if (atom.workspace.isTextEditor(paneItem)) {
      var textEditor = paneItem;
      return textEditor ? textEditor.getPath() : null;
    }
  }).distinctUntilChanged();

  var sortedDiagnostics = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of([]), diagnosticsStream.map(function (diagnostics) {
    return diagnostics.slice().sort((_paneUtils2 || _paneUtils()).compareMessagesByFile);
  }));

  var filterByActiveTextEditorStream = new (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).BehaviorSubject(initialfilterByActiveTextEditor);
  var handleFilterByActiveTextEditorChange = function handleFilterByActiveTextEditorChange(filterByActiveTextEditor) {
    filterByActiveTextEditorStream.next(filterByActiveTextEditor);
    onFilterByActiveTextEditorChange(filterByActiveTextEditor);
  };

  var widthStream = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of(DEFAULT_TABLE_WIDTH).concat((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromEvent(win, 'resize').map(function () {
    return win.innerWidth;
  }));

  // $FlowFixMe: We haven't typed this function with this many args.
  return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.combineLatest(activeTextEditorPaths, sortedDiagnostics, warnAboutLinterStream, filterByActiveTextEditorStream, widthStream.first().concat(widthStream.skip(1).debounceTime(50))).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 5);

    var pathToActiveTextEditor = _ref2[0];
    var diagnostics = _ref2[1];
    var warnAboutLinter = _ref2[2];
    var filter = _ref2[3];
    var width = _ref2[4];
    return {
      pathToActiveTextEditor: pathToActiveTextEditor,
      diagnostics: diagnostics,
      warnAboutLinter: warnAboutLinter,
      disableLinter: disableLinter,
      filterByActiveTextEditor: filter,
      onFilterByActiveTextEditorChange: handleFilterByActiveTextEditorChange,
      width: width,
      initialHeight: initialHeight,
      onDismiss: onDismiss
    };
  });
}
module.exports = exports.default;