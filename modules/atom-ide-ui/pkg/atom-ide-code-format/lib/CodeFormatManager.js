"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _config() {
  const data = require("./config");

  _config = function () {
    return data;
  };

  return data;
}

var _atom = require("atom");

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _ProviderRegistry() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/ProviderRegistry"));

  _ProviderRegistry = function () {
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

function _textEditor() {
  const data = require("../../../../nuclide-commons-atom/text-editor");

  _textEditor = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../../nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
// Save events are critical, so don't allow providers to block them.
const SAVE_TIMEOUT = 2500;

class CodeFormatManager {
  constructor() {
    this._subscriptions = new (_UniversalDisposable().default)(this._subscribeToEvents());
    this._rangeProviders = new (_ProviderRegistry().default)();
    this._fileProviders = new (_ProviderRegistry().default)();
    this._onTypeProviders = new (_ProviderRegistry().default)();
    this._onSaveProviders = new (_ProviderRegistry().default)();
  }
  /**
   * Subscribe to all formatting events (commands, saves, edits) and dispatch
   * formatters as necessary.
   * By handling all events in a central location, we ensure that no buffer
   * runs into race conditions with simultaneous formatters.
   */


  _subscribeToEvents() {
    // Events from the explicit Atom command.
    const commandEvents = (0, _event().observableFromSubscribeFunction)(callback => atom.commands.add('atom-text-editor', 'code-format:format-code', callback)).switchMap(() => {
      const editor = atom.workspace.getActiveTextEditor();

      if (!editor) {
        return _RxMin.Observable.empty();
      }

      return _RxMin.Observable.of({
        type: 'command',
        editor
      });
    }); // Events from editor actions (saving, typing).

    const editorEvents = (0, _event().observableFromSubscribeFunction)(cb => atom.workspace.observeTextEditors(cb)).mergeMap(editor => this._getEditorEventStream(editor));
    return _RxMin.Observable.merge(commandEvents, editorEvents) // Group events by buffer to prevent simultaneous formatting operations.
    .groupBy(event => event.editor.getBuffer(), event => event, grouped => (0, _event().observableFromSubscribeFunction)(callback => grouped.key.onDidDestroy(callback))).mergeMap(events => // Make sure we halt everything when the editor gets destroyed.
    events.let((0, _observable().completingSwitchMap)(event => this._handleEvent(event)))).subscribe();
  }
  /**
   * Returns a stream of all typing and saving operations from the editor.
   */


  _getEditorEventStream(editor) {
    const changeEvents = (0, _event().observableFromSubscribeFunction)(callback => editor.getBuffer().onDidChangeText(callback));

    const saveEvents = _RxMin.Observable.create(observer => {
      const realSave = editor.save;
      const newSaves = new _RxMin.Subject(); // HACK: intercept the real TextEditor.save and handle it ourselves.
      // Atom has no way of injecting content into the buffer asynchronously
      // before a save operation.
      // If we try to format after the save, and then save again,
      // it's a poor user experience (and also races the text buffer's reload).

      const editor_ = editor;

      editor_.save = () => {
        newSaves.next('new-save');
        return this._safeFormatCodeOnSave(editor).takeUntil(newSaves).toPromise().then(() => realSave.call(editor));
      };

      const subscription = newSaves.subscribe(observer);
      return () => {
        // Restore the save function when we're done.
        editor_.save = realSave;
        subscription.unsubscribe();
      };
    }); // We need to capture when editors are about to be destroyed in order to
    // interrupt any pending formatting operations. (Otherwise, we may end up
    // attempting to save a destroyed editor!)


    const willDestroyEvents = (0, _event().observableFromSubscribeFunction)(cb => atom.workspace.onWillDestroyPaneItem(cb)).filter(event => event.item === editor);
    return _RxMin.Observable.merge(changeEvents.map(edit => ({
      type: 'type',
      editor,
      edit
    })), saveEvents.map(type => ({
      type,
      editor
    }))).takeUntil(_RxMin.Observable.merge((0, _textEditor().observeEditorDestroy)(editor), willDestroyEvents));
  }

  _handleEvent(event) {
    const {
      editor
    } = event;

    switch (event.type) {
      case 'command':
        return this._formatCodeInTextEditor(editor).map(result => {
          if (!result) {
            throw new Error('No code formatting providers found!');
          }
        }).catch(err => {
          atom.notifications.addError(`Failed to format code: ${err.message}`, {
            detail: err.detail
          });
          return _RxMin.Observable.empty();
        });

      case 'type':
        return this._formatCodeOnTypeInTextEditor(editor, event.edit).catch(err => {
          (0, _log4js().getLogger)('code-format').warn('Failed to format code on type:', err);
          return _RxMin.Observable.empty();
        });

      case 'save':
        return this._safeFormatCodeOnSave(editor) // Fire-and-forget the original save function.
        // This is actually async for remote files, but we don't use the result.
        // NOTE: finally is important, as saves should still fire on unsubscribe.
        .finally(() => editor.getBuffer().save());

      case 'new-save':
        return _RxMin.Observable.empty();

      default:
        return _RxMin.Observable.throw(`unknown event type ${event.type}`);
    }
  } // Checks whether contents are same in the buffer post-format, throwing if
  // anything has changed.


  _checkContentsAreSame(before, after) {
    if (before !== after) {
      throw new Error('The file contents were changed before formatting was complete.');
    }
  } // Formats code in the editor specified, returning whether or not a
  // code formatter completed successfully.


  _formatCodeInTextEditor(editor, range) {
    return _RxMin.Observable.defer(() => {
      const buffer = editor.getBuffer();
      const selectionRange = range || editor.getSelectedBufferRange();
      const {
        start: selectionStart,
        end: selectionEnd
      } = selectionRange;
      let formatRange;

      if (selectionRange.isEmpty()) {
        // If no selection is done, then, the whole file is wanted to be formatted.
        formatRange = buffer.getRange();
      } else {
        // Format selections should start at the beginning of the line,
        // and include the last selected line end.
        // (If the user has already selected complete rows, then depending on how they
        // did it, their caret might be either (1) at the end of their last selected line
        // or (2) at the first column of the line AFTER their selection. In both cases
        // we snap the formatRange to end at the first column of the line after their
        // selection.)
        formatRange = new _atom.Range([selectionStart.row, 0], selectionEnd.column === 0 ? selectionEnd : [selectionEnd.row + 1, 0]);
      }

      const rangeProvider = this._rangeProviders.getProviderForEditor(editor);

      const fileProvider = this._fileProviders.getProviderForEditor(editor);

      const contents = editor.getText();

      if (rangeProvider != null && ( // When formatting the entire file, prefer file-based providers.
      !formatRange.isEqual(buffer.getRange()) || fileProvider == null)) {
        return _RxMin.Observable.defer(() => this._reportBusy(editor, rangeProvider.formatCode(editor, formatRange))).map(edits => {
          // Throws if contents have changed since the time of triggering format code.
          this._checkContentsAreSame(contents, editor.getText());

          if (!(0, _textEdit().applyTextEditsToBuffer)(editor.getBuffer(), edits)) {
            throw new Error('Could not apply edits to text buffer.');
          }

          return true;
        });
      } else if (fileProvider != null) {
        return _RxMin.Observable.defer(() => this._reportBusy(editor, fileProvider.formatEntireFile(editor, formatRange))).map(({
          newCursor,
          formatted
        }) => {
          // Throws if contents have changed since the time of triggering format code.
          this._checkContentsAreSame(contents, editor.getText());

          buffer.setTextViaDiff(formatted);
          const newPosition = newCursor != null ? buffer.positionForCharacterIndex(newCursor) : editor.getCursorBufferPosition(); // We call setCursorBufferPosition even when there is no newCursor,
          // because it unselects the text selection.

          editor.setCursorBufferPosition(newPosition);
          return true;
        });
      } else {
        return _RxMin.Observable.of(false);
      }
    });
  }

  _formatCodeOnTypeInTextEditor(editor, aggregatedEvent) {
    return _RxMin.Observable.defer(() => {
      // Don't try to format changes with multiple cursors.
      if (aggregatedEvent.changes.length !== 1) {
        return _RxMin.Observable.empty();
      }

      const event = aggregatedEvent.changes[0]; // This also ensures the non-emptiness of event.newText for below.

      if (!shouldFormatOnType(event) || !(0, _config().getFormatOnType)()) {
        return _RxMin.Observable.empty();
      } // In the case of bracket-matching, we use the last character because that's
      // the character that will usually cause a reformat (i.e. `}` instead of `{`).


      const character = event.newText[event.newText.length - 1];

      const provider = this._onTypeProviders.getProviderForEditor(editor);

      if (provider == null) {
        return _RxMin.Observable.empty();
      }

      const contents = editor.getText();
      const cursorPosition = editor.getCursorBufferPosition().copy(); // The bracket-matching package basically overwrites
      //
      //     editor.insertText('{');
      //
      // with
      //
      //     editor.insertText('{}');
      //     cursor.moveLeft();
      //
      // We want to wait until the cursor has actually moved before we issue a
      // format request, so that we format at the right position (and potentially
      // also let any other event handlers have their go).

      return _observable().microtask.switchMap(() => provider.formatAtPosition(editor, editor.getCursorBufferPosition(), character)).do(edits => {
        if (edits.length === 0) {
          return;
        }

        this._checkContentsAreSame(contents, editor.getText()); // Note that this modification is not in a transaction, so it applies as a
        // separate editing event than the character typing. This means that you
        // can undo just the formatting by attempting to undo once, and then undo
        // your actual code by undoing again.


        if (!(0, _textEdit().applyTextEditsToBuffer)(editor.getBuffer(), edits)) {
          throw new Error('Could not apply edits to text buffer.');
        }

        if (provider.keepCursorPosition) {
          editor.setCursorBufferPosition(cursorPosition);
        }
      });
    });
  }

  _safeFormatCodeOnSave(editor) {
    return this._formatCodeOnSaveInTextEditor(editor).timeout(SAVE_TIMEOUT).catch(err => {
      (0, _log4js().getLogger)('code-format').warn('Failed to format code on save:', err);
      return _RxMin.Observable.empty();
    });
  }

  _formatCodeOnSaveInTextEditor(editor) {
    const saveProvider = this._onSaveProviders.getProviderForEditor(editor);

    if (saveProvider != null) {
      return _RxMin.Observable.defer(() => this._reportBusy(editor, saveProvider.formatOnSave(editor), false)).map(edits => {
        (0, _textEdit().applyTextEditsToBuffer)(editor.getBuffer(), edits);
      });
    } else if ((0, _config().getFormatOnSave)(editor)) {
      return this._formatCodeInTextEditor(editor, editor.getBuffer().getRange()).ignoreElements();
    }

    return _RxMin.Observable.empty();
  }

  _reportBusy(editor, promise, revealTooltip = true) {
    const busySignalService = this._busySignalService;

    if (busySignalService != null) {
      const path = editor.getPath();
      const displayPath = path != null ? _nuclideUri().default.basename(path) : '<untitled>';
      return busySignalService.reportBusyWhile(`Formatting code in ${displayPath}`, () => promise, {
        revealTooltip
      });
    }

    return promise;
  }

  addRangeProvider(provider) {
    return this._rangeProviders.addProvider(provider);
  }

  addFileProvider(provider) {
    return this._fileProviders.addProvider(provider);
  }

  addOnTypeProvider(provider) {
    return this._onTypeProviders.addProvider(provider);
  }

  addOnSaveProvider(provider) {
    return this._onSaveProviders.addProvider(provider);
  }

  consumeBusySignal(busySignalService) {
    this._busySignalService = busySignalService;
    return new (_UniversalDisposable().default)(() => {
      this._busySignalService = null;
    });
  }

  dispose() {
    this._subscriptions.dispose();
  }

}

exports.default = CodeFormatManager;

function shouldFormatOnType(event) {
  // There's not a direct way to figure out what caused this edit event. There
  // are three cases that we want to pay attention to:
  //
  // 1) The user typed a character.
  // 2) The user typed a character, and bracket-matching kicked in, causing
  //    there to be two characters typed.
  // 3) The user pasted a string.
  //
  // We only want to trigger autoformatting in the first two cases. However,
  // we can only look at what new string was inserted, and not what actually
  // caused the event, so we just use some heuristics to determine which of
  // these the event probably was depending on what was typed. This means, for
  // example, we may issue spurious format requests when the user pastes a
  // single character, but this is acceptable.
  if (event.oldText !== '') {
    // We either just deleted something or replaced a selection. For the time
    // being, we're not going to issue a reformat in that case.
    return false;
  } else if (event.oldText === '' && event.newText === '') {
    // Not sure what happened here; why did we get an event in this case? Bail
    // for safety.
    return false;
  } else if (event.newText.length > 1 && !isBracketPair(event.newText)) {
    return false;
  }

  return true;
}
/**
 * We can't tell the difference between a paste and the bracket-matcher package
 * inserting an extra bracket, so we just assume that any pair of brackets that
 * bracket-matcher recognizes was a pair matched by the package.
 */


function isBracketPair(typedText) {
  if (atom.packages.getActivePackage('bracket-matcher') == null) {
    return false;
  }

  const validBracketPairs = atom.config.get('bracket-matcher.autocompleteCharacters');
  return validBracketPairs.indexOf(typedText) !== -1;
}