'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HackSymbolProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getHackDirectoriesByService = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (directories) {
    const promises = directories.map((() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (directory) {
        const service = yield (0, (_HackLanguage || _load_HackLanguage()).getHackLanguageForUri)(directory.getPath());
        return service ? [service, directory.getPath()] : null;
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    })());
    const serviceDirectories = yield Promise.all(promises);

    const results = (0, (_collection || _load_collection()).collect)((0, (_collection || _load_collection()).arrayCompact)(serviceDirectories));

    return Array.from(results.entries());
  });

  return function getHackDirectoriesByService(_x) {
    return _ref.apply(this, arguments);
  };
})(); /**
       * Copyright (c) 2015-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the license found in the LICENSE file in
       * the root directory of this source tree.
       *
       * 
       * @format
       */

var _HackLanguage;

function _load_HackLanguage() {
  return _HackLanguage = require('./HackLanguage');
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HackSymbolProvider = exports.HackSymbolProvider = {
  providerType: 'GLOBAL',
  name: 'HackSymbolProvider',
  display: {
    title: 'Hack Symbols',
    prompt: 'Search Hack symbols...',
    action: 'nuclide-hack-symbol-provider:toggle-provider'
  },

  isEligibleForDirectories(directories) {
    return (0, _asyncToGenerator.default)(function* () {
      const serviceDirectories = yield getHackDirectoriesByService(directories);
      const eligibilities = yield Promise.all(serviceDirectories.map(function ([service, dirs]) {
        return service.supportsSymbolSearch(dirs);
      }));
      return eligibilities.some(function (e) {
        return e;
      });
    })();
  },

  executeQuery(query, directories) {
    return (0, _asyncToGenerator.default)(function* () {
      if (query.length === 0) {
        return [];
      }

      const serviceDirectories = yield getHackDirectoriesByService(directories);
      const results = yield Promise.all(serviceDirectories.map(function ([service, dirs]) {
        return service.symbolSearch(query, dirs);
      }));
      const flattenedResults = (0, (_collection || _load_collection()).arrayFlatten)((0, (_collection || _load_collection()).arrayCompact)(results));

      return flattenedResults;
      // Why the weird cast? Because services are expected to return their own
      // custom type with symbol-provider-specific additional detail. We upcast it
      // now to FileResult which only has the things that Quick-Open cares about
      // like line, column, ... Later on, Quick-Open invokes getComponentForItem
      // (below) to render each result: it does a downcast so it can render
      // whatever additional details.
    })();
  },

  getComponentForItem(uncastedItem) {
    const item = uncastedItem;
    const filePath = item.path;
    const filename = (_nuclideUri || _load_nuclideUri()).default.basename(filePath);
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
        filename
      )
    );
  }
};