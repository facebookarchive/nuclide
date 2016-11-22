'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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

var _reactForAtom = require('react-for-atom');

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
};

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
  getName: function () {
    return 'HackSymbolProvider';
  },
  getProviderType: function () {
    return 'DIRECTORY';
  },
  isRenderable: function () {
    return true;
  },
  getAction: function () {
    return 'nuclide-hack-symbol-provider:toggle-provider';
  },
  getPromptText: function () {
    return 'Search Hack symbols. Available prefixes: @function %constant #class';
  },
  getTabTitle: function () {
    return 'Hack Symbols';
  },
  isEligibleForDirectory: function (directory) {
    return (0, (_HackLanguage || _load_HackLanguage()).isFileInHackProject)(directory.getPath());
  },
  executeQuery: (() => {
    var _ref = (0, _asyncToGenerator.default)(function* (query, directory) {
      if (query.length === 0 || directory == null) {
        return [];
      }

      const service = yield (0, (_HackLanguage || _load_HackLanguage()).getHackLanguageForUri)(directory.getPath());
      if (service == null) {
        return [];
      }

      const directoryPath = directory.getPath();
      const results = yield service.executeQuery(directoryPath, query);
      return results;
    });

    return function executeQuery(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  })(),
  getComponentForItem: function (uncastedItem) {
    const item = uncastedItem;
    const filePath = item.path;
    const filename = (_nuclideUri || _load_nuclideUri()).default.basename(filePath);
    const name = item.name || '';

    const icon = bestIconForItem(item);
    const symbolClasses = `file icon ${ icon }`;
    return _reactForAtom.React.createElement(
      'div',
      { title: item.additionalInfo || '' },
      _reactForAtom.React.createElement(
        'span',
        { className: symbolClasses },
        _reactForAtom.React.createElement(
          'code',
          null,
          name
        )
      ),
      _reactForAtom.React.createElement(
        'span',
        { className: 'omnisearch-symbol-result-filename' },
        filename
      )
    );
  }
};