"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEpics = getEpics;
exports.applyRefactoring = applyRefactoring;

function _projects() {
  const data = require("../../../../nuclide-commons-atom/projects");

  _projects = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

var _atom = require("atom");

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _diffparser() {
  const data = _interopRequireDefault(require("diffparser"));

  _diffparser = function () {
    return data;
  };

  return data;
}

function _textEdit() {
  const data = require("../../../../nuclide-commons-atom/text-edit");

  _textEdit = function () {
    return data;
  };

  return data;
}

function _textEditDiff() {
  const data = require("../../../../nuclide-commons-atom/text-edit-diff");

  _textEditDiff = function () {
    return data;
  };

  return data;
}

function _textEditor() {
  const data = require("../../../../nuclide-commons-atom/text-editor");

  _textEditor = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/analytics"));

  _analytics = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./refactorActions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
function getEpics(providers) {
  return [function getRefactoringsEpic(actions) {
    return actions.ofType('open').switchMap(() => {
      return _RxMin.Observable.fromPromise(getRefactorings(providers)).takeUntil(actions);
    });
  }, function executeRefactoringEpic(actions) {
    return actions.ofType('execute').switchMap(action => {
      // Flow doesn't understand the implications of ofType :(
      if (!(action.type === 'execute')) {
        throw new Error("Invariant violation: \"action.type === 'execute'\"");
      }

      return executeRefactoring(action).concat( // Default handler if we don't get a result.
      _RxMin.Observable.of(Actions().error('execute', Error('Could not refactor.')))).takeUntil(actions.filter(x => x.type !== 'progress'));
    });
  }, function applyRefactoringEpic(actions) {
    return actions.ofType('apply').switchMap(action => {
      if (!(action.type === 'apply')) {
        throw new Error("Invariant violation: \"action.type === 'apply'\"");
      }

      return applyRefactoring(action).takeUntil(actions.ofType('close'));
    });
  }, function loadDiffPreviewEpic(actions) {
    return actions.ofType('load-diff-preview').switchMap(action => {
      if (!(action.type === 'load-diff-preview')) {
        throw new Error("Invariant violation: \"action.type === 'load-diff-preview'\"");
      }

      return _RxMin.Observable.fromPromise(loadDiffPreview(action.payload.uri, action.payload.response));
    });
  }, function handleErrors(actions) {
    return actions.ofType('error').map(action => {
      if (!(action.type === 'error')) {
        throw new Error("Invariant violation: \"action.type === 'error'\"");
      }

      const {
        source,
        error
      } = action.payload;
      const sourceName = source === 'got-refactorings' ? 'getting refactors' : 'executing refactor';
      (0, _log4js().getLogger)('nuclide-refactorizer').error(`Error ${sourceName}:`, error);
      atom.notifications.addError(`Error ${sourceName}`, {
        description: error.message,
        dismissable: true
      });
      return Actions().close();
    });
  }];
}

async function getRefactorings(providers) {
  _analytics().default.track('nuclide-refactorizer:get-refactorings');

  const editor = atom.workspace.getActiveTextEditor();

  if (editor == null || editor.getPath() == null) {
    return Actions().error('get-refactorings', Error('Must be run from a saved file.'));
  }

  try {
    const selectedRange = editor.getSelectedBufferRange();
    const provider = Array.from(providers.getAllProvidersForEditor(editor)).find(p => p.refactorings != null);

    if (provider == null || provider.refactorings == null) {
      return Actions().error('get-refactorings', Error('No providers found.'));
    }

    const availableRefactorings = await provider.refactorings(editor, selectedRange);
    availableRefactorings.sort((x, y) => (x.disabled === true ? 1 : 0) - (y.disabled === true ? 1 : 0));
    return Actions().gotRefactorings(editor, selectedRange, provider, availableRefactorings);
  } catch (e) {
    return Actions().error('get-refactorings', e);
  }
}

function executeRefactoring(action) {
  const {
    refactoring,
    provider
  } = action.payload;

  if (provider.refactor != null && refactoring.kind === 'freeform') {
    return provider.refactor(refactoring).map(response => {
      switch (response.type) {
        case 'progress':
          return Actions().progress(response.message, response.value, response.max);

        case 'edit':
        case 'external-edit':
        case 'rename-external-edit':
          if (response.edits.size <= 1) {
            return Actions().apply(response);
          }

          return Actions().confirm(response);

        default:
          response;
          throw new Error();
      }
    }).catch(e => _RxMin.Observable.of(Actions().error('execute', e)));
  } else if (provider.rename != null && refactoring.kind === 'rename') {
    const {
      editor,
      position,
      newName
    } = refactoring;
    return _RxMin.Observable.fromPromise(provider.rename(editor, position, newName)).map(edits => {
      if (edits == null || edits.size === 0) {
        return Actions().close();
      }

      const currentFilePath = editor.getPath();

      if (!(currentFilePath != null)) {
        throw new Error("Invariant violation: \"currentFilePath != null\"");
      } // If the map only has 1 key (a single unique NuclideURI) and it matches the
      //  currently opened file, then all the TextEdits must be local.


      let response;

      if (edits.size === 1 && edits.keys().next().value === currentFilePath) {
        response = {
          type: 'edit',
          edits
        };
        return Actions().apply(response);
      } else {
        response = {
          type: 'rename-external-edit',
          edits
        };
        return Actions().confirm(response);
      }
    });
  } else {
    return _RxMin.Observable.of(Actions().error('execute', Error('No appropriate provider found.')));
  }
} // This offers two different options for applying edits:
//  1. Apply changes to open files only without saving
//  2. Apply changes to all files, open or unopened, directly to disk.
// In both cases, the format of the edits are the same (TextEdits)


const FILE_IO_CONCURRENCY = 4;

function applyRefactoring(action) {
  return _RxMin.Observable.defer(() => {
    const {
      response
    } = action.payload;

    let editStream = _RxMin.Observable.empty();

    if (response.type === 'edit') {
      // Regular edits are applied directly to open buffers.
      for (const [path, edits] of response.edits) {
        const editor = (0, _textEditor().existingEditorForUri)(path);

        if (editor != null) {
          (0, _textEdit().applyTextEditsToBuffer)(editor.getBuffer(), edits);
        } else {
          return _RxMin.Observable.of(Actions().error('execute', Error(`Local Rename: Expected file ${path} to be open.`)));
        }
      }
    } else {
      // NOTE: Flow is unable to associate the type of the response with the
      //        type of the edit. In order to give it this information, we had
      //        no choice but to be SUPER hacky and assign a type to each edit.
      let typedEdits;

      switch (response.type) {
        case 'external-edit':
          typedEdits = Array.from(response.edits.entries()).map(([path, edits]) => [path, edits.map(edit => {
            return {
              type: 'external-edit',
              edit
            };
          })]);
          break;

        case 'rename-external-edit':
          typedEdits = Array.from(response.edits.entries()).map(([path, edits]) => [path, edits.map(edit => {
            return {
              type: 'rename-external-edit',
              edit
            };
          })]);
          break;

        default:
          throw new Error(`Unhandled response type: ${response.type}`);
      } // External text edits are converted into absolute character offsets
      //  and applied directly to disk.


      editStream = _RxMin.Observable.from(typedEdits).mergeMap(async ([path, textEdits]) => {
        const file = (0, _projects().getFileForPath)(path);

        if (file == null) {
          throw new Error(`Could not read file ${path}`);
        }

        let data = await file.read();
        const buffer = new _atom.TextBuffer(data);
        const edits = textEdits.map(textEdit => {
          switch (textEdit.type) {
            case 'rename-external-edit':
              return toAbsoluteCharacterOffsets(buffer, textEdit.edit);

            case 'external-edit':
              return textEdit.edit;

            default:
              throw new Error(`Unhandled response type: ${response.type}`);
          }
        });
        edits.sort((a, b) => a.startOffset - b.startOffset);
        edits.reverse().forEach(edit => {
          if (edit.oldText != null) {
            const oldText = data.substring(edit.startOffset, edit.endOffset);

            if (oldText !== edit.oldText) {
              throw new Error(`Cannot apply refactor: file contents of ${path} have changed!`);
            }
          }

          data = data.slice(0, edit.startOffset) + edit.newText + data.slice(edit.endOffset);
        });
        await file.write(data);
      }, FILE_IO_CONCURRENCY).scan((done, _) => done + 1, 0).startWith(0).map(done => Actions().progress('Applying edits...', done, response.edits.size));
    }

    return _RxMin.Observable.concat(editStream, _RxMin.Observable.of(Actions().close()).do(() => _analytics().default.track('nuclide-refactorizer:success')));
  });
}

async function loadDiffPreview(uri, response) {
  const file = (0, _projects().getFileForPath)(uri);

  if (file == null) {
    throw new Error(`Could not read file ${uri}`);
  }

  const buffer = new _atom.TextBuffer((await file.read()));
  const edits = getEdits(uri, buffer, response);
  const diffString = (0, _textEditDiff().toUnifiedDiff)(_nuclideUri().default.basename(uri), buffer, edits);
  return Actions().displayDiffPreview((0, _diffparser().default)(diffString));
}

function getEdits(uri, buffer, response) {
  switch (response.type) {
    case 'edit':
    case 'rename-external-edit':
      return response.edits.get(uri) || [];

    case 'external-edit':
      return (response.edits.get(uri) || []).map(e => toTextEdit(buffer, e));

    default:
      return [];
  }
}

function toTextEdit(buffer, edit) {
  return {
    oldRange: new _atom.Range(buffer.positionForCharacterIndex(edit.startOffset), buffer.positionForCharacterIndex(edit.endOffset)),
    oldText: edit.oldText,
    newText: edit.newText
  };
}

function toAbsoluteCharacterOffsets(buffer, edit) {
  const startingPoint = edit.oldRange.start;
  const endingPoint = edit.oldRange.end;
  return {
    startOffset: buffer.characterIndexForPosition(startingPoint),
    endOffset: buffer.characterIndexForPosition(endingPoint),
    newText: edit.newText,
    oldText: edit.oldText
  };
}