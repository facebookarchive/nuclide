'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HackSymbolProvider = undefined;

var _humanizePath;

function _load_humanizePath() {
  return _humanizePath = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/humanizePath'));
}

var _HackLanguage;

function _load_HackLanguage() {
  return _HackLanguage = require('./HackLanguage');
}

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function getHackDirectoriesByService(directories) {
  const promises = directories.map(async directory => {
    const service = await (0, (_HackLanguage || _load_HackLanguage()).getHackLanguageForUri)(directory.getPath());
    return service ? [service, directory.getPath()] : null;
  });
  const serviceDirectories = await Promise.all(promises);

  const results = (0, (_collection || _load_collection()).collect)((0, (_collection || _load_collection()).arrayCompact)(serviceDirectories));

  return Array.from(results.entries());
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

const HackSymbolProvider = exports.HackSymbolProvider = {
  providerType: 'GLOBAL',
  name: 'HackSymbolProvider',
  display: {
    title: 'Hack Symbols',
    prompt: 'Search Hack symbols...',
    action: 'nuclide-hack-symbol-provider:toggle-provider'
  },

  async isEligibleForDirectories(directories) {
    const serviceDirectories = await getHackDirectoriesByService(directories);
    const eligibilities = await Promise.all(serviceDirectories.map(([service, dirs]) => service.supportsSymbolSearch(dirs)));
    return eligibilities.some(e => e);
  },

  async executeQuery(query, directories) {
    if (query.length === 0) {
      return [];
    }

    const serviceDirectories = await getHackDirectoriesByService(directories);
    const results = await Promise.all(serviceDirectories.map(([service, dirs]) => service.symbolSearch(query, dirs)));
    return (0, (_collection || _load_collection()).arrayFlatten)((0, (_collection || _load_collection()).arrayCompact)(results));
  },

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
};