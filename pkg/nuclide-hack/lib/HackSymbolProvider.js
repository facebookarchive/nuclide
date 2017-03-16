'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HackSymbolProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _HackLanguage;

function _load_HackLanguage() {
  return _HackLanguage = require('./HackLanguage');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ICONS = {
  'interface': 'icon-puzzle',
  'function': 'icon-zap',
  'method': 'icon-zap',
  'typedef': 'icon-tag',
  'class': 'icon-code',
  'abstract class': 'icon-code',
  'constant': 'icon-quote',
  'trait': 'icon-checklist',
  'enum': 'icon-file-binary',
  'default': 'no-icon',
  'unknown': 'icon-squirrel'
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    */

function bestIconForItem(item) {
  if (!item.additionalInfo) {
    return ICONS.default;
  }
  // Look for exact match.
  if (ICONS[item.additionalInfo]) {
    return ICONS[item.additionalInfo];
  }
  // Look for presence match, e.g. in 'static method in FooBarClass'.
  for (const keyword in ICONS) {
    if (item.additionalInfo.indexOf(keyword) !== -1) {
      return ICONS[keyword];
    }
  }
  return ICONS.unknown;
}

const HackSymbolProvider = exports.HackSymbolProvider = {
  providerType: 'DIRECTORY',
  name: 'HackSymbolProvider',
  display: {
    title: 'Hack Symbols',
    prompt: 'Search Hack symbols... (e.g. @function %constant #class)',
    action: 'nuclide-hack-symbol-provider:toggle-provider'
  },

  isEligibleForDirectory(directory) {
    return (0, (_HackLanguage || _load_HackLanguage()).isFileInHackProject)(directory.getPath());
  },

  executeQuery(query, directory) {
    return (0, _asyncToGenerator.default)(function* () {
      if (query.length === 0) {
        return [];
      }

      const service = yield (0, (_HackLanguage || _load_HackLanguage()).getHackLanguageForUri)(directory.getPath());
      if (service == null) {
        return [];
      }

      const directoryPath = directory.getPath();
      const results = yield service.executeQuery(directoryPath, query);
      return results;
    })();
  },

  getComponentForItem(uncastedItem) {
    const item = uncastedItem;
    const filePath = item.path;
    const filename = (_nuclideUri || _load_nuclideUri()).default.basename(filePath);
    const name = item.name || '';

    const icon = bestIconForItem(item);
    const symbolClasses = `file icon ${icon}`;
    return _react.default.createElement(
      'div',
      { title: item.additionalInfo || '' },
      _react.default.createElement(
        'span',
        { className: symbolClasses },
        _react.default.createElement(
          'code',
          null,
          name
        )
      ),
      _react.default.createElement(
        'span',
        { className: 'omnisearch-symbol-result-filename' },
        filename
      )
    );
  }
};