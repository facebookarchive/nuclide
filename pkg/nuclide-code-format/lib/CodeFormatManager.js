var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var CodeFormatManager = (function () {
  function CodeFormatManager() {
    var _this = this;

    _classCallCheck(this, CodeFormatManager);

    var subscriptions = this._subscriptions = new CompositeDisposable();
    subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-code-format:format-code',
    // Atom doesn't accept in-command modification of the text editor contents.
    function () {
      return process.nextTick(_this._formatCodeInActiveTextEditor.bind(_this));
    }));
    this._codeFormatProviders = [];
  }

  _createClass(CodeFormatManager, [{
    key: '_formatCodeInActiveTextEditor',
    value: _asyncToGenerator(function* () {
      var editor = atom.workspace.getActiveTextEditor();
      if (!editor) {
        atom.notifications.addError('No active text editor to format its code!');
        return;
      }

      var _editor$getGrammar = editor.getGrammar();

      var scopeName = _editor$getGrammar.scopeName;

      var matchingProviders = this._getMatchingProvidersForScopeName(scopeName);

      if (!matchingProviders.length) {
        atom.notifications.addError('No Code-Format providers registered for scope: ' + scopeName);
        return;
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
        formatRange = new _atom.Range([selectionStart.row, 0], [selectionEnd.row + 1, 0]);
      }

      var provider = matchingProviders[0];
      if (provider.formatCode != null && (!selectionRangeEmpty || provider.formatEntireFile == null)) {
        var codeReplacement = yield provider.formatCode(editor, formatRange);
        // TODO(most): save cursor location.
        editor.setTextInBufferRange(formatRange, codeReplacement);
      } else if (provider.formatEntireFile != null) {
        var _ref = yield provider.formatEntireFile(editor, formatRange);

        var newCursor = _ref.newCursor;
        var formatted = _ref.formatted;

        buffer.setTextViaDiff(formatted);
        editor.setCursorBufferPosition(buffer.positionForCharacterIndex(newCursor));
      } else {
        throw new Error('code-format providers must implement formatCode or formatEntireFile');
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
    }
  }]);

  return CodeFormatManager;
})();

module.exports = CodeFormatManager;