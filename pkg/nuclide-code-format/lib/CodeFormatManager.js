var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _config2;

function _config() {
  return _config2 = require('./config');
}

var CodeFormatManager = (function () {
  function CodeFormatManager() {
    var _this = this;

    _classCallCheck(this, CodeFormatManager);

    var subscriptions = this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-code-format:format-code',
    // Atom doesn't accept in-command modification of the text editor contents.
    function () {
      return process.nextTick(_this._formatCodeInActiveTextEditor.bind(_this));
    }));
    subscriptions.add(atom.workspace.observeTextEditors(this._addEditor.bind(this)));
    this._codeFormatProviders = [];
    this._pendingFormats = new Map();
  }

  _createClass(CodeFormatManager, [{
    key: '_addEditor',
    value: function _addEditor(editor) {
      var _this2 = this;

      if (!this._subscriptions) {
        return;
      }

      this._subscriptions.add(editor.getBuffer().onDidSave(_asyncToGenerator(function* () {
        if ((0, (_config2 || _config()).getFormatOnSave)() && !_this2._pendingFormats.get(editor)) {
          // Because formatting code is async, we need to resave the file once
          // we're done formatting, but prevent resaving from retriggering the
          // onDidSave callback, which would be an infinite cycle.
          _this2._pendingFormats.set(editor, true);
          try {
            var didFormat = yield _this2._formatCodeInTextEditor(editor, false);
            if (didFormat) {
              editor.save();
            }
          } finally {
            _this2._pendingFormats.delete(editor);
          }
        }
      })));

      editor.onDidDestroy(function () {
        _this2._pendingFormats.delete(editor);
      });
    }

    // Checks whether contents are same in the buffer post-format, throwing if
    // anything has changed.
  }, {
    key: '_checkContentsAreSame',
    value: function _checkContentsAreSame(before, after) {
      if (before !== after) {
        throw new Error('The file contents were changed before formatting was complete.');
      }
    }

    // Formats code in the active editor, returning whether or not the code
    // formatted successfully.
  }, {
    key: '_formatCodeInActiveTextEditor',
    value: _asyncToGenerator(function* () {
      var editor = atom.workspace.getActiveTextEditor();
      if (!editor) {
        atom.notifications.addError('No active text editor to format its code!');
        return false;
      }

      return yield this._formatCodeInTextEditor(editor);
    })

    // Formats code in the editor specified, returning whether or not the code
    // formatted successfully.
  }, {
    key: '_formatCodeInTextEditor',
    value: _asyncToGenerator(function* (editor) {
      var displayErrors = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      var _editor$getGrammar = editor.getGrammar();

      var scopeName = _editor$getGrammar.scopeName;

      var matchingProviders = this._getMatchingProvidersForScopeName(scopeName);

      if (!matchingProviders.length) {
        if (displayErrors) {
          atom.notifications.addError('No Code-Format providers registered for scope: ' + scopeName);
        }
        return false;
      }

      var buffer = editor.getBuffer();
      var selectionRange = editor.getSelectedBufferRange();
      var selectionStart = selectionRange.start;
      var selectionEnd = selectionRange.end;

      var formatRange = null;
      var selectionRangeEmpty = selectionRange.isEmpty();
      if (selectionRangeEmpty) {
        // If no selection is done, then, the whole file is wanted to be formatted.
        formatRange = buffer.getRange();
      } else {
        // Format selections should start at the begining of the line,
        // and include the last selected line end.
        formatRange = new (_atom2 || _atom()).Range([selectionStart.row, 0], [selectionEnd.row + 1, 0]);
      }
      var contents = editor.getText();

      try {
        var provider = matchingProviders[0];
        if (provider.formatCode != null && (!selectionRangeEmpty || provider.formatEntireFile == null)) {
          var formatted = yield provider.formatCode(editor, formatRange);
          // Throws if contents have changed since the time of triggering format code.
          this._checkContentsAreSame(contents, editor.getText());
          // TODO(most): save cursor location.
          editor.setTextInBufferRange(formatRange, formatted);
          return true;
        } else if (provider.formatEntireFile != null) {
          var _ref = yield provider.formatEntireFile(editor, formatRange);

          var newCursor = _ref.newCursor;
          var formatted = _ref.formatted;

          // Throws if contents have changed since the time of triggering format code.
          this._checkContentsAreSame(contents, editor.getText());

          buffer.setTextViaDiff(formatted);

          var newPosition = newCursor != null ? buffer.positionForCharacterIndex(newCursor) : editor.getCursorBufferPosition();

          // We call setCursorBufferPosition even when there is no newCursor,
          // because it unselects the text selection.
          editor.setCursorBufferPosition(newPosition);
          return true;
        } else {
          throw new Error('code-format providers must implement formatCode or formatEntireFile');
        }
      } catch (e) {
        if (displayErrors) {
          atom.notifications.addError('Failed to format code: ' + e.message);
        }
        return false;
      }
    })
  }, {
    key: '_getMatchingProvidersForScopeName',
    value: function _getMatchingProvidersForScopeName(scopeName) {
      var matchingProviders = this._codeFormatProviders.filter(function (provider) {
        var providerGrammars = provider.selector.split(/, ?/);
        return provider.inclusionPriority > 0 && providerGrammars.indexOf(scopeName) !== -1;
      });
      // $FlowIssue sort doesn't take custom comparator.
      return matchingProviders.sort(function (providerA, providerB) {
        return providerA.inclusionPriority < providerB.inclusionPriority;
      });
    }
  }, {
    key: 'addProvider',
    value: function addProvider(provider) {
      this._codeFormatProviders.push(provider);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._subscriptions) {
        this._subscriptions.dispose();
        this._subscriptions = null;
      }
      this._codeFormatProviders = [];
      this._pendingFormats.clear();
    }
  }]);

  return CodeFormatManager;
})();

module.exports = CodeFormatManager;