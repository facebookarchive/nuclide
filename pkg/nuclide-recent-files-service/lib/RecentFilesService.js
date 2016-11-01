'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _dec, _desc, _value, _class;

var _atom = require('atom');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

let RecentFilesService = (_dec = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)(), (_class = class RecentFilesService {
  // Map uses `Map`'s insertion ordering to keep files in order.
  constructor(state) {
    this._fileList = new Map();
    if (state != null && state.filelist != null) {
      // Serialized state is in reverse chronological order. Reverse it to insert items correctly.
      state.filelist.reduceRight((_, fileItem) => {
        this._fileList.set(fileItem.path, fileItem.timestamp);
      }, null);
    }
    this._subscriptions = new _atom.CompositeDisposable();
    this._subscriptions.add(atom.workspace.onDidStopChangingActivePaneItem(item => {
      // Not all `item`s are instances of TextEditor (e.g. the diff view).
      if (!item || typeof item.getPath !== 'function') {
        return;
      }
      const editorPath = item.getPath();
      if (editorPath != null) {
        this.touchFile(editorPath);
      }
    }));
  }

  touchFile(path) {
    // Delete first to force a new insertion.
    this._fileList.delete(path);
    this._fileList.set(path, Date.now());
  }

  /**
   * Returns a reverse-chronological list of recently opened files.
   */

  getRecentFiles() {
    return Array.from(this._fileList).reverse().map(pair => ({
      path: pair[0],
      timestamp: pair[1]
    }));
  }

  dispose() {
    this._subscriptions.dispose();
  }

}, (_applyDecoratedDescriptor(_class.prototype, 'getRecentFiles', [_dec], Object.getOwnPropertyDescriptor(_class.prototype, 'getRecentFiles'), _class.prototype)), _class));


module.exports = RecentFilesService;