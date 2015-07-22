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
      highlightCssClass = ERROR_HIGHLIGHT_CSS;
      gutterMarkerCssClass = ERROR_GUTTER_CSS;
    } else {
      highlightCssClass = WARNING_HIGHLIGHT_CSS;
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
    var item = document.createElement('span');
    item.innerText = '\u25B6'; // Unicode character for a right-pointing triangle.
    item.className = gutterMarkerCssClass;
    gutter.decorateMarker(gutterMarker, {item});
    markers.add(gutterMarker);
  }

  editorToMarkers.set(editor, markers);

  if (update.messages.length > 0) {
    gutter.show();
  } else {
    gutter.hide();
  }
}

module.exports = {
  applyUpdateToEditor,
};
