'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _humanizePath;

function _load_humanizePath() {
  return _humanizePath = _interopRequireDefault(require('nuclide-commons-atom/humanizePath'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
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

  _getDirectoriesByService(directories) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (0, (_collection || _load_collection()).collect)((0, (_collection || _load_collection()).arrayCompact)((yield Promise.all(
      // Flow's inference engine blows up without the annotation :(
      directories.map((() => {
        var _ref = (0, _asyncToGenerator.default)(function* (directory) {
          const path = directory.getPath();
          const service = yield _this._languageService.getLanguageServiceForUri(path);
          return service != null ? [service, path] : null;
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      })())))));
    })();
  }

  isEligibleForDirectories(directories) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const directoriesByService = yield _this2._getDirectoriesByService(directories);
      return (yield (0, (_promise || _load_promise()).asyncFind)(Array.from(directoriesByService), function ([service, paths]) {
        return service.supportsSymbolSearch(paths);
      })) != null;
    })();
  }

  executeQuery(query, directories) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (query.length === 0) {
        return [];
      }

      const directoriesByService = yield _this3._getDirectoriesByService(directories);
      const results = yield Promise.all(Array.from(directoriesByService).map(function ([service, paths]) {
        return service.symbolSearch(query, paths);
      }));
      return (0, (_collection || _load_collection()).arrayFlatten)((0, (_collection || _load_collection()).arrayCompact)(results));
    })();
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