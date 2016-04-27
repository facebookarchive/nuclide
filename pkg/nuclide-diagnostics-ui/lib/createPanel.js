

var invariant = require('assert');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('../../nuclide-commons');

var debounce = _require.debounce;

var _require2 = require('./paneUtils');

var compareMessagesByFile = _require2.compareMessagesByFile;

var _require3 = require('react-for-atom');

var React = _require3.React;
var ReactDOM = _require3.ReactDOM;

var DiagnosticsPanel = require('./DiagnosticsPanel');

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
    onResize: debounce(function () {
      invariant(diagnosticsPanel);
      props.height = diagnosticsPanel.getHeight();
      render();
    },
    /* debounceIntervalMs */50,
    /* immediate */false),
    onDismiss: function onDismiss() {
      invariant(bottomPanel);
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
      props.diagnostics = props.diagnostics.slice().sort(compareMessagesByFile);
      diagnosticsNeedSorting = false;
    }

    var component = ReactDOM.render(React.createElement(DiagnosticsPanel, props), item);
    invariant(component instanceof DiagnosticsPanel);
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

  var messagesDidUpdateSubscription = diagnosticUpdater.onAllMessagesDidUpdate(function (messages) {
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
  rootElement.appendChild(iframe);
  rootElement.appendChild(item);
  bottomPanel = atom.workspace.addBottomPanel({ item: rootElement });

  // Now that the iframe is in the DOM, subscribe to its resize events.
  var win = iframe.contentWindow;
  var resizeListener = debounce(function () {
    props.width = win.innerWidth;
    render();
  },
  /* debounceIntervalMs */50,
  /* immediate */false);
  win.addEventListener('resize', resizeListener);

  // Currently, destroy() does not appear to be idempotent:
  // https://github.com/atom/atom/commit/734a79b7ec9f449669e1871871fd0289397f9b60#commitcomment-12631908
  bottomPanel.onDidDestroy(function () {
    activePaneItemSubscription.dispose();
    messagesDidUpdateSubscription.dispose();
    win.removeEventListener('resize', resizeListener);
    ReactDOM.unmountComponentAtNode(item);
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