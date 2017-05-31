'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('nuclide-commons-atom/text-editor');
}

var _textEdit;

function _load_textEdit() {
  return _textEdit = require('nuclide-commons-atom/text-edit');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const logger = (0, (_log4js || _load_log4js()).getLogger)('CodeFormatManager');

class CodeFormatManager {

  constructor() {
    const subscriptions = this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-code-format:format-code',
    // Atom doesn't accept in-command modification of the text editor contents.
    () => process.nextTick(this._formatCodeInActiveTextEditor.bind(this))));
    subscriptions.add((0, (_textEditor || _load_textEditor()).observeTextEditors)(this._addEditor.bind(this)));
    this._codeFormatProviders = [];
    this._pendingFormats = new Map();
  }

  _addEditor(editor) {
    var _this = this;

    const subscriptions = this._subscriptions;
    if (!subscriptions) {
      return;
    }

    subscriptions.add((0, (_event || _load_event()).observableFromSubscribeFunction)(callback => editor.getBuffer().onDidChange(callback)).debounceTime(0) // In case of multiple cursors.
    .subscribe((() => {
      var _ref = (0, _asyncToGenerator.default)(function* (event) {
        if (_this._pendingFormats.get(editor)) {
          return;
        }

        _this._pendingFormats.set(editor, true);
        try {
          yield _this._formatCodeOnTypeInTextEditor(editor, event);
        } catch (e) {
          logger.info('onTypeFormat exception:', e);
        } finally {
          _this._pendingFormats.delete(editor);
        }
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })()));

    subscriptions.add(editor.getBuffer().onDidSave((0, _asyncToGenerator.default)(function* () {
      if ((0, (_config || _load_config()).getFormatOnSave)() && !_this._pendingFormats.get(editor)) {
        // Because formatting code is async, we need to resave the file once
        // we're done formatting, but prevent resaving from retriggering the
        // onDidSave callback, which would be an infinite cycle.
        _this._pendingFormats.set(editor, true);
        try {
          const didFormat = yield _this._formatCodeInTextEditor(editor, false);
          if (didFormat) {
            // TextEditor.save is synchronous for local files, but our custom
            // NuclideTextBuffer.saveAs implementation is asynchronous.
            yield editor.save();
          }
        } finally {
          _this._pendingFormats.delete(editor);
        }
      }
    })));

    editor.onDidDestroy(() => {
      this._pendingFormats.delete(editor);
    });
  }

  // Checks whether contents are same in the buffer post-format, throwing if
  // anything has changed.
  _checkContentsAreSame(before, after) {
    if (before !== after) {
      throw new Error('The file contents were changed before formatting was complete.');
    }
  }

  // Formats code in the active editor, returning whether or not the code
  // formatted successfully.
  _formatCodeInActiveTextEditor() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const editor = atom.workspace.getActiveTextEditor();
      if (!editor) {
        atom.notifications.addError('No active text editor to format its code!');
        return false;
      }

      return _this2._formatCodeInTextEditor(editor);
    })();
  }

  // Formats code in the editor specified, returning whether or not the code
  // formatted successfully.
  _formatCodeInTextEditor(editor, displayErrors = true) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { scopeName } = editor.getGrammar();
      const matchingProviders = _this3._getMatchingProvidersForScopeName(scopeName).filter(function (provider) {
        return provider.formatCode != null || provider.formatEntireFile != null;
      });

      if (!matchingProviders.length) {
        if (displayErrors) {
          atom.notifications.addError('No Code-Format providers registered for scope: ' + scopeName);
        }
        return false;
      }

      const buffer = editor.getBuffer();
      const selectionRange = editor.getSelectedBufferRange();
      const { start: selectionStart, end: selectionEnd } = selectionRange;
      let formatRange = null;
      const selectionRangeEmpty = selectionRange.isEmpty();
      if (selectionRangeEmpty) {
        // If no selection is done, then, the whole file is wanted to be formatted.
        formatRange = buffer.getRange();
      } else {
        // Format selections should start at the begining of the line,
        // and include the last selected line end.
        // (If the user has already selected complete rows, then depending on how they
        // did it, their caret might be either (1) at the end of their last selected line
        // or (2) at the first column of the line AFTER their selection. In both cases
        // we snap the formatRange to end at the first column of the line after their
        // selection.)
        formatRange = new _atom.Range([selectionStart.row, 0], selectionEnd.column === 0 ? selectionEnd : [selectionEnd.row + 1, 0]);
      }
      const contents = editor.getText();

      try {
        const provider = matchingProviders[0];
        if (provider.formatCode != null && (!selectionRangeEmpty || provider.formatEntireFile == null)) {
          const edits = yield provider.formatCode(editor, formatRange);
          // Throws if contents have changed since the time of triggering format code.
          _this3._checkContentsAreSame(contents, editor.getText());
          if (!(0, (_textEdit || _load_textEdit()).applyTextEditsToBuffer)(editor.getBuffer(), edits)) {
            throw new Error('Could not apply edits to text buffer.');
          }
        } else if (provider.formatEntireFile != null) {
          const { newCursor, formatted } = yield provider.formatEntireFile(editor, formatRange);
          // Throws if contents have changed since the time of triggering format code.
          _this3._checkContentsAreSame(contents, editor.getText());

          buffer.setTextViaDiff(formatted);

          const newPosition = newCursor != null ? buffer.positionForCharacterIndex(newCursor) : editor.getCursorBufferPosition();

          // We call setCursorBufferPosition even when there is no newCursor,
          // because it unselects the text selection.
          editor.setCursorBufferPosition(newPosition);
        } else {
          throw new Error('code-format providers must implement formatCode or formatEntireFile');
        }
        return true;
      } catch (e) {
        if (displayErrors) {
          atom.notifications.addError('Failed to format code: ' + e.message);
        }
        return false;
      }
    })();
  }

  _formatCodeOnTypeInTextEditor(editor, event) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
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
        return;
      } else if (event.oldText === '' && event.newText === '') {
        // Not sure what happened here; why did we get an event in this case? Bail
        // for safety.
        return;
      } else if (event.newText.length > 1 && !isBracketPair(event.newText)) {
        return;
      }

      // In the case of bracket-matching, we use the last character because that's
      // the character that will usually cause a reformat (i.e. `}` instead of `{`).
      const character = event.newText[event.newText.length - 1];

      const { scopeName } = editor.getGrammar();
      const matchingProviders = _this4._getMatchingProvidersForScopeName(scopeName).filter(function (provider) {
        return provider.formatAtPosition != null;
      });
      if (!matchingProviders.length) {
        return;
      }
      const provider = matchingProviders[0];

      if (!(provider.formatAtPosition != null)) {
        throw new Error('Invariant violation: "provider.formatAtPosition != null"');
      }

      const formatAtPosition = provider.formatAtPosition.bind(provider);

      const contents = editor.getText();

      // The bracket-matching package basically overwrites
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
      yield (0, (_promise || _load_promise()).nextTick)();

      const edits = yield formatAtPosition(editor, editor.getCursorBufferPosition().translate([0, -1]), character);
      if (edits.length === 0) {
        return;
      }
      _this4._checkContentsAreSame(contents, editor.getText());
      // Note that this modification is not in a transaction, so it applies as a
      // separate editing event than the character typing. This means that you
      // can undo just the formatting by attempting to undo once, and then undo
      // your actual code by undoing again.
      if (!(0, (_textEdit || _load_textEdit()).applyTextEditsToBuffer)(editor.getBuffer(), edits)) {
        throw new Error('Could not apply edits to text buffer.');
      }
    })();
  }

  _getMatchingProvidersForScopeName(scopeName) {
    const matchingProviders = this._codeFormatProviders.filter(provider => {
      const providerGrammars = provider.selector.split(/, ?/);
      return provider.inclusionPriority > 0 && providerGrammars.indexOf(scopeName) !== -1;
    });
    return matchingProviders.sort((providerA, providerB) => {
      // $FlowFixMe a comparator function should return a number
      return providerA.inclusionPriority < providerB.inclusionPriority;
    });
  }

  addProvider(provider) {
    this._codeFormatProviders.push(provider);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      const index = this._codeFormatProviders.indexOf(provider);
      if (index !== -1) {
        this._codeFormatProviders.splice(index);
      }
    });
  }

  dispose() {
    if (this._subscriptions) {
      this._subscriptions.dispose();
      this._subscriptions = null;
    }
    this._codeFormatProviders = [];
    this._pendingFormats.clear();
  }
}

exports.default = CodeFormatManager; /**
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