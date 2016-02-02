'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  FileMessageUpdate,
  FileDiagnosticMessage,
  Trace,
} from '../../base';

import type {NuclideUri} from '../../../remote-uri';

import invariant from 'assert';

const {track} = require('../../../analytics');
const {
  React,
  ReactDOM,
} = require('react-for-atom');
const {PropTypes} = React;

const GUTTER_ID = 'nuclide-diagnostics-gutter';

// Needs to be the same as glyph-height in gutter.atom-text-editor.less.
const GLYPH_HEIGHT = 15; // px

const POPUP_DISPOSE_TIMEOUT = 100;

// TODO(mbolin): Make it so that when mousing over an element with this CSS class (or specifically,
// the child element with the "region" CSS class), we also do a showPopupFor(). This seems to be
// tricky given how the DOM of a TextEditor works today. There are div.tile elements, each of which
// has its own div.highlights element and many div.line elements. The div.highlights element has 0
// or more children, each child being a div.highlight with a child div.region. The div.region
// element is defined to be {position: absolute; pointer-events: none; z-index: -1}. The absolute
// positioning and negative z-index make it so it isn't eligible for mouseover events, so we
// might have to listen for mouseover events on TextEditor and then use its own APIs, such as
// decorationsForScreenRowRange(), to see if there is a hit target instead. Since this will be
// happening onmousemove, we also have to be careful to make sure this is not expensive.
const HIGHLIGHT_CSS = 'nuclide-diagnostics-gutter-ui-highlight';

const ERROR_HIGHLIGHT_CSS = 'nuclide-diagnostics-gutter-ui-highlight-error';
const WARNING_HIGHLIGHT_CSS = 'nuclide-diagnostics-gutter-ui-highlight-warning';

const ERROR_GUTTER_CSS = 'nuclide-diagnostics-gutter-ui-gutter-error';
const WARNING_GUTTER_CSS = 'nuclide-diagnostics-gutter-ui-gutter-warning';

const editorToMarkers: WeakMap<TextEditor, Set<atom$Marker>> = new WeakMap();
const itemToEditor: WeakMap<HTMLElement, TextEditor> = new WeakMap();

export function applyUpdateToEditor(
  editor: TextEditor,
  update: FileMessageUpdate,
  fixer: (message: FileDiagnosticMessage) => void,
): void {
  let gutter = editor.gutterWithName(GUTTER_ID);
  if (!gutter) {
    // TODO(jessicalin): Determine an appropriate priority so that the gutter:
    // (1) Shows up to the right of the line numbers.
    // (2) Shows the items that are added to it right away.
    // Using a value of 10 fixes (1), but breaks (2). This seems like it is likely a bug in Atom.

    // By default, a gutter will be destroyed when its editor is destroyed,
    // so there is no need to register a callback via onDidDestroy().
    gutter = editor.addGutter({
      name: GUTTER_ID,
      visible: false,
    });
  }

  let marker;
  let markers = editorToMarkers.get(editor);

  // TODO: Consider a more efficient strategy that does not blindly destroy all of the
  // existing markers.
  if (markers) {
    for (marker of markers) {
      marker.destroy();
    }
    markers.clear();
  } else {
    markers = new Set();
  }

  const rowToMessage: Map<number, Array<FileDiagnosticMessage>> = new Map();
  function addMessageForRow(message: FileDiagnosticMessage, row: number) {
    let messages = rowToMessage.get(row);
    if (!messages) {
      messages = [];
      rowToMessage.set(row, messages);
    }
    messages.push(message);
  }

  for (const message of update.messages) {
    const range = message.range;
    let highlightMarker;
    if (range) {
      addMessageForRow(message, range.start.row);
      highlightMarker = editor.markBufferRange(range);
    } else {
      addMessageForRow(message, 0);
    }

    let highlightCssClass;
    if (message.type === 'Error') {
      highlightCssClass = HIGHLIGHT_CSS + ' ' + ERROR_HIGHLIGHT_CSS;
    } else {
      highlightCssClass = HIGHLIGHT_CSS + ' ' + WARNING_HIGHLIGHT_CSS;
    }

    // This marker underlines text.
    if (highlightMarker) {
      editor.decorateMarker(highlightMarker, {
        type: 'highlight',
        class: highlightCssClass,
      });
      markers.add(highlightMarker);
    }
  }

  // Find all of the gutter markers for the same row and combine them into one marker/popup.
  for (const [row, messages] of rowToMessage.entries()) {
    // If at least one of the diagnostics is an error rather than the warning,
    // display the glyph in the gutter to represent an error rather than a warning.
    const gutterMarkerCssClass = messages.some(msg => msg.type === 'Error')
      ? ERROR_GUTTER_CSS
      : WARNING_GUTTER_CSS;

    // This marker adds some UI to the gutter.
    const {item, dispose} = createGutterItem(messages, gutterMarkerCssClass, fixer);
    itemToEditor.set(item, editor);
    const gutterMarker = editor.markBufferPosition([row, 0]);
    gutter.decorateMarker(gutterMarker, {item});
    gutterMarker.onDidDestroy(dispose);
    markers.add(gutterMarker);
  }

  editorToMarkers.set(editor, markers);

  // Once the gutter is shown for the first time, it is displayed for the lifetime of the
  // TextEditor.
  if (update.messages.length > 0) {
    gutter.show();
  }
}

function createGutterItem(
  messages: Array<FileDiagnosticMessage>,
  gutterMarkerCssClass: string,
  fixer: (message: FileDiagnosticMessage) => void,
): {item: HTMLElement; dispose: () => void} {
  const item = window.document.createElement('span');
  item.innerText = '\u25B6'; // Unicode character for a right-pointing triangle.
  item.className = gutterMarkerCssClass;
  let popupElement = null;
  let paneItemSubscription = null;
  let disposeTimeout = null;
  const clearDisposeTimeout = () => {
    if (disposeTimeout) {
      clearTimeout(disposeTimeout);
    }
  };
  const dispose = () => {
    if (popupElement) {
      ReactDOM.unmountComponentAtNode(popupElement);
      popupElement.parentNode.removeChild(popupElement);
      popupElement = null;
    }
    if (paneItemSubscription) {
      paneItemSubscription.dispose();
      paneItemSubscription = null;
    }
    clearDisposeTimeout();
  };
  const goToLocation = (path: string, line: number) => {
    // Before we jump to the location, we want to close the popup.
    dispose();
    const options = {
      searchAllPanes: true,
      initialLine: line,
    };
    atom.workspace.open(path, options);
  };
  item.addEventListener('mouseenter', event => {
    // If there was somehow another popup for this gutter item, dispose it. This can happen if the
    // user manages to scroll and escape disposal.
    dispose();
    popupElement = showPopupFor(messages, item, goToLocation, fixer);
    popupElement.addEventListener('mouseleave', dispose);
    popupElement.addEventListener('mouseenter', clearDisposeTimeout);
    // This makes sure that the popup disappears when you ctrl+tab to switch tabs.
    paneItemSubscription = atom.workspace.onDidChangeActivePaneItem(dispose);
  });
  item.addEventListener('mouseleave', event => {
    // When the popup is shown, we want to dispose it if the user manages to move the cursor off of
    // the gutter glyph without moving it onto the popup. Even though the popup appears above (as in
    // Z-index above) the gutter glyph, if you move the cursor such that it is only above the glyph
    // for one frame you can cause the popup to appear without the mouse ever entering it.
    disposeTimeout = setTimeout(dispose, POPUP_DISPOSE_TIMEOUT);
  });
  return {item, dispose};
}

/**
 * Shows a popup for the diagnostic just below the specified item.
 */
function showPopupFor(
    messages: Array<FileDiagnosticMessage>,
    item: HTMLElement,
    goToLocation: (filePath: NuclideUri, line: number) => mixed,
    fixer: (message: FileDiagnosticMessage) => void,
    ): HTMLElement {
  const children = messages.map(message => {
    const contents = createElementForMessage(message, goToLocation, fixer);
    const diagnosticTypeClass = message.type === 'Error'
      ? 'nuclide-diagnostics-gutter-ui-popup-error'
      : 'nuclide-diagnostics-gutter-ui-popup-warning';
    // native-key-bindings and tabIndex=-1 are both needed to allow copying the text in the popup.
    const classes =
      `native-key-bindings nuclide-diagnostics-gutter-ui-popup-diagnostic ${diagnosticTypeClass}`;
    return (
      <div tabIndex={-1} className={classes}>
        {contents}
      </div>
    );
  });
  // The popup will be an absolutely positioned child element of <atom-workspace> so that it appears
  // on top of everything.
  const workspaceElement = atom.views.getView(atom.workspace);
  const hostElement = window.document.createElement('div');
  workspaceElement.parentNode.appendChild(hostElement);

  // Move it down vertically so it does not end up under the mouse pointer.
  const {top, left} = item.getBoundingClientRect();

  ReactDOM.render(
    <DiagnosticsPopup left={left} top={top}>
      {children}
    </DiagnosticsPopup>,
    hostElement
  );

  // Check to see whether the popup is within the bounds of the TextEditor. If not, display it above
  // the glyph rather than below it.
  const editor = itemToEditor.get(item);
  const editorElement = atom.views.getView(editor);
  const {top: editorTop, height: editorHeight} = editorElement.getBoundingClientRect();
  const {top: itemTop, height: itemHeight} = item.getBoundingClientRect();
  const popupHeight = hostElement.firstElementChild.clientHeight;
  if ((itemTop + itemHeight + popupHeight) > (editorTop + editorHeight)) {
    const popupElement = hostElement.firstElementChild;
    // Shift the popup back down by GLYPH_HEIGHT, so that the bottom padding overlaps with the
    // glyph. An additional 4 px is needed to make it look the same way it does when it shows up
    // below. I don't know why.
    popupElement.style.top = String(itemTop - popupHeight + GLYPH_HEIGHT + 4) + 'px';
  }

  try {
    return hostElement;
  } finally {
    messages.forEach(message => {
      track('diagnostics-gutter-show-popup', {
        'diagnostics-provider': message.providerName,
        'diagnostics-message': message.text || message.html || '',
      });
    });
  }
}

function createElementForMessage(
  message: FileDiagnosticMessage,
  goToLocation: (path: string, line: number) => mixed,
  fixer: (message: FileDiagnosticMessage) => void,
): HTMLElement {
  const providerClassName = message.type === 'Error'
    ? 'highlight-error'
    : 'highlight-warning';
  const copy = () => {
    const text = plainTextForDiagnostic(message);
    atom.clipboard.write(text);
  };
  let fixButton = null;
  if (message.fix != null) {
    const applyFix = () => {
      fixer(message);
      track('diagnostics-gutter-autofix');
    };
    fixButton = (
      <button className="btn btn-xs" onClick={applyFix}>Fix</button>
    );
  }
  const header = (
    <div className="nuclide-diagnostics-gutter-ui-popup-header">
      {fixButton}
      <button className="btn btn-xs" onClick={copy}>Copy</button>
      <span className={`pull-right ${providerClassName}`}>{message.providerName}</span>
    </div>
  );
  const traceElements = message.trace
    ? message.trace.map(traceItem => createElementForTrace(traceItem, goToLocation))
    : null;
  return (
    <div>
      {header}
      <div>{createMessageSpan(message)}</div>
      {traceElements}
    </div>
  );
}

function plainTextForDiagnostic(message: FileDiagnosticMessage): string {
  const {getPath} = require('../../../remote-uri');
  function plainTextForItem(item: FileDiagnosticMessage | Trace): string {
    let mainComponent = undefined;
    if (item.html != null) {
      // Quick and dirty way to get an approximation for the plain text from HTML. This will work in
      // simple cases, anyway.
      mainComponent = item.html.replace('<br/>', '\n').replace(/<[^>]*>/g, '');
    } else {
      invariant(item.text != null);
      mainComponent = item.text;
    }

    let pathComponent = undefined;
    if (item.filePath == null) {
      pathComponent = '';
    } else {
      const lineComponent = item.range != null ? `:${item.range.start.row + 1}` : '';
      pathComponent = ': ' + getPath(item.filePath) + lineComponent;
    }

    return mainComponent + pathComponent;
  }
  const trace = message.trace != null ? message.trace : [];
  return [message, ...trace].map(plainTextForItem).join('\n');
}

function createElementForTrace(
  trace: Trace,
  goToLocation: (path: string, line: number) => mixed,
): HTMLElement {
  let locSpan = null;
  // Local variable so that the type refinement holds in the onClick handler.
  const path = trace.filePath;
  if (path) {
    const [, relativePath] = atom.project.relativizePath(path);
    let locString = relativePath;
    if (trace.range) {
      locString += `:${trace.range.start.row + 1}`;
    }
    const onClick = () => {
      track('diagnostics-gutter-goto-location');
      goToLocation(path, Math.max(trace.range ? trace.range.start.row : 0, 0));
    };
    locSpan = <span>: <a href="#" onClick={onClick}>{locString}</a></span>;
  }
  return (
    <div>
      {createMessageSpan(trace)}
      {locSpan}
    </div>
  );
}

function createMessageSpan(message: {html?: string, text?: string}): HTMLElement {
  if (message.html != null) {
    return <span dangerouslySetInnerHTML={{__html: message.html}} />;
  } else if (message.text != null) {
    return <span>{message.text}</span>;
  } else {
    return <span>Diagnostic lacks message.</span>;
  }
}

class DiagnosticsPopup extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    left: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired,
  };

  render() {
    return (
      <div
        className="nuclide-diagnostics-gutter-ui-popup"
        style={{left: this.props.left + 'px', top: this.props.top + 'px'}}
        >
        {this.props.children}
      </div>
    );
  }
}
