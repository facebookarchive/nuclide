'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var React = require('react-for-atom');

var GUTTER_ID = 'nuclide-diagnostics-gutter';

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
  var item = window.document.createElement('span');
  item.innerText = '\u25B6'; // Unicode character for a right-pointing triangle.
  item.className = gutterMarkerCssClass;
  var popupElement;
  item.addEventListener('mouseenter', event => {
    popupElement = showPopupFor(messages, item);
  });
  var dispose = () => {
    if (popupElement) {
      React.unmountComponentAtNode(popupElement);
      popupElement.parentNode.removeChild(popupElement);
      popupElement = null;
    }
  };
  item.addEventListener('mouseleave', dispose);
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
    var contents;
    if (message.html) {
      contents = <span dangerouslySetInnerHTML={{__html: message.html}} />;
    } else if (message.text) {
      contents = <span>{`${message.providerName}: ${message.text}`}</span>;
    } else {
      contents = <span>Diagnostic lacks message.</span>;
    }

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
  top += 15;

  React.render(
    <DiagnosticsPopup left={left} top={top}>
      {children}
    </DiagnosticsPopup>,
    hostElement);

  return hostElement;
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
