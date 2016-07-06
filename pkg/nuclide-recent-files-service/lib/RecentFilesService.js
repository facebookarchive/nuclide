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

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _commonsAtomDebounced2;

function _commonsAtomDebounced() {
  return _commonsAtomDebounced2 = require('../../commons-atom/debounced');
}

var RecentFilesService = (function () {
  function RecentFilesService(state) {
    var _this = this;

    _classCallCheck(this, RecentFilesService);

    this._fileList = new Map();
    if (state != null && state.filelist != null) {
      // Serialized state is in reverse chronological order. Reverse it to insert items correctly.
      state.filelist.reduceRight(function (_, fileItem) {
        _this._fileList.set(fileItem.path, fileItem.timestamp);
      }, null);
    }
    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    this._subscriptions.add((0, (_commonsAtomDebounced2 || _commonsAtomDebounced()).onWorkspaceDidStopChangingActivePaneItem)(function (item) {
      // Not all `item`s are instances of TextEditor (e.g. the diff view).
      if (!item || typeof item.getPath !== 'function') {
        return;
      }
      var editorPath = item.getPath();
      if (editorPath != null) {
        _this.touchFile(editorPath);
      }
    }));
  }

  _createDecoratedClass(RecentFilesService, [{
    key: 'touchFile',
    value: function touchFile(path) {
      // Delete first to force a new insertion.
      this._fileList.delete(path);
      this._fileList.set(path, Date.now());
    }

    /**
     * Returns a reverse-chronological list of recently opened files.
     */
  }, {
    key: 'getRecentFiles',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)()],
    value: function getRecentFiles() {
      return Array.from(this._fileList).reverse().map(function (pair) {
        return {
          path: pair[0],
          timestamp: pair[1]
        };
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }]);

  return RecentFilesService;
})();

module.exports = RecentFilesService;

// Map uses `Map`'s insertion ordering to keep files in order.