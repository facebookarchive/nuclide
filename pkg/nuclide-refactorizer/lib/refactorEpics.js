'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEpics = getEpics;
exports.applyRefactoring = applyRefactoring;

var _projects;

function _load_projects() {
  return _projects = require('../../../modules/nuclide-commons-atom/projects');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _atom = require('atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _diffparser;

function _load_diffparser() {
  return _diffparser = _interopRequireDefault(require('diffparser'));
}

var _textEdit;

function _load_textEdit() {
  return _textEdit = require('../../../modules/nuclide-commons-atom/text-edit');
}

var _textEditDiff;

function _load_textEditDiff() {
  return _textEditDiff = require('../../../modules/nuclide-commons-atom/text-edit-diff');
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('../../../modules/nuclide-commons-atom/text-editor');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _refactorActions;

function _load_refactorActions() {
  return _refactorActions = _interopRequireWildcard(require('./refactorActions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getEpics(providers) {
  return [function getRefactoringsEpic(actions) {
    return actions.ofType('open').switchMap(() => {
      return _rxjsBundlesRxMinJs.Observable.fromPromise(getRefactorings(providers)).takeUntil(actions);
    });
  }, function executeRefactoringEpic(actions) {
    return actions.ofType('execute').switchMap(action => {
      // Flow doesn't understand the implications of ofType :(
      if (!(action.type === 'execute')) {
        throw new Error('Invariant violation: "action.type === \'execute\'"');
      }

      return executeRefactoring(action).concat(
      // Default handler if we don't get a result.
      _rxjsBundlesRxMinJs.Observable.of((_refactorActions || _load_refactorActions()).error('execute', Error('Could not refactor.')))).takeUntil(actions.filter(x => x.type !== 'progress'));
    });
  }, function applyRefactoringEpic(actions) {
    return actions.ofType('apply').switchMap(action => {
      if (!(action.type === 'apply')) {
        throw new Error('Invariant violation: "action.type === \'apply\'"');
      }

      return applyRefactoring(action).takeUntil(actions.ofType('close'));
    });
  }, function loadDiffPreviewEpic(actions) {
    return actions.ofType('load-diff-preview').switchMap(action => {
      if (!(action.type === 'load-diff-preview')) {
        throw new Error('Invariant violation: "action.type === \'load-diff-preview\'"');
      }

      return _rxjsBundlesRxMinJs.Observable.fromPromise(loadDiffPreview(action.payload.uri, action.payload.response));
    });
  }, function handleErrors(actions) {
    return actions.ofType('error').map(action => {
      if (!(action.type === 'error')) {
        throw new Error('Invariant violation: "action.type === \'error\'"');
      }

      const { source, error } = action.payload;
      const sourceName = source === 'got-refactorings' ? 'getting refactors' : 'executing refactor';
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-refactorizer').error(`Error ${sourceName}:`, error);
      atom.notifications.addError(`Error ${sourceName}`, {
        description: error.message,
        dismissable: true
      });
      return (_refactorActions || _load_refactorActions()).close();
    });
  }];
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

async function getRefactorings(providers) {
  (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-refactorizer:get-refactorings');
  const editor = atom.workspace.getActiveTextEditor();
  if (editor == null || editor.getPath() == null) {
    return (_refactorActions || _load_refactorActions()).error('get-refactorings', Error('Must be run from a saved file.'));
  }
  const provider = providers.getProviderForEditor(editor);
  if (provider == null) {
    return (_refactorActions || _load_refactorActions()).error('get-refactorings', Error('No providers found.'));
  }
  try {
    const selectedRange = editor.getSelectedBufferRange();
    const availableRefactorings = await provider.refactorings(editor, selectedRange);
    availableRefactorings.sort((x, y) => (x.disabled === true ? 1 : 0) - (y.disabled === true ? 1 : 0));
    return (_refactorActions || _load_refactorActions()).gotRefactorings(editor, selectedRange, provider, availableRefactorings);
  } catch (e) {
    return (_refactorActions || _load_refactorActions()).error('get-refactorings', e);
  }
}

function executeRefactoring(action) {
  const { refactoring, provider } = action.payload;
  return provider.refactor(refactoring).map(response => {
    switch (response.type) {
      case 'progress':
        return (_refactorActions || _load_refactorActions()).progress(response.message, response.value, response.max);
      case 'edit':
      case 'external-edit':
        if (response.edits.size <= 1) {
          return (_refactorActions || _load_refactorActions()).apply(response);
        }
        return (_refactorActions || _load_refactorActions()).confirm(response);
      default:
        response;
        throw new Error();
    }
  }).catch(e => _rxjsBundlesRxMinJs.Observable.of((_refactorActions || _load_refactorActions()).error('execute', e)));
}

const FILE_IO_CONCURRENCY = 4;

function applyRefactoring(action) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => {
    const { response } = action.payload;
    let editStream = _rxjsBundlesRxMinJs.Observable.empty();
    if (response.type === 'edit') {
      // Regular edits are applied directly to open buffers.
      for (const [path, edits] of response.edits) {
        const editor = (0, (_textEditor || _load_textEditor()).existingEditorForUri)(path);
        if (editor != null) {
          (0, (_textEdit || _load_textEdit()).applyTextEditsToBuffer)(editor.getBuffer(), edits);
        } else {
          return _rxjsBundlesRxMinJs.Observable.of((_refactorActions || _load_refactorActions()).error('execute', Error(`Expected file ${path} to be open.`)));
        }
      }
    } else {
      // External edits are applied directly to disk.
      editStream = _rxjsBundlesRxMinJs.Observable.from(response.edits).mergeMap(async ([path, edits]) => {
        const file = (0, (_projects || _load_projects()).getFileForPath)(path);
        if (file == null) {
          throw new Error(`Could not read file ${path}`);
        }
        let data = await file.read();
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
      }, FILE_IO_CONCURRENCY).scan((done, _) => done + 1, 0).startWith(0).map(done => (_refactorActions || _load_refactorActions()).progress('Applying edits...', done, response.edits.size));
    }
    return _rxjsBundlesRxMinJs.Observable.concat(editStream, _rxjsBundlesRxMinJs.Observable.of((_refactorActions || _load_refactorActions()).close()).do(() => (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-refactorizer:success')));
  });
}

async function loadDiffPreview(uri, response) {
  const file = (0, (_projects || _load_projects()).getFileForPath)(uri);
  if (file == null) {
    throw new Error(`Could not read file ${uri}`);
  }
  const buffer = new _atom.TextBuffer((await file.read()));
  const edits = getEdits(uri, buffer, response);
  const diffString = (0, (_textEditDiff || _load_textEditDiff()).toUnifiedDiff)((_nuclideUri || _load_nuclideUri()).default.basename(uri), buffer, edits);

  return (_refactorActions || _load_refactorActions()).displayDiffPreview((0, (_diffparser || _load_diffparser()).default)(diffString));
}

function getEdits(uri, buffer, response) {
  switch (response.type) {
    case 'edit':
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