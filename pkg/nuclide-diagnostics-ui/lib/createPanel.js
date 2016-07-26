function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsNodeDebounce2;

function _commonsNodeDebounce() {
  return _commonsNodeDebounce2 = _interopRequireDefault(require('../../commons-node/debounce'));
}

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

var DEFAULT_TABLE_WIDTH = 600;

function createDiagnosticsPanel(diagnosticUpdater, initialHeight, initialfilterByActiveTextEditor, disableLinter) {
  var diagnosticsPanel = null;
  var bottomPanel = null;
  var diagnosticsNeedSorting = false;
  var activeEditor = atom.workspace.getActiveTextEditor();
  var pathToActiveTextEditor = activeEditor ? activeEditor.getPath() : null;
  var props = {
    diagnostics: [],
    width: DEFAULT_TABLE_WIDTH,
    height: initialHeight,
    onResize: (0, (_commonsNodeDebounce2 || _commonsNodeDebounce()).default)(function () {
      (0, (_assert2 || _assert()).default)(diagnosticsPanel);
      props.height = diagnosticsPanel.getHeight();
      render();
    },
    /* debounceIntervalMs */50,
    /* immediate */false),
    onDismiss: function onDismiss() {
      (0, (_assert2 || _assert()).default)(bottomPanel);
      bottomPanel.hide();
    },
    pathToActiveTextEditor: pathToActiveTextEditor,
    filterByActiveTextEditor: initialfilterByActiveTextEditor,
    onFilterByActiveTextEditorChange: function onFilterByActiveTextEditorChange(isChecked) {
      props.filterByActiveTextEditor = isChecked;
      render();
    },
    warnAboutLinter: false,
    disableLinter: disableLinter
  };

  var item = document.createElement('div');
  function render() {
    if (bottomPanel && !bottomPanel.isVisible()) {
      return;
    }

    // Do not bother to sort the diagnostics until a render is happening. This avoids doing
    // potentially large sorts while the diagnostics pane is hidden.
    if (diagnosticsNeedSorting) {
      props.diagnostics = props.diagnostics.slice().sort((_paneUtils2 || _paneUtils()).compareMessagesByFile);
      diagnosticsNeedSorting = false;
    }

    var component = (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement((_DiagnosticsPanel2 || _DiagnosticsPanel()).default, props), item);
    (0, (_assert2 || _assert()).default)(component instanceof (_DiagnosticsPanel2 || _DiagnosticsPanel()).default);
    diagnosticsPanel = component;
  }

  var activePaneItemSubscription = atom.workspace.onDidChangeActivePaneItem(function (paneItem) {
    if (atom.workspace.isTextEditor(paneItem)) {
      var textEditor = paneItem;
      props.pathToActiveTextEditor = textEditor ? textEditor.getPath() : null;
      if (props.filterByActiveTextEditor) {
        render();
      }
    }
  });

  var messagesDidUpdateSubscription = diagnosticUpdater.allMessageUpdates.subscribe(function (messages) {
    props.diagnostics = messages;
    diagnosticsNeedSorting = true;
    render();
  });

  function setWarnAboutLinter(warn) {
    props.warnAboutLinter = warn;
    render();
  }

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
  bottomPanel = atom.workspace.addBottomPanel({ item: rootElement });

  // Now that the iframe is in the DOM, subscribe to its resize events.
  var win = iframe.contentWindow;
  var resizeListener = (0, (_commonsNodeDebounce2 || _commonsNodeDebounce()).default)(function () {
    props.width = win.innerWidth;
    render();
  },
  /* debounceIntervalMs */50,
  /* immediate */false);
  win.addEventListener('resize', resizeListener);

  var didChangeVisibleSubscription = bottomPanel.onDidChangeVisible(function (visible) {
    if (visible) {
      render();
    }
  });

  // Currently, destroy() does not appear to be idempotent:
  // https://github.com/atom/atom/commit/734a79b7ec9f449669e1871871fd0289397f9b60#commitcomment-12631908
  bottomPanel.onDidDestroy(function () {
    didChangeVisibleSubscription.dispose();
    activePaneItemSubscription.dispose();
    messagesDidUpdateSubscription.unsubscribe();
    win.removeEventListener('resize', resizeListener);
    (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(item);
  });

  return {
    atomPanel: bottomPanel,
    getDiagnosticsPanel: function getDiagnosticsPanel() {
      return diagnosticsPanel;
    },
    setWarnAboutLinter: setWarnAboutLinter
  };
}

module.exports = {
  createDiagnosticsPanel: createDiagnosticsPanel
};