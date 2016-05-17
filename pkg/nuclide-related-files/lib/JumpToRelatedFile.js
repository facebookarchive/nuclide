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

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

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
            (0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackOperationTiming)('nuclide-related-files:jump-to-next-related-file', _asyncToGenerator(function* () {
              return _this._open((yield _this.getNextRelatedFile(path)));
            }));
          }
        },
        'nuclide-related-files:jump-to-previous-related-file': function nuclideRelatedFilesJumpToPreviousRelatedFile() {
          var path = textEditor.getPath();
          if (path) {
            (0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackOperationTiming)('nuclide-related-files:jump-to-previous-related-file', _asyncToGenerator(function* () {
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
        this._commandSubscriptionsMap.delete(textEditor);
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

exports.default = JumpToRelatedFile;
module.exports = exports.default;