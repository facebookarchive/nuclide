"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _humanizePath() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/humanizePath"));

  _humanizePath = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class QuickOpenProvider {
  constructor(languageService) {
    this.providerType = 'GLOBAL';
    this.name = 'JSImportsService';
    this.display = {
      title: 'JS Symbols',
      prompt: 'Search JavaScript symbols...',
      action: 'nuclide-js-imports:toggle-provider'
    };
    this._languageService = languageService;
  }

  async _getDirectoriesByService(directories) {
    return (0, _collection().collect)((0, _collection().arrayCompact)((await Promise.all( // Flow's inference engine blows up without the annotation :(
    directories.map(async directory => {
      const path = directory.getPath();
      const service = await this._languageService.getLanguageServiceForUri(path);
      return service != null ? [service, path] : null;
    })))));
  }

  async isEligibleForDirectories(directories) {
    const directoriesByService = await this._getDirectoriesByService(directories);
    return (await (0, _promise().asyncFind)(Array.from(directoriesByService), ([service, paths]) => service.supportsSymbolSearch(paths))) != null;
  }

  async executeQuery(query, directories) {
    if (query.length === 0) {
      return [];
    }

    const directoriesByService = await this._getDirectoriesByService(directories);
    const results = await Promise.all(Array.from(directoriesByService).map(([service, paths]) => service.symbolSearch(query, paths)));
    return (0, _collection().arrayFlatten)((0, _collection().arrayCompact)(results));
  } // TODO: Standardize on a generic SymbolResult renderer.


  getComponentForItem(item) {
    const name = item.name || ''; // flowlint-next-line sketchy-null-string:off

    const symbolClasses = item.icon ? `file icon icon-${item.icon}` : 'file icon no-icon';
    return React.createElement("div", {
      title: item.hoverText || ''
    }, React.createElement("span", {
      className: symbolClasses
    }, React.createElement("code", null, name)), React.createElement("span", {
      className: "omnisearch-symbol-result-filename"
    }, (0, _humanizePath().default)(item.path)));
  }

}

exports.default = QuickOpenProvider;