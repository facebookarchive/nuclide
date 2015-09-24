'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var {track} = require('nuclide-analytics');
var React = require('react-for-atom');

var GUTTER_ID = 'nuclide-diagnostics-gutter';

// Needs to be the same as glyph-height in gutter.atom-text-editor.less.
const GLYPH_HEIGHT = 15; // px

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
var HIGHLIGHT_CSS = 'nuclide-diagnostics-gutter-ui-highlight';

var ERROR_HIGHLIGHT_CSS = 'nuclide-diagnostics-gutter-ui-highlight-error';
var WARNING_HIGHLIGHT_CSS = 'nuclide-diagnostics-gutter-ui-highlight-warning';

var ERROR_GUTTER_CSS = 'nuclide-diagnostics-gutter-ui-gutter-error';
var WARNING_GUTTER_CSS = 'nuclide-diagnostics-gutter-ui-gutter-warning';

var editorToMarkers: WeakMap<TextEditor, Set<atom$Marker>> = new WeakMap();
var itemToEditor: WeakMap<HTMLElement, TextEditor> = new WeakMap();

function applyUpdateToEditor(editor: TextEditor, update: FileMessageUpdate): void {
  var gutter = editor.gutterWithName(GUTTER_ID);
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

  var marker;
  var markers = editorToMarkers.get(editor);

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

  var rowToMessage: Map<number, Array<FileDiagnosticMessage>> = new Map();
  function addMessageForRow(message: FileDiagnosticMessage, row: number) {
    var messages = rowToMessage.get(row);
    if (!messages) {
      messages = [];
      rowToMessage.set(row, messages);
    }
    messages.push(message);
  }

  for (var message of update.messages) {
    var range = message.range;
    var highlightMarker;
    if (range) {
      addMessageForRow(message, range.start.row);
      highlightMarker = editor.markBufferRange(range);
    } else {
      addMessageForRow(message, 0);
    }

    var highlightCssClass;
    var gutterMarkerCssClass;
    if (message.type === 'Error') {
      highlightCssClass = HIGHLIGHT_CSS + ' ' + ERROR_HIGHLIGHT_CSS;
      gutterMarkerCssClass = ERROR_GUTTER_CSS;
    } else {
      highlightCssClass = HIGHLIGHT_CSS + ' ' + WARNING_HIGHLIGHT_CSS;
      gutterMarkerCssClass = WARNING_GUTTER_CSS;
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
  for (var [row, messages] of rowToMessage.entries()) {
    // If at least one of the diagnostics is an error rather than the warning,
    // display the glyph in the gutter to represent an error rather than a warning.
    var gutterMarkerCssClass = messages.some(msg => msg.type === 'Error')
      ? ERROR_GUTTER_CSS
      : WARNING_GUTTER_CSS;

    // This marker adds some UI to the gutter.
    var {item, dispose} = createGutterItem(messages, gutterMarkerCssClass);
    itemToEditor.set(item, editor);
    var gutterMarker = editor.markBufferPosition([row, 0]);
    gutter.decorateMarker(gutterMarker, {item});
    gutterMarker.onDidDestroy(dispose);
    markers.add(gutterMarker);
  }

  editorToMarkers.set(editor, markers);

  // Once the gutter is shown for the first time, it is displayed for the lifetime of the TextEditor.
  if (update.messages.length > 0) {
    gutter.show();
  }
}

function createGutterItem(
  messages: Array<FileDiagnosticMessage>,
  gutterMarkerCssClass: string
): {item: HTMLElement; dispose: () => void} {
  const item = window.document.createElement('span');
  item.innerText = '\u25B6'; // Unicode character for a right-pointing triangle.
  item.className = gutterMarkerCssClass;
  let popupElement = null;
  let paneItemSubscription = null;
  const dispose = () => {
    if (popupElement) {
      React.unmountComponentAtNode(popupElement);
      popupElement.parentNode.removeChild(popupElement);
      popupElement = null;
    }
    if (paneItemSubscription) {
      paneItemSubscription.dispose();
      paneItemSubscription = null;
    }
  };
  item.addEventListener('mouseenter', event => {
    // If there was somehow another popup for this gutter item, dispose it. This can happen if the
    // user manages to scroll and escape disposal.
    dispose();
    popupElement = showPopupFor(messages, item);
    popupElement.addEventListener('mouseleave', dispose);
    // This makes sure that the popup disappears when you ctrl+tab to switch tabs.
    paneItemSubscription = atom.workspace.onDidChangeActivePaneItem(dispose);
  });
  return {item, dispose};
}

/**
 * Shows a popup for the diagnostic just below the specified item.
 */
function showPopupFor(
    messages: Array<FileDiagnosticMessage>,
    item: HTMLElement
    ): HTMLElement {
  var children = messages.map(message => {
    const contents = createElementForMessage(message);
    var diagnosticTypeClass = message.type === 'Error'
      ? 'nuclide-diagnostics-gutter-ui-popup-error'
      : 'nuclide-diagnostics-gutter-ui-popup-warning';
    return (
      <div className={`nuclide-diagnostics-gutter-ui-popup-diagnostic ${diagnosticTypeClass}`}>
        {contents}
      </div>
    );
  });

  // The popup will be an absolutely positioned child element of <atom-workspace> so that it appears
  // on top of everything.
  var workspaceElement = atom.views.getView(atom.workspace);
  var hostElement = window.document.createElement('div');
  workspaceElement.parentNode.appendChild(hostElement);

  // Move it down vertically so it does not end up under the mouse pointer.
  var {top, left} = item.getBoundingClientRect();

  React.render(
    <DiagnosticsPopup left={left} top={top}>
      {children}
    </DiagnosticsPopup>,
    hostElement);

  // Check to see whether the popup is within the bounds of the TextEditor. If not, display it above
  // the glyph rather than below it.
  var editor = itemToEditor.get(item);
  var editorElement = atom.views.getView(editor);
  var {top: editorTop, height: editorHeight} = editorElement.getBoundingClientRect();
  var {top: itemTop, height: itemHeight} = item.getBoundingClientRect();
  var popupHeight = hostElement.firstElementChild.clientHeight;
  if ((itemTop + itemHeight + popupHeight) > (editorTop + editorHeight)) {
    var popupElement = hostElement.firstElementChild;
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
        'diagnostics-message': message.text || message.html,
      });
    });
  }
}

function createElementForMessage(message: FileDiagnosticMessage): HTMLElement {
  const providerClassName = message.type === 'Error'
    ? 'highlight-error'
    : 'highlight-warning';
  const providerNameDiv =
      <div className={`text-center ${providerClassName}`}>{message.providerName}</div>;
  const traceElements = message.trace
    ? message.trace.map(createElementForTrace)
    : null;
  return (
    <div>
      {providerNameDiv}
      <div>{createMessageSpan(message)}</div>
      {traceElements}
    </div>
  );
}

function createElementForTrace(trace: Trace): HTMLElement {
  let locString = null;
  if (trace.filePath) {
    locString = `: ${trace.filePath}`;
    if (trace.range) {
      locString += `:${trace.range.start.row + 1}`;
    }
  }
  return (
    <div>
      {createMessageSpan(trace)}
      {locString}
    </div>
  );
}

function createMessageSpan(message: {html?: string, text?: string}): HTMLElement {
  if (message.html) {
    return <span dangerouslySetInnerHTML={{__html: message.html}} />;
  } else if (message.text) {
    return <span>{message.text}</span>;
  } else {
    return <span>Diagnostic lacks message.</span>;
  }
}

class DiagnosticsPopup extends React.Component {

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

var {PropTypes} = React;

DiagnosticsPopup.propTypes = {
  children: PropTypes.node,
  left: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired,
};

module.exports = {
  applyUpdateToEditor,
};
