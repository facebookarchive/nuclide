"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExportIndex = void 0;

function _ExportMatcher() {
  const data = _interopRequireDefault(require("./ExportMatcher"));

  _ExportMatcher = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
class ExportIndex {
  constructor() {
    this.exportsForId = new Map();
    this.exportsForFile = new Map();
    this.exportIdMatcher = new (_ExportMatcher().default)();
  }

  clearAllExports() {
    this.exportsForId = new Map();
    this.exportsForFile = new Map();
    this.exportIdMatcher = new (_ExportMatcher().default)();
  }

  hasExport(id) {
    return this.exportsForId.has(id);
  }

  clearExportsFromFile(file) {
    const toClear = this.exportsForFile.get(file);

    if (!toClear) {
      return;
    }

    this.exportsForFile.set(file, new Set());
    toClear.forEach(exp => {
      const exportsWithSameId = this.exportsForId.get(exp.id);

      if (exportsWithSameId) {
        exportsWithSameId.delete(exp);

        if (exportsWithSameId.size === 0) {
          this.exportsForId.delete(exp.id);
          this.exportIdMatcher.remove(exp.id);
        }
      }
    });
  }

  getExportsFromId(id) {
    const indexExports = this.exportsForId.get(id);

    if (indexExports) {
      return Array.from(indexExports);
    }

    return [];
  }

  getIdsMatching(query, maxResults) {
    return this.exportIdMatcher.match(query, {
      caseSensitive: false,
      maxResults
    }).map(result => result.value);
  }

  setAll(file, exports) {
    this.clearExportsFromFile(file);
    exports.forEach(exp => this._add(exp));
  }

  _add(newExport) {
    const {
      id,
      uri
    } = newExport;
    const idExports = this.exportsForId.get(id);
    const fileExports = this.exportsForFile.get(uri);

    if (idExports) {
      idExports.add(newExport);
    } else {
      this.exportsForId.set(id, new Set([newExport]));
      this.exportIdMatcher.add(id);
    }

    if (fileExports) {
      fileExports.add(newExport);
    } else {
      this.exportsForFile.set(uri, new Set([newExport]));
    }
  }

}

exports.ExportIndex = ExportIndex;