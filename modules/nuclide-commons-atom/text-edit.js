'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyTextEditsForMultipleFiles = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Attempts to apply the given patches for multiple files. Accepts a Map as input
 * with file paths as keys and a corresponding array of TextEdits as values.
 *
 * It is an error to send overlapping text-edits. All text-edits describe changes
 * made to the initial document version. The order of the edits does not matter
 * as they will be sorted before they are applied.
 *
 * All changes will be applied to the buffers but not saved. If a file is not
 * currently open, it will be opened.
 *
 * If a change is undone (Cmd+Z), only the changes of the current
 * file will be undone. All of the changes for that file will be undone at once.
 *
 * Returns true if the application was successful, otherwise false. If any of
 * the changes fail, for ANY file, then none of the changes are applied.
 */
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

let applyTextEditsForMultipleFiles = exports.applyTextEditsForMultipleFiles = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (changes) {
    const paths = Array.from(changes.keys());

    // NOTE: There is a race here. If the file contents change while the
    // editors are being opened, then the ranges of the TextEdits will be off.
    // However, currently this is only used to applyEdits to open files.
    const editors = yield Promise.all(paths.map((() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (path) {
        return (0, (_goToLocation || _load_goToLocation()).goToLocation)(path);
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    })()));
    const checkpoints = editors.map(function (editor) {
      if (!(editor != null)) {
        throw new Error('Invariant violation: "editor != null"');
      }

      const buffer = editor.getBuffer();
      return [buffer, buffer.createCheckpoint()];
    });
    const allOkay = paths.reduce(function (successSoFar, path) {
      const edits = changes.get(path);
      return successSoFar && edits != null && applyTextEdits(path, ...edits);
    }, true);
    if (!allOkay) {
      checkpoints.forEach(function ([buffer, checkPoint]) {
        buffer.revertToCheckpoint(checkPoint);
        return false;
      });
    }
    return allOkay;
  });

  return function applyTextEditsForMultipleFiles(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Attempts to apply the given patches to the given file.
 *
 * It is an error to send overlapping edits. The order of the edits does not
 * matter (they will be sorted before they are applied).
 *
 * The file must be currently open in Atom, and the changes will be applied to the buffer but not
 * saved.
 *
 * Returns true if the application was successful, otherwise false (e.g. if the oldText did not
 * match).
 */


exports.applyTextEdits = applyTextEdits;
exports.applyTextEditsToBuffer = applyTextEditsToBuffer;

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('./text-editor');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('./go-to-location');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function applyTextEdits(path, ...edits) {
  // Sort the edits to be in order (For every edit, the start of its range will
  // be after the end of the previous edit's range.)
  edits.sort((e1, e2) => e1.oldRange.compare(e2.oldRange));
  if (editsOverlap(edits)) {
    throw new Error('applyTextEdits cannot be called with overlapping edits.');
  }
  const editor = (0, (_textEditor || _load_textEditor()).existingEditorForUri)(path);

  if (!(editor != null)) {
    throw new Error('Invariant violation: "editor != null"');
  }

  return applyTextEditsToBuffer(editor.getBuffer(), edits);
}

function applyTextEditsToBuffer(buffer, edits) {
  // Special-case whole-buffer changes to minimize disruption.
  if (edits.length === 1 && edits[0].oldRange.isEqual(buffer.getRange())) {
    if (edits[0].oldText != null && edits[0].oldText !== buffer.getText()) {
      return false;
    }
    buffer.setTextViaDiff(edits[0].newText);
    return true;
  }

  const checkpoint = buffer.createCheckpoint();

  // Iterate through in reverse order. Edits earlier in the file can move around text later in the
  // file, so to avoid conflicts edits should be applied last first.
  for (let i = edits.length - 1; i >= 0; i--) {
    const edit = edits[i];
    const success = applyToBuffer(buffer, edit);
    if (!success) {
      buffer.revertToCheckpoint(checkpoint);
      return false;
    }
  }

  buffer.groupChangesSinceCheckpoint(checkpoint);
  return true;
}

function applyToBuffer(buffer, edit) {
  if (edit.oldRange.start.row === edit.oldRange.end.row) {
    // A little extra validation when the old range spans only one line. In particular, this helps
    // when the old range is empty so there is no old text for us to compare against. We can at
    // least abort if the line isn't long enough.
    const lineLength = buffer.lineLengthForRow(edit.oldRange.start.row);
    if (edit.oldRange.end.column > lineLength) {
      return false;
    }
  }
  if (edit.oldText != null) {
    const currentText = buffer.getTextInRange(edit.oldRange);
    if (currentText !== edit.oldText) {
      return false;
    }
  }
  buffer.setTextInRange(edit.oldRange, edit.newText);
  return true;
}

// Returns whether an array of sorted TextEdits contain an overlapping range.
function editsOverlap(sortedEdits) {
  for (let i = 0; i < sortedEdits.length - 1; i++) {
    if (sortedEdits[i].oldRange.intersectsWith(sortedEdits[i + 1].oldRange)) {
      return true;
    }
  }
  return false;
}