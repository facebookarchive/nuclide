Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideAnalytics = require('../../nuclide-analytics');

/**
 * Sets up listeners so the user can jump to related files.
 *
 * Clients must call `dispose()` once they're done with an instance.
 */

var JumpToRelatedFile = (function () {
  function JumpToRelatedFile(relatedFileFinder) {
    _classCallCheck(this, JumpToRelatedFile);

    this._relatedFileFinder = relatedFileFinder;
    this._commandSubscriptionsMap = new Map();
  }

  _createClass(JumpToRelatedFile, [{
    key: 'dispose',
    value: function dispose() {
      this._commandSubscriptionsMap.forEach(function (subscription) {
        return subscription.dispose();
      });
      this._commandSubscriptionsMap.clear();
    }
  }, {
    key: 'enableInTextEditor',
    value: function enableInTextEditor(textEditor) {
      var _this = this;

      if (this._commandSubscriptionsMap.has(textEditor)) {
        return; // Already enabled.
      }

      var textEditorEl = atom.views.getView(textEditor);
      var commandSubscription = atom.commands.add(textEditorEl, {
        'nuclide-related-files:jump-to-next-related-file': function nuclideRelatedFilesJumpToNextRelatedFile() {
          var path = textEditor.getPath();
          if (path) {
            (0, _nuclideAnalytics.trackOperationTiming)('nuclide-related-files:jump-to-next-related-file', _asyncToGenerator(function* () {
              return _this._open((yield _this.getNextRelatedFile(path)));
            }));
          }
        },
        'nuclide-related-files:jump-to-previous-related-file': function nuclideRelatedFilesJumpToPreviousRelatedFile() {
          var path = textEditor.getPath();
          if (path) {
            (0, _nuclideAnalytics.trackOperationTiming)('nuclide-related-files:jump-to-previous-related-file', _asyncToGenerator(function* () {
              return _this._open((yield _this.getPreviousRelatedFile(path)));
            }));
          }
        }
      });
      this._commandSubscriptionsMap.set(textEditor, commandSubscription);

      textEditor.onDidDestroy(this._disableInTextEditor.bind(this, textEditor));
    }
  }, {
    key: '_disableInTextEditor',
    value: function _disableInTextEditor(textEditor) {
      var subscription = this._commandSubscriptionsMap.get(textEditor);
      if (subscription) {
        subscription.dispose();
        this._commandSubscriptionsMap['delete'](textEditor);
      }
    }

    /**
     * Gets the next related file, which Xcode defines as the one that comes
     * before the current one alphabetically.
     */
  }, {
    key: 'getNextRelatedFile',
    value: _asyncToGenerator(function* (path) {
      var _ref = yield this._relatedFileFinder.find(path);

      var relatedFiles = _ref.relatedFiles;
      var index = _ref.index;

      return relatedFiles[(relatedFiles.length + index - 1) % relatedFiles.length];
    })

    /**
     * Gets the previous related file, which Xcode defines as the one that comes
     * after the current one alphabetically.
     */
  }, {
    key: 'getPreviousRelatedFile',
    value: _asyncToGenerator(function* (path) {
      var _ref2 = yield this._relatedFileFinder.find(path);

      var relatedFiles = _ref2.relatedFiles;
      var index = _ref2.index;

      return relatedFiles[(index + 1) % relatedFiles.length];
    })

    /**
     * Opens the path in the next pane, or the current one if there's only one.
     *
     * We navigate to a file if it's already open, instead of opening it in a new tab.
     */
  }, {
    key: '_open',
    value: function _open(path) {
      atom.workspace.activateNextPane();
      atom.workspace.open(path, { searchAllPanes: true });
    }
  }]);

  return JumpToRelatedFile;
})();

exports['default'] = JumpToRelatedFile;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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S0FBSzs7QUFDMUIsYUFBTyxZQUFZLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFBLEdBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3hEOzs7Ozs7Ozs7V0FPSSxlQUFDLElBQVksRUFBRTtBQUNsQixVQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDbEMsVUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUMsY0FBYyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7S0FDbkQ7OztTQWpGa0IsaUJBQWlCOzs7cUJBQWpCLGlCQUFpQiIsImZpbGUiOiJKdW1wVG9SZWxhdGVkRmlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIFJlbGF0ZWRGaWxlRmluZGVyIGZyb20gJy4vUmVsYXRlZEZpbGVGaW5kZXInO1xuXG5pbXBvcnQge3RyYWNrT3BlcmF0aW9uVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5cbi8qKlxuICogU2V0cyB1cCBsaXN0ZW5lcnMgc28gdGhlIHVzZXIgY2FuIGp1bXAgdG8gcmVsYXRlZCBmaWxlcy5cbiAqXG4gKiBDbGllbnRzIG11c3QgY2FsbCBgZGlzcG9zZSgpYCBvbmNlIHRoZXkncmUgZG9uZSB3aXRoIGFuIGluc3RhbmNlLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBKdW1wVG9SZWxhdGVkRmlsZSB7XG4gIF9jb21tYW5kU3Vic2NyaXB0aW9uc01hcDogTWFwO1xuICBfcmVsYXRlZEZpbGVGaW5kZXI6IFJlbGF0ZWRGaWxlRmluZGVyO1xuXG4gIGNvbnN0cnVjdG9yKHJlbGF0ZWRGaWxlRmluZGVyOiBSZWxhdGVkRmlsZUZpbmRlcikge1xuICAgIHRoaXMuX3JlbGF0ZWRGaWxlRmluZGVyID0gcmVsYXRlZEZpbGVGaW5kZXI7XG4gICAgdGhpcy5fY29tbWFuZFN1YnNjcmlwdGlvbnNNYXAgPSBuZXcgTWFwKCk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbW1hbmRTdWJzY3JpcHRpb25zTWFwLmZvckVhY2goc3Vic2NyaXB0aW9uID0+IHN1YnNjcmlwdGlvbi5kaXNwb3NlKCkpO1xuICAgIHRoaXMuX2NvbW1hbmRTdWJzY3JpcHRpb25zTWFwLmNsZWFyKCk7XG4gIH1cblxuICBlbmFibGVJblRleHRFZGl0b3IodGV4dEVkaXRvcjogVGV4dEVkaXRvcikge1xuICAgIGlmICh0aGlzLl9jb21tYW5kU3Vic2NyaXB0aW9uc01hcC5oYXModGV4dEVkaXRvcikpIHtcbiAgICAgIHJldHVybjsgLy8gQWxyZWFkeSBlbmFibGVkLlxuICAgIH1cblxuICAgIGNvbnN0IHRleHRFZGl0b3JFbCA9IGF0b20udmlld3MuZ2V0Vmlldyh0ZXh0RWRpdG9yKTtcbiAgICBjb25zdCBjb21tYW5kU3Vic2NyaXB0aW9uID0gYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICB0ZXh0RWRpdG9yRWwsXG4gICAgICB7XG4gICAgICAgICdudWNsaWRlLXJlbGF0ZWQtZmlsZXM6anVtcC10by1uZXh0LXJlbGF0ZWQtZmlsZSc6ICgpID0+IHtcbiAgICAgICAgICBjb25zdCBwYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgICAgICAgaWYgKHBhdGgpIHtcbiAgICAgICAgICAgIHRyYWNrT3BlcmF0aW9uVGltaW5nKFxuICAgICAgICAgICAgICAnbnVjbGlkZS1yZWxhdGVkLWZpbGVzOmp1bXAtdG8tbmV4dC1yZWxhdGVkLWZpbGUnLFxuICAgICAgICAgICAgICBhc3luYyAoKSA9PiB0aGlzLl9vcGVuKGF3YWl0IHRoaXMuZ2V0TmV4dFJlbGF0ZWRGaWxlKHBhdGgpKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAnbnVjbGlkZS1yZWxhdGVkLWZpbGVzOmp1bXAtdG8tcHJldmlvdXMtcmVsYXRlZC1maWxlJzogKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICAgICAgICBpZiAocGF0aCkge1xuICAgICAgICAgICAgdHJhY2tPcGVyYXRpb25UaW1pbmcoXG4gICAgICAgICAgICAgICdudWNsaWRlLXJlbGF0ZWQtZmlsZXM6anVtcC10by1wcmV2aW91cy1yZWxhdGVkLWZpbGUnLFxuICAgICAgICAgICAgICBhc3luYyAoKSA9PiB0aGlzLl9vcGVuKGF3YWl0IHRoaXMuZ2V0UHJldmlvdXNSZWxhdGVkRmlsZShwYXRoKSksXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIHRoaXMuX2NvbW1hbmRTdWJzY3JpcHRpb25zTWFwLnNldCh0ZXh0RWRpdG9yLCBjb21tYW5kU3Vic2NyaXB0aW9uKTtcblxuICAgIHRleHRFZGl0b3Iub25EaWREZXN0cm95KHRoaXMuX2Rpc2FibGVJblRleHRFZGl0b3IuYmluZCh0aGlzLCB0ZXh0RWRpdG9yKSk7XG4gIH1cblxuICBfZGlzYWJsZUluVGV4dEVkaXRvcih0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGhpcy5fY29tbWFuZFN1YnNjcmlwdGlvbnNNYXAuZ2V0KHRleHRFZGl0b3IpO1xuICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9jb21tYW5kU3Vic2NyaXB0aW9uc01hcC5kZWxldGUodGV4dEVkaXRvcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG5leHQgcmVsYXRlZCBmaWxlLCB3aGljaCBYY29kZSBkZWZpbmVzIGFzIHRoZSBvbmUgdGhhdCBjb21lc1xuICAgKiBiZWZvcmUgdGhlIGN1cnJlbnQgb25lIGFscGhhYmV0aWNhbGx5LlxuICAgKi9cbiAgYXN5bmMgZ2V0TmV4dFJlbGF0ZWRGaWxlKHBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qge3JlbGF0ZWRGaWxlcywgaW5kZXh9ID0gYXdhaXQgdGhpcy5fcmVsYXRlZEZpbGVGaW5kZXIuZmluZChwYXRoKTtcbiAgICByZXR1cm4gcmVsYXRlZEZpbGVzWyhyZWxhdGVkRmlsZXMubGVuZ3RoICsgaW5kZXggLSAxKSAlIHJlbGF0ZWRGaWxlcy5sZW5ndGhdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHByZXZpb3VzIHJlbGF0ZWQgZmlsZSwgd2hpY2ggWGNvZGUgZGVmaW5lcyBhcyB0aGUgb25lIHRoYXQgY29tZXNcbiAgICogYWZ0ZXIgdGhlIGN1cnJlbnQgb25lIGFscGhhYmV0aWNhbGx5LlxuICAgKi9cbiAgYXN5bmMgZ2V0UHJldmlvdXNSZWxhdGVkRmlsZShwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHtyZWxhdGVkRmlsZXMsIGluZGV4fSA9IGF3YWl0IHRoaXMuX3JlbGF0ZWRGaWxlRmluZGVyLmZpbmQocGF0aCk7XG4gICAgcmV0dXJuIHJlbGF0ZWRGaWxlc1soaW5kZXggKyAxKSAlIHJlbGF0ZWRGaWxlcy5sZW5ndGhdO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIHRoZSBwYXRoIGluIHRoZSBuZXh0IHBhbmUsIG9yIHRoZSBjdXJyZW50IG9uZSBpZiB0aGVyZSdzIG9ubHkgb25lLlxuICAgKlxuICAgKiBXZSBuYXZpZ2F0ZSB0byBhIGZpbGUgaWYgaXQncyBhbHJlYWR5IG9wZW4sIGluc3RlYWQgb2Ygb3BlbmluZyBpdCBpbiBhIG5ldyB0YWIuXG4gICAqL1xuICBfb3BlbihwYXRoOiBzdHJpbmcpIHtcbiAgICBhdG9tLndvcmtzcGFjZS5hY3RpdmF0ZU5leHRQYW5lKCk7XG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbihwYXRoLCB7c2VhcmNoQWxsUGFuZXM6IHRydWV9KTtcbiAgfVxuXG59XG4iXX0=