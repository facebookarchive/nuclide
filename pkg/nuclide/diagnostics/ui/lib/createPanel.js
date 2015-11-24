'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
const invariant = require('assert');
const {debounce} = require('nuclide-commons');
const {compareMessagesByFile} = require('./paneUtils');
const {isTextEditor} = require('nuclide-atom-helpers');
const React = require('react-for-atom');
const DiagnosticsPanel = require('./DiagnosticsPanel');

const DEFAULT_TABLE_WIDTH = 600;

type PanelProps = {
  diagnostics: Array<DiagnosticMessage>;
  width: number;
  height: number;
  onResize: () => void;
  onDismiss: () => void;
  pathToActiveTextEditor: ?string;
  filterByActiveTextEditor: boolean;
  onFilterByActiveTextEditorChange: (isChecked: boolean) => void;
  warnAboutLinter: boolean;
  disableLinter: () => void;
}

function createDiagnosticsPanel(
  diagnosticUpdater: DiagnosticUpdater,
  initialHeight: number,
  initialfilterByActiveTextEditor: boolean,
  disableLinter: () => void,
): {
  atomPanel: atom$Panel;
  getDiagnosticsPanel: () => ?DiagnosticsPanel;
  setWarnAboutLinter: (warn: boolean) => void;
 } {
  let diagnosticsPanel: ?DiagnosticsPanel = null;
  let bottomPanel: ?atom$Panel = null;
  let diagnosticsNeedSorting = false;
  const activeEditor: ?atom$TextEditor = atom.workspace.getActiveTextEditor();
  const pathToActiveTextEditor = activeEditor ? activeEditor.getPath() : null;
  const props: PanelProps = {
    diagnostics: [],
    width: DEFAULT_TABLE_WIDTH,
    height: initialHeight,
    onResize: debounce(
      () => {
        invariant(diagnosticsPanel);
        props.height = diagnosticsPanel.getHeight();
        render();
      },
      /* debounceIntervalMs */ 50,
      /* immediate */ false),
    onDismiss() {
      invariant(bottomPanel);
      bottomPanel.hide();
    },
    pathToActiveTextEditor,
    filterByActiveTextEditor: initialfilterByActiveTextEditor,
    onFilterByActiveTextEditorChange(isChecked: boolean) {
      props.filterByActiveTextEditor = isChecked;
      render();
    },
    warnAboutLinter: false,
    disableLinter,
  };

  const item = document.createElement('div');
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

    diagnosticsPanel = React.render(<DiagnosticsPanel {...props} />, item);
  }

  const activePaneItemSubscription = atom.workspace.onDidChangeActivePaneItem(paneItem => {
    if (isTextEditor(paneItem)) {
      props.pathToActiveTextEditor = paneItem ? paneItem.getPath() : null;
      if (props.filterByActiveTextEditor) {
        render();
      }
    }
  });

  const messagesDidUpdateSubscription = diagnosticUpdater.onAllMessagesDidUpdate(
    (messages: Array<DiagnosticMessage>) => {
      props.diagnostics = messages;
      diagnosticsNeedSorting = true;
      render();
    }
  );

  function setWarnAboutLinter(warn: boolean) {
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
  const iframe = window.document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '1px';
  iframe.style.position = 'absolute';
  iframe.style.visibility = 'hidden';
  iframe.style.border = 'none';

  // Both the iframe and the host element for the React component are children of the root element
  // that serves as the item for the panel.
  const rootElement = document.createElement('div');
  rootElement.appendChild(iframe);
  rootElement.appendChild(item);
  bottomPanel = atom.workspace.addBottomPanel({item: rootElement});

  // Now that the iframe is in the DOM, subscribe to its resize events.
  const win = iframe.contentWindow;
  const resizeListener = debounce(
    () => {
      props.width = win.innerWidth;
      render();
    },
    /* debounceIntervalMs */ 50,
    /* immediate */ false);
  win.addEventListener('resize', resizeListener);

  // Currently, destroy() does not appear to be idempotent:
  // https://github.com/atom/atom/commit/734a79b7ec9f449669e1871871fd0289397f9b60#commitcomment-12631908
  bottomPanel.onDidDestroy(() => {
    activePaneItemSubscription.dispose();
    messagesDidUpdateSubscription.dispose();
    win.removeEventListener('resize', resizeListener);
    React.unmountComponentAtNode(item);
  });

  return {
    atomPanel: bottomPanel,
    getDiagnosticsPanel(): ?DiagnosticsPanel {
      return diagnosticsPanel;
    },
    setWarnAboutLinter,
  };
}

module.exports = {
  createDiagnosticsPanel,
};
