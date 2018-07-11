"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function RecentFilesDB() {
  const data = _interopRequireWildcard(require("./RecentFilesDB"));

  RecentFilesDB = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
class RecentFilesService {
  constructor() {
    this._subscriptions = new (_UniversalDisposable().default)();

    this._subscriptions.add(atom.workspace.onDidChangeActivePaneItem(item => {
      // Not all `item`s are instances of TextEditor (e.g. the diff view).
      // flowlint-next-line sketchy-null-mixed:off
      if (!item || typeof item.getPath !== 'function') {
        return;
      }

      const editorPath = item.getPath();

      if (editorPath != null) {
        this.touchFile(editorPath);
      }
    }));
  }

  async touchFile(path) {
    await RecentFilesDB().touchFileDB(path, Date.now());
  }
  /**
   * Returns a reverse-chronological list of recently opened files.
   */


  async getRecentFiles() {
    const fileList = await RecentFilesDB().getAllRecents();
    return fileList.dump().map(({
      k,
      v
    }) => ({
      resultType: 'FILE',
      path: k,
      timestamp: v
    }));
  }

  dispose() {
    this._subscriptions.dispose(); // Try one last time to sync back. Changes should be periodically saved,
    // so if this doesn't run before we quit, that's OK. If package deactivation
    // were async, then we could wait for the DB save to complete.


    RecentFilesDB().syncCache(true);
  }

}

exports.default = RecentFilesService;