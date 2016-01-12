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

      var codeReplacement = yield matchingProviders[0].formatCode(editor, formatRange);
      // TODO(most): save cursor location.
      editor.setTextInBufferRange(formatRange, codeReplacement);
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
//# sourceMappingURL=data:application/json;base64,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VUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFLO0FBQ3RELGVBQU8sU0FBUyxDQUFDLGlCQUFpQixHQUFHLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQztPQUNsRSxDQUFDLENBQUM7S0FDSjs7O1dBRVUscUJBQUMsUUFBNEIsRUFBRTtBQUN4QyxVQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzFDOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUN2QixZQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFlBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO09BQzVCO0FBQ0QsVUFBSSxDQUFDLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztLQUNoQzs7O1NBMUVHLGlCQUFpQjs7O0FBNkV2QixNQUFNLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDIiwiZmlsZSI6IkNvZGVGb3JtYXRNYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuXG5pbXBvcnQgdHlwZSB7Q29kZUZvcm1hdFByb3ZpZGVyfSBmcm9tICcuL3R5cGVzJztcblxuY2xhc3MgQ29kZUZvcm1hdE1hbmFnZXIge1xuXG4gIF9zdWJzY3JpcHRpb25zOiA/Q29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2NvZGVGb3JtYXRQcm92aWRlcnM6IEFycmF5PENvZGVGb3JtYXRQcm92aWRlcj47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ251Y2xpZGUtY29kZS1mb3JtYXQ6Zm9ybWF0LWNvZGUnLFxuICAgICAgLy8gQXRvbSBkb2Vzbid0IGFjY2VwdCBpbi1jb21tYW5kIG1vZGlmaWNhdGlvbiBvZiB0aGUgdGV4dCBlZGl0b3IgY29udGVudHMuXG4gICAgICAoKSA9PiBwcm9jZXNzLm5leHRUaWNrKHRoaXMuX2Zvcm1hdENvZGVJbkFjdGl2ZVRleHRFZGl0b3IuYmluZCh0aGlzKSlcbiAgICApKTtcbiAgICB0aGlzLl9jb2RlRm9ybWF0UHJvdmlkZXJzID0gW107XG4gIH1cblxuICBhc3luYyBfZm9ybWF0Q29kZUluQWN0aXZlVGV4dEVkaXRvcigpOiBQcm9taXNlIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKCFlZGl0b3IpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignTm8gYWN0aXZlIHRleHQgZWRpdG9yIHRvIGZvcm1hdCBpdHMgY29kZSEnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7c2NvcGVOYW1lfSA9IGVkaXRvci5nZXRHcmFtbWFyKCk7XG4gICAgY29uc3QgbWF0Y2hpbmdQcm92aWRlcnMgPSB0aGlzLl9nZXRNYXRjaGluZ1Byb3ZpZGVyc0ZvclNjb3BlTmFtZShzY29wZU5hbWUpO1xuXG4gICAgaWYgKCFtYXRjaGluZ1Byb3ZpZGVycy5sZW5ndGgpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignTm8gQ29kZS1Gb3JtYXQgcHJvdmlkZXJzIHJlZ2lzdGVyZWQgZm9yIHNjb3BlOiAnICsgc2NvcGVOYW1lKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKCk7XG4gICAgY29uc3Qgc2VsZWN0aW9uUmFuZ2UgPSBlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpO1xuICAgIGNvbnN0IHtzdGFydDogc2VsZWN0aW9uU3RhcnQsIGVuZDogc2VsZWN0aW9uRW5kfSA9IHNlbGVjdGlvblJhbmdlO1xuICAgIGxldCBmb3JtYXRSYW5nZSA9IG51bGw7XG4gICAgaWYgKHNlbGVjdGlvblN0YXJ0LmlzRXF1YWwoc2VsZWN0aW9uRW5kKSkge1xuICAgICAgLy8gSWYgbm8gc2VsZWN0aW9uIGlzIGRvbmUsIHRoZW4sIHRoZSB3aG9sZSBmaWxlIGlzIHdhbnRlZCB0byBiZSBmb3JtYXR0ZWQuXG4gICAgICBmb3JtYXRSYW5nZSA9IGJ1ZmZlci5nZXRSYW5nZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBGb3JtYXQgc2VsZWN0aW9ucyBzaG91bGQgc3RhcnQgYXQgdGhlIGJlZ2luaW5nIG9mIHRoZSBsaW5lLFxuICAgICAgLy8gYW5kIGluY2x1ZGUgdGhlIGxhc3Qgc2VsZWN0ZWQgbGluZSBlbmQuXG4gICAgICBjb25zdCB7UmFuZ2V9ID0gcmVxdWlyZSgnYXRvbScpO1xuICAgICAgZm9ybWF0UmFuZ2UgPSBuZXcgUmFuZ2UoXG4gICAgICAgICAgW3NlbGVjdGlvblN0YXJ0LnJvdywgMF0sXG4gICAgICAgICAgW3NlbGVjdGlvbkVuZC5yb3cgKyAxLCAwXSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgY29kZVJlcGxhY2VtZW50ID0gYXdhaXQgbWF0Y2hpbmdQcm92aWRlcnNbMF0uZm9ybWF0Q29kZShlZGl0b3IsIGZvcm1hdFJhbmdlKTtcbiAgICAvLyBUT0RPKG1vc3QpOiBzYXZlIGN1cnNvciBsb2NhdGlvbi5cbiAgICBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoZm9ybWF0UmFuZ2UsIGNvZGVSZXBsYWNlbWVudCk7XG4gIH1cblxuICBfZ2V0TWF0Y2hpbmdQcm92aWRlcnNGb3JTY29wZU5hbWUoc2NvcGVOYW1lOiBzdHJpbmcpOiBBcnJheTxDb2RlRm9ybWF0UHJvdmlkZXI+IHtcbiAgICBjb25zdCBtYXRjaGluZ1Byb3ZpZGVycyA9IHRoaXMuX2NvZGVGb3JtYXRQcm92aWRlcnMuZmlsdGVyKHByb3ZpZGVyID0+IHtcbiAgICAgIGNvbnN0IHByb3ZpZGVyR3JhbW1hcnMgPSBwcm92aWRlci5zZWxlY3Rvci5zcGxpdCgvLCA/Lyk7XG4gICAgICByZXR1cm4gcHJvdmlkZXIuaW5jbHVzaW9uUHJpb3JpdHkgPiAwICYmIHByb3ZpZGVyR3JhbW1hcnMuaW5kZXhPZihzY29wZU5hbWUpICE9PSAtMTtcbiAgICB9KTtcbiAgICAvLyAkRmxvd0lzc3VlIHNvcnQgZG9lc24ndCB0YWtlIGN1c3RvbSBjb21wYXJhdG9yLlxuICAgIHJldHVybiBtYXRjaGluZ1Byb3ZpZGVycy5zb3J0KChwcm92aWRlckEsIHByb3ZpZGVyQikgPT4ge1xuICAgICAgcmV0dXJuIHByb3ZpZGVyQS5pbmNsdXNpb25Qcmlvcml0eSA8IHByb3ZpZGVyQi5pbmNsdXNpb25Qcmlvcml0eTtcbiAgICB9KTtcbiAgfVxuXG4gIGFkZFByb3ZpZGVyKHByb3ZpZGVyOiBDb2RlRm9ybWF0UHJvdmlkZXIpIHtcbiAgICB0aGlzLl9jb2RlRm9ybWF0UHJvdmlkZXJzLnB1c2gocHJvdmlkZXIpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5fY29kZUZvcm1hdFByb3ZpZGVycyA9IFtdO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29kZUZvcm1hdE1hbmFnZXI7XG4iXX0=