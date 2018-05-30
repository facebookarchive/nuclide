'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _humanizePath;

function _load_humanizePath() {
  return _humanizePath = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/humanizePath'));
}

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _promise;

function _load_promise() {
  return _promise = require('../../../modules/nuclide-commons/promise');
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    return (0, (_collection || _load_collection()).collect)((0, (_collection || _load_collection()).arrayCompact)((await Promise.all(
    // Flow's inference engine blows up without the annotation :(
    directories.map(async directory => {
      const path = directory.getPath();
      const service = await this._languageService.getLanguageServiceForUri(path);
      return service != null ? [service, path] : null;
    })))));
  }

  async isEligibleForDirectories(directories) {
    const directoriesByService = await this._getDirectoriesByService(directories);
    return (await (0, (_promise || _load_promise()).asyncFind)(Array.from(directoriesByService), ([service, paths]) => service.supportsSymbolSearch(paths))) != null;
  }

  async executeQuery(query, directories) {
    if (query.length === 0) {
      return [];
    }

    const directoriesByService = await this._getDirectoriesByService(directories);
    const results = await Promise.all(Array.from(directoriesByService).map(([service, paths]) => service.symbolSearch(query, paths)));
    return (0, (_collection || _load_collection()).arrayFlatten)((0, (_collection || _load_collection()).arrayCompact)(results));
  }

  // TODO: Standardize on a generic SymbolResult renderer.
  getComponentForItem(item) {
    const name = item.name || '';

    // flowlint-next-line sketchy-null-string:off
    const symbolClasses = item.icon ? `file icon icon-${item.icon}` : 'file icon no-icon';
    return _react.createElement(
      'div',
      { title: item.hoverText || '' },
      _react.createElement(
        'span',
        { className: symbolClasses },
        _react.createElement(
          'code',
          null,
          name
        )
      ),
      _react.createElement(
        'span',
        { className: 'omnisearch-symbol-result-filename' },
        (0, (_humanizePath || _load_humanizePath()).default)(item.path)
      )
    );
  }
}
exports.default = QuickOpenProvider; /**
                                      * Copyright (c) 2015-present, Facebook, Inc.
                                      * All rights reserved.
                                      *
                                      * This source code is licensed under the license found in the LICENSE file in
                                      * the root directory of this source tree.
                                      *
                                      * 
                                      * @format
                                      */