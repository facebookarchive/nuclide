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

var _analytics = require('../../analytics');

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
            (0, _analytics.trackOperationTiming)('nuclide-related-files:jump-to-next-related-file', _asyncToGenerator(function* () {
              return _this._open((yield _this.getNextRelatedFile(path)));
            }));
          }
        },
        'nuclide-related-files:jump-to-previous-related-file': function nuclideRelatedFilesJumpToPreviousRelatedFile() {
          var path = textEditor.getPath();
          if (path) {
            (0, _analytics.trackOperationTiming)('nuclide-related-files:jump-to-previous-related-file', _asyncToGenerator(function* () {
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
//# sourceMappingURL=data:application/json;base64,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S0FBSzs7QUFDMUIsYUFBTyxZQUFZLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFBLEdBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3hEOzs7Ozs7Ozs7V0FPSSxlQUFDLElBQVksRUFBRTtBQUNsQixVQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDbEMsVUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUMsY0FBYyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7S0FDbkQ7OztTQWpGa0IsaUJBQWlCOzs7cUJBQWpCLGlCQUFpQiIsImZpbGUiOiJKdW1wVG9SZWxhdGVkRmlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIFJlbGF0ZWRGaWxlRmluZGVyIGZyb20gJy4vUmVsYXRlZEZpbGVGaW5kZXInO1xuXG5pbXBvcnQge3RyYWNrT3BlcmF0aW9uVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuXG4vKipcbiAqIFNldHMgdXAgbGlzdGVuZXJzIHNvIHRoZSB1c2VyIGNhbiBqdW1wIHRvIHJlbGF0ZWQgZmlsZXMuXG4gKlxuICogQ2xpZW50cyBtdXN0IGNhbGwgYGRpc3Bvc2UoKWAgb25jZSB0aGV5J3JlIGRvbmUgd2l0aCBhbiBpbnN0YW5jZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSnVtcFRvUmVsYXRlZEZpbGUge1xuICBfY29tbWFuZFN1YnNjcmlwdGlvbnNNYXA6IE1hcDtcbiAgX3JlbGF0ZWRGaWxlRmluZGVyOiBSZWxhdGVkRmlsZUZpbmRlcjtcblxuICBjb25zdHJ1Y3RvcihyZWxhdGVkRmlsZUZpbmRlcjogUmVsYXRlZEZpbGVGaW5kZXIpIHtcbiAgICB0aGlzLl9yZWxhdGVkRmlsZUZpbmRlciA9IHJlbGF0ZWRGaWxlRmluZGVyO1xuICAgIHRoaXMuX2NvbW1hbmRTdWJzY3JpcHRpb25zTWFwID0gbmV3IE1hcCgpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9jb21tYW5kU3Vic2NyaXB0aW9uc01hcC5mb3JFYWNoKHN1YnNjcmlwdGlvbiA9PiBzdWJzY3JpcHRpb24uZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9jb21tYW5kU3Vic2NyaXB0aW9uc01hcC5jbGVhcigpO1xuICB9XG5cbiAgZW5hYmxlSW5UZXh0RWRpdG9yKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpIHtcbiAgICBpZiAodGhpcy5fY29tbWFuZFN1YnNjcmlwdGlvbnNNYXAuaGFzKHRleHRFZGl0b3IpKSB7XG4gICAgICByZXR1cm47IC8vIEFscmVhZHkgZW5hYmxlZC5cbiAgICB9XG5cbiAgICBjb25zdCB0ZXh0RWRpdG9yRWwgPSBhdG9tLnZpZXdzLmdldFZpZXcodGV4dEVkaXRvcik7XG4gICAgY29uc3QgY29tbWFuZFN1YnNjcmlwdGlvbiA9IGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgdGV4dEVkaXRvckVsLFxuICAgICAge1xuICAgICAgICAnbnVjbGlkZS1yZWxhdGVkLWZpbGVzOmp1bXAtdG8tbmV4dC1yZWxhdGVkLWZpbGUnOiAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgcGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgICAgICAgIGlmIChwYXRoKSB7XG4gICAgICAgICAgICB0cmFja09wZXJhdGlvblRpbWluZyhcbiAgICAgICAgICAgICAgJ251Y2xpZGUtcmVsYXRlZC1maWxlczpqdW1wLXRvLW5leHQtcmVsYXRlZC1maWxlJyxcbiAgICAgICAgICAgICAgYXN5bmMgKCkgPT4gdGhpcy5fb3Blbihhd2FpdCB0aGlzLmdldE5leHRSZWxhdGVkRmlsZShwYXRoKSksXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgJ251Y2xpZGUtcmVsYXRlZC1maWxlczpqdW1wLXRvLXByZXZpb3VzLXJlbGF0ZWQtZmlsZSc6ICgpID0+IHtcbiAgICAgICAgICBjb25zdCBwYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgICAgICAgaWYgKHBhdGgpIHtcbiAgICAgICAgICAgIHRyYWNrT3BlcmF0aW9uVGltaW5nKFxuICAgICAgICAgICAgICAnbnVjbGlkZS1yZWxhdGVkLWZpbGVzOmp1bXAtdG8tcHJldmlvdXMtcmVsYXRlZC1maWxlJyxcbiAgICAgICAgICAgICAgYXN5bmMgKCkgPT4gdGhpcy5fb3Blbihhd2FpdCB0aGlzLmdldFByZXZpb3VzUmVsYXRlZEZpbGUocGF0aCkpLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB0aGlzLl9jb21tYW5kU3Vic2NyaXB0aW9uc01hcC5zZXQodGV4dEVkaXRvciwgY29tbWFuZFN1YnNjcmlwdGlvbik7XG5cbiAgICB0ZXh0RWRpdG9yLm9uRGlkRGVzdHJveSh0aGlzLl9kaXNhYmxlSW5UZXh0RWRpdG9yLmJpbmQodGhpcywgdGV4dEVkaXRvcikpO1xuICB9XG5cbiAgX2Rpc2FibGVJblRleHRFZGl0b3IodGV4dEVkaXRvcjogVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuX2NvbW1hbmRTdWJzY3JpcHRpb25zTWFwLmdldCh0ZXh0RWRpdG9yKTtcbiAgICBpZiAoc3Vic2NyaXB0aW9uKSB7XG4gICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fY29tbWFuZFN1YnNjcmlwdGlvbnNNYXAuZGVsZXRlKHRleHRFZGl0b3IpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBuZXh0IHJlbGF0ZWQgZmlsZSwgd2hpY2ggWGNvZGUgZGVmaW5lcyBhcyB0aGUgb25lIHRoYXQgY29tZXNcbiAgICogYmVmb3JlIHRoZSBjdXJyZW50IG9uZSBhbHBoYWJldGljYWxseS5cbiAgICovXG4gIGFzeW5jIGdldE5leHRSZWxhdGVkRmlsZShwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHtyZWxhdGVkRmlsZXMsIGluZGV4fSA9IGF3YWl0IHRoaXMuX3JlbGF0ZWRGaWxlRmluZGVyLmZpbmQocGF0aCk7XG4gICAgcmV0dXJuIHJlbGF0ZWRGaWxlc1socmVsYXRlZEZpbGVzLmxlbmd0aCArIGluZGV4IC0gMSkgJSByZWxhdGVkRmlsZXMubGVuZ3RoXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBwcmV2aW91cyByZWxhdGVkIGZpbGUsIHdoaWNoIFhjb2RlIGRlZmluZXMgYXMgdGhlIG9uZSB0aGF0IGNvbWVzXG4gICAqIGFmdGVyIHRoZSBjdXJyZW50IG9uZSBhbHBoYWJldGljYWxseS5cbiAgICovXG4gIGFzeW5jIGdldFByZXZpb3VzUmVsYXRlZEZpbGUocGF0aDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCB7cmVsYXRlZEZpbGVzLCBpbmRleH0gPSBhd2FpdCB0aGlzLl9yZWxhdGVkRmlsZUZpbmRlci5maW5kKHBhdGgpO1xuICAgIHJldHVybiByZWxhdGVkRmlsZXNbKGluZGV4ICsgMSkgJSByZWxhdGVkRmlsZXMubGVuZ3RoXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgcGF0aCBpbiB0aGUgbmV4dCBwYW5lLCBvciB0aGUgY3VycmVudCBvbmUgaWYgdGhlcmUncyBvbmx5IG9uZS5cbiAgICpcbiAgICogV2UgbmF2aWdhdGUgdG8gYSBmaWxlIGlmIGl0J3MgYWxyZWFkeSBvcGVuLCBpbnN0ZWFkIG9mIG9wZW5pbmcgaXQgaW4gYSBuZXcgdGFiLlxuICAgKi9cbiAgX29wZW4ocGF0aDogc3RyaW5nKSB7XG4gICAgYXRvbS53b3Jrc3BhY2UuYWN0aXZhdGVOZXh0UGFuZSgpO1xuICAgIGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aCwge3NlYXJjaEFsbFBhbmVzOiB0cnVlfSk7XG4gIH1cblxufVxuIl19