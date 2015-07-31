'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
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

  for (var message of update.messages) {
    var range = message.range;
    var highlightMarker;
    var gutterMarker;
    if (range) {
      gutterMarker = editor.markBufferPosition([range.start.row, 0]);
      highlightMarker = editor.markBufferRange(range);
    } else {
      gutterMarker = editor.markBufferPosition([0, 0]);
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

    // This marker adds some UI to the gutter.
    var {item, dispose} = createGutterItem(message, gutterMarkerCssClass);
    gutter.decorateMarker(gutterMarker, {item});
    gutterMarker.onDidDestroy(dispose);
    markers.add(gutterMarker);
  }

  editorToMarkers.set(editor, markers);

  if (update.messages.length > 0) {
    gutter.show();
  } else {
    gutter.hide();
  }
}

function createGutterItem(
  message: FileDiagnosticMessage,
  gutterMarkerCssClass: string
): {item: HTMLElement; dispose: () => void} {
  var item = window.document.createElement('span');
  item.innerText = '\u25B6'; // Unicode character for a right-pointing triangle.
  item.className = gutterMarkerCssClass;
  var popupElement;
  item.addEventListener('mouseenter', event => {
    popupElement = showPopupFor(message, item);
  });
  var dispose = () => {
    if (popupElement) {
      popupElement.parentNode.removeChild(popupElement);
    }
  };
  item.addEventListener('mouseleave', dispose);
  return {item, dispose};
}

/**
 * Shows a popup for the diagnostic just below the specified item.
 */
function showPopupFor(
    message: FileDiagnosticMessage,
    item: HTMLElement
    ): HTMLElement {
  var div = window.document.createElement('div');
  var diagnosticTypeClass = message.type === 'Error'
    ? 'nuclide-diagnostics-gutter-ui-gutter-popup-error'
    : 'nuclide-diagnostics-gutter-ui-gutter-popup-warning';
  div.className = 'nuclide-diagnostics-gutter-ui-gutter-popup ' + diagnosticTypeClass;

  var {top, left} = item.getBoundingClientRect();

  if (message.html) {
    div.innerHTML = message.html;
  } else if (message.text) {
    div.innerText = message.providerName + ': ' + message.text;
  } else {
    div.innerText = 'Diagnostic lacks message.';
  }

  // Move it down vertically so it does not end up under the mouse pointer.
  div.style.top = (top + 15) + 'px';
  div.style.left = left + 'px';

  var workspaceElement = atom.views.getView(atom.workspace);
  workspaceElement.parentNode.appendChild(div);

  return div;
}

module.exports = {
  applyUpdateToEditor,
};
