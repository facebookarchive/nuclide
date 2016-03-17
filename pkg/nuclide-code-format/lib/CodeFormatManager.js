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
      if (selectionStart.isEqual(selectionEnd)) {
        // If no selection is done, then, the whole file is wanted to be formatted.
        formatRange = buffer.getRange();
      } else {
        // Format selections should start at the begining of the line,
        // and include the last selected line end.
        formatRange = new _atom.Range([selectionStart.row, 0], [selectionEnd.row + 1, 0]);
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
//# sourceMappingURL=data:application/json;base64,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LHFFQUFxRSxDQUFDLENBQUM7T0FDeEY7S0FDRjs7O1dBRWdDLDJDQUFDLFNBQWlCLEVBQTZCO0FBQzlFLFVBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxVQUFBLFFBQVEsRUFBSTtBQUNyRSxZQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3hELGVBQU8sUUFBUSxDQUFDLGlCQUFpQixHQUFHLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7T0FDckYsQ0FBQyxDQUFDOztBQUVILGFBQU8saUJBQWlCLENBQUMsSUFBSSxDQUFDLFVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBSztBQUN0RCxlQUFPLFNBQVMsQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUMsaUJBQWlCLENBQUM7T0FDbEUsQ0FBQyxDQUFDO0tBQ0o7OztXQUVVLHFCQUFDLFFBQTRCLEVBQUU7QUFDeEMsVUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUMxQzs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDdkIsWUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QixZQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztPQUM1QjtBQUNELFVBQUksQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUM7S0FDaEM7OztTQWxGRyxpQkFBaUI7OztBQXFGdkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJDb2RlRm9ybWF0TWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7UmFuZ2V9IGZyb20gJ2F0b20nO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuXG5pbXBvcnQgdHlwZSB7Q29kZUZvcm1hdFByb3ZpZGVyfSBmcm9tICcuL3R5cGVzJztcblxuY2xhc3MgQ29kZUZvcm1hdE1hbmFnZXIge1xuXG4gIF9zdWJzY3JpcHRpb25zOiA/Q29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2NvZGVGb3JtYXRQcm92aWRlcnM6IEFycmF5PENvZGVGb3JtYXRQcm92aWRlcj47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ251Y2xpZGUtY29kZS1mb3JtYXQ6Zm9ybWF0LWNvZGUnLFxuICAgICAgLy8gQXRvbSBkb2Vzbid0IGFjY2VwdCBpbi1jb21tYW5kIG1vZGlmaWNhdGlvbiBvZiB0aGUgdGV4dCBlZGl0b3IgY29udGVudHMuXG4gICAgICAoKSA9PiBwcm9jZXNzLm5leHRUaWNrKHRoaXMuX2Zvcm1hdENvZGVJbkFjdGl2ZVRleHRFZGl0b3IuYmluZCh0aGlzKSlcbiAgICApKTtcbiAgICB0aGlzLl9jb2RlRm9ybWF0UHJvdmlkZXJzID0gW107XG4gIH1cblxuICBhc3luYyBfZm9ybWF0Q29kZUluQWN0aXZlVGV4dEVkaXRvcigpOiBQcm9taXNlIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKCFlZGl0b3IpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignTm8gYWN0aXZlIHRleHQgZWRpdG9yIHRvIGZvcm1hdCBpdHMgY29kZSEnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7c2NvcGVOYW1lfSA9IGVkaXRvci5nZXRHcmFtbWFyKCk7XG4gICAgY29uc3QgbWF0Y2hpbmdQcm92aWRlcnMgPSB0aGlzLl9nZXRNYXRjaGluZ1Byb3ZpZGVyc0ZvclNjb3BlTmFtZShzY29wZU5hbWUpO1xuXG4gICAgaWYgKCFtYXRjaGluZ1Byb3ZpZGVycy5sZW5ndGgpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignTm8gQ29kZS1Gb3JtYXQgcHJvdmlkZXJzIHJlZ2lzdGVyZWQgZm9yIHNjb3BlOiAnICsgc2NvcGVOYW1lKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKCk7XG4gICAgY29uc3Qgc2VsZWN0aW9uUmFuZ2UgPSBlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpO1xuICAgIGNvbnN0IHtzdGFydDogc2VsZWN0aW9uU3RhcnQsIGVuZDogc2VsZWN0aW9uRW5kfSA9IHNlbGVjdGlvblJhbmdlO1xuICAgIGxldCBmb3JtYXRSYW5nZSA9IG51bGw7XG4gICAgaWYgKHNlbGVjdGlvblN0YXJ0LmlzRXF1YWwoc2VsZWN0aW9uRW5kKSkge1xuICAgICAgLy8gSWYgbm8gc2VsZWN0aW9uIGlzIGRvbmUsIHRoZW4sIHRoZSB3aG9sZSBmaWxlIGlzIHdhbnRlZCB0byBiZSBmb3JtYXR0ZWQuXG4gICAgICBmb3JtYXRSYW5nZSA9IGJ1ZmZlci5nZXRSYW5nZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBGb3JtYXQgc2VsZWN0aW9ucyBzaG91bGQgc3RhcnQgYXQgdGhlIGJlZ2luaW5nIG9mIHRoZSBsaW5lLFxuICAgICAgLy8gYW5kIGluY2x1ZGUgdGhlIGxhc3Qgc2VsZWN0ZWQgbGluZSBlbmQuXG4gICAgICBmb3JtYXRSYW5nZSA9IG5ldyBSYW5nZShcbiAgICAgICAgICBbc2VsZWN0aW9uU3RhcnQucm93LCAwXSxcbiAgICAgICAgICBbc2VsZWN0aW9uRW5kLnJvdyArIDEsIDBdLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBwcm92aWRlciA9IG1hdGNoaW5nUHJvdmlkZXJzWzBdO1xuICAgIGlmIChwcm92aWRlci5mb3JtYXRDb2RlICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IGNvZGVSZXBsYWNlbWVudCA9IGF3YWl0IHByb3ZpZGVyLmZvcm1hdENvZGUoZWRpdG9yLCBmb3JtYXRSYW5nZSk7XG4gICAgICAvLyBUT0RPKG1vc3QpOiBzYXZlIGN1cnNvciBsb2NhdGlvbi5cbiAgICAgIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShmb3JtYXRSYW5nZSwgY29kZVJlcGxhY2VtZW50KTtcbiAgICB9IGVsc2UgaWYgKHByb3ZpZGVyLmZvcm1hdEVudGlyZUZpbGUgIT0gbnVsbCkge1xuICAgICAgY29uc3Qge25ld0N1cnNvciwgZm9ybWF0dGVkfSA9IGF3YWl0IHByb3ZpZGVyLmZvcm1hdEVudGlyZUZpbGUoZWRpdG9yLCBmb3JtYXRSYW5nZSk7XG4gICAgICBidWZmZXIuc2V0VGV4dFZpYURpZmYoZm9ybWF0dGVkKTtcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihidWZmZXIucG9zaXRpb25Gb3JDaGFyYWN0ZXJJbmRleChuZXdDdXJzb3IpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb2RlLWZvcm1hdCBwcm92aWRlcnMgbXVzdCBpbXBsZW1lbnQgZm9ybWF0Q29kZSBvciBmb3JtYXRFbnRpcmVGaWxlJyk7XG4gICAgfVxuICB9XG5cbiAgX2dldE1hdGNoaW5nUHJvdmlkZXJzRm9yU2NvcGVOYW1lKHNjb3BlTmFtZTogc3RyaW5nKTogQXJyYXk8Q29kZUZvcm1hdFByb3ZpZGVyPiB7XG4gICAgY29uc3QgbWF0Y2hpbmdQcm92aWRlcnMgPSB0aGlzLl9jb2RlRm9ybWF0UHJvdmlkZXJzLmZpbHRlcihwcm92aWRlciA9PiB7XG4gICAgICBjb25zdCBwcm92aWRlckdyYW1tYXJzID0gcHJvdmlkZXIuc2VsZWN0b3Iuc3BsaXQoLywgPy8pO1xuICAgICAgcmV0dXJuIHByb3ZpZGVyLmluY2x1c2lvblByaW9yaXR5ID4gMCAmJiBwcm92aWRlckdyYW1tYXJzLmluZGV4T2Yoc2NvcGVOYW1lKSAhPT0gLTE7XG4gICAgfSk7XG4gICAgLy8gJEZsb3dJc3N1ZSBzb3J0IGRvZXNuJ3QgdGFrZSBjdXN0b20gY29tcGFyYXRvci5cbiAgICByZXR1cm4gbWF0Y2hpbmdQcm92aWRlcnMuc29ydCgocHJvdmlkZXJBLCBwcm92aWRlckIpID0+IHtcbiAgICAgIHJldHVybiBwcm92aWRlckEuaW5jbHVzaW9uUHJpb3JpdHkgPCBwcm92aWRlckIuaW5jbHVzaW9uUHJpb3JpdHk7XG4gICAgfSk7XG4gIH1cblxuICBhZGRQcm92aWRlcihwcm92aWRlcjogQ29kZUZvcm1hdFByb3ZpZGVyKSB7XG4gICAgdGhpcy5fY29kZUZvcm1hdFByb3ZpZGVycy5wdXNoKHByb3ZpZGVyKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuX2NvZGVGb3JtYXRQcm92aWRlcnMgPSBbXTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvZGVGb3JtYXRNYW5hZ2VyO1xuIl19