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
      if (selectionStart.isEqual(selectionEnd)) {
        // If no selection is done, then, the whole file is wanted to be formatted.
        formatRange = buffer.getRange();
      } else {
        // Format selections should start at the begining of the line,
        // and include the last selected line end.

        var _require2 = require('atom');

        var _Range = _require2.Range;

        formatRange = new _Range([selectionStart.row, 0], [selectionEnd.row + 1, 0]);
      }

      var provider = matchingProviders[0];
      if (provider.formatCode != null) {
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
//# sourceMappingURL=data:application/json;base64,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QUMsQ0FBQyxDQUFDO09BQzdFLE1BQU07QUFDTCxjQUFNLElBQUksS0FBSyxDQUFDLHFFQUFxRSxDQUFDLENBQUM7T0FDeEY7S0FDRjs7O1dBRWdDLDJDQUFDLFNBQWlCLEVBQTZCO0FBQzlFLFVBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxVQUFBLFFBQVEsRUFBSTtBQUNyRSxZQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3hELGVBQU8sUUFBUSxDQUFDLGlCQUFpQixHQUFHLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7T0FDckYsQ0FBQyxDQUFDOztBQUVILGFBQU8saUJBQWlCLENBQUMsSUFBSSxDQUFDLFVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBSztBQUN0RCxlQUFPLFNBQVMsQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUMsaUJBQWlCLENBQUM7T0FDbEUsQ0FBQyxDQUFDO0tBQ0o7OztXQUVVLHFCQUFDLFFBQTRCLEVBQUU7QUFDeEMsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUMxQzs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDdkIsWUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QixZQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztPQUM1QjtBQUNELFVBQUksQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUM7S0FDaEM7OztTQW5GRyxpQkFBaUI7OztBQXNGdkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJDb2RlRm9ybWF0TWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcblxuaW1wb3J0IHR5cGUge0NvZGVGb3JtYXRQcm92aWRlcn0gZnJvbSAnLi90eXBlcyc7XG5cbmNsYXNzIENvZGVGb3JtYXRNYW5hZ2VyIHtcblxuICBfc3Vic2NyaXB0aW9uczogP0NvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9jb2RlRm9ybWF0UHJvdmlkZXJzOiBBcnJheTxDb2RlRm9ybWF0UHJvdmlkZXI+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICdhdG9tLXRleHQtZWRpdG9yJyxcbiAgICAgICdudWNsaWRlLWNvZGUtZm9ybWF0OmZvcm1hdC1jb2RlJyxcbiAgICAgIC8vIEF0b20gZG9lc24ndCBhY2NlcHQgaW4tY29tbWFuZCBtb2RpZmljYXRpb24gb2YgdGhlIHRleHQgZWRpdG9yIGNvbnRlbnRzLlxuICAgICAgKCkgPT4gcHJvY2Vzcy5uZXh0VGljayh0aGlzLl9mb3JtYXRDb2RlSW5BY3RpdmVUZXh0RWRpdG9yLmJpbmQodGhpcykpXG4gICAgKSk7XG4gICAgdGhpcy5fY29kZUZvcm1hdFByb3ZpZGVycyA9IFtdO1xuICB9XG5cbiAgYXN5bmMgX2Zvcm1hdENvZGVJbkFjdGl2ZVRleHRFZGl0b3IoKTogUHJvbWlzZSB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmICghZWRpdG9yKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ05vIGFjdGl2ZSB0ZXh0IGVkaXRvciB0byBmb3JtYXQgaXRzIGNvZGUhJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge3Njb3BlTmFtZX0gPSBlZGl0b3IuZ2V0R3JhbW1hcigpO1xuICAgIGNvbnN0IG1hdGNoaW5nUHJvdmlkZXJzID0gdGhpcy5fZ2V0TWF0Y2hpbmdQcm92aWRlcnNGb3JTY29wZU5hbWUoc2NvcGVOYW1lKTtcblxuICAgIGlmICghbWF0Y2hpbmdQcm92aWRlcnMubGVuZ3RoKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ05vIENvZGUtRm9ybWF0IHByb3ZpZGVycyByZWdpc3RlcmVkIGZvciBzY29wZTogJyArIHNjb3BlTmFtZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpO1xuICAgIGNvbnN0IHNlbGVjdGlvblJhbmdlID0gZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKTtcbiAgICBjb25zdCB7c3RhcnQ6IHNlbGVjdGlvblN0YXJ0LCBlbmQ6IHNlbGVjdGlvbkVuZH0gPSBzZWxlY3Rpb25SYW5nZTtcbiAgICBsZXQgZm9ybWF0UmFuZ2UgPSBudWxsO1xuICAgIGlmIChzZWxlY3Rpb25TdGFydC5pc0VxdWFsKHNlbGVjdGlvbkVuZCkpIHtcbiAgICAgIC8vIElmIG5vIHNlbGVjdGlvbiBpcyBkb25lLCB0aGVuLCB0aGUgd2hvbGUgZmlsZSBpcyB3YW50ZWQgdG8gYmUgZm9ybWF0dGVkLlxuICAgICAgZm9ybWF0UmFuZ2UgPSBidWZmZXIuZ2V0UmFuZ2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRm9ybWF0IHNlbGVjdGlvbnMgc2hvdWxkIHN0YXJ0IGF0IHRoZSBiZWdpbmluZyBvZiB0aGUgbGluZSxcbiAgICAgIC8vIGFuZCBpbmNsdWRlIHRoZSBsYXN0IHNlbGVjdGVkIGxpbmUgZW5kLlxuICAgICAgY29uc3Qge1JhbmdlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbiAgICAgIGZvcm1hdFJhbmdlID0gbmV3IFJhbmdlKFxuICAgICAgICAgIFtzZWxlY3Rpb25TdGFydC5yb3csIDBdLFxuICAgICAgICAgIFtzZWxlY3Rpb25FbmQucm93ICsgMSwgMF0sXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IHByb3ZpZGVyID0gbWF0Y2hpbmdQcm92aWRlcnNbMF07XG4gICAgaWYgKHByb3ZpZGVyLmZvcm1hdENvZGUgIT0gbnVsbCkge1xuICAgICAgY29uc3QgY29kZVJlcGxhY2VtZW50ID0gYXdhaXQgcHJvdmlkZXIuZm9ybWF0Q29kZShlZGl0b3IsIGZvcm1hdFJhbmdlKTtcbiAgICAgIC8vIFRPRE8obW9zdCk6IHNhdmUgY3Vyc29yIGxvY2F0aW9uLlxuICAgICAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKGZvcm1hdFJhbmdlLCBjb2RlUmVwbGFjZW1lbnQpO1xuICAgIH0gZWxzZSBpZiAocHJvdmlkZXIuZm9ybWF0RW50aXJlRmlsZSAhPSBudWxsKSB7XG4gICAgICBjb25zdCB7bmV3Q3Vyc29yLCBmb3JtYXR0ZWR9ID0gYXdhaXQgcHJvdmlkZXIuZm9ybWF0RW50aXJlRmlsZShlZGl0b3IsIGZvcm1hdFJhbmdlKTtcbiAgICAgIGJ1ZmZlci5zZXRUZXh0VmlhRGlmZihmb3JtYXR0ZWQpO1xuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlci5wb3NpdGlvbkZvckNoYXJhY3RlckluZGV4KG5ld0N1cnNvcikpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvZGUtZm9ybWF0IHByb3ZpZGVycyBtdXN0IGltcGxlbWVudCBmb3JtYXRDb2RlIG9yIGZvcm1hdEVudGlyZUZpbGUnKTtcbiAgICB9XG4gIH1cblxuICBfZ2V0TWF0Y2hpbmdQcm92aWRlcnNGb3JTY29wZU5hbWUoc2NvcGVOYW1lOiBzdHJpbmcpOiBBcnJheTxDb2RlRm9ybWF0UHJvdmlkZXI+IHtcbiAgICBjb25zdCBtYXRjaGluZ1Byb3ZpZGVycyA9IHRoaXMuX2NvZGVGb3JtYXRQcm92aWRlcnMuZmlsdGVyKHByb3ZpZGVyID0+IHtcbiAgICAgIGNvbnN0IHByb3ZpZGVyR3JhbW1hcnMgPSBwcm92aWRlci5zZWxlY3Rvci5zcGxpdCgvLCA/Lyk7XG4gICAgICByZXR1cm4gcHJvdmlkZXIuaW5jbHVzaW9uUHJpb3JpdHkgPiAwICYmIHByb3ZpZGVyR3JhbW1hcnMuaW5kZXhPZihzY29wZU5hbWUpICE9PSAtMTtcbiAgICB9KTtcbiAgICAvLyAkRmxvd0lzc3VlIHNvcnQgZG9lc24ndCB0YWtlIGN1c3RvbSBjb21wYXJhdG9yLlxuICAgIHJldHVybiBtYXRjaGluZ1Byb3ZpZGVycy5zb3J0KChwcm92aWRlckEsIHByb3ZpZGVyQikgPT4ge1xuICAgICAgcmV0dXJuIHByb3ZpZGVyQS5pbmNsdXNpb25Qcmlvcml0eSA8IHByb3ZpZGVyQi5pbmNsdXNpb25Qcmlvcml0eTtcbiAgICB9KTtcbiAgfVxuXG4gIGFkZFByb3ZpZGVyKHByb3ZpZGVyOiBDb2RlRm9ybWF0UHJvdmlkZXIpIHtcbiAgICB0aGlzLl9jb2RlRm9ybWF0UHJvdmlkZXJzLnB1c2gocHJvdmlkZXIpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5fY29kZUZvcm1hdFByb3ZpZGVycyA9IFtdO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29kZUZvcm1hdE1hbmFnZXI7XG4iXX0=