Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _HackLanguage2;

function _HackLanguage() {
  return _HackLanguage2 = require('./HackLanguage');
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var ICONS = {
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
  for (var keyword in ICONS) {
    if (item.additionalInfo.indexOf(keyword) !== -1) {
      return ICONS[keyword];
    }
  }
  return ICONS.unknown;
}

var HackSymbolProvider = {

  getName: function getName() {
    return 'HackSymbolProvider';
  },

  getProviderType: function getProviderType() {
    return 'DIRECTORY';
  },

  isRenderable: function isRenderable() {
    return true;
  },

  getAction: function getAction() {
    return 'nuclide-hack-symbol-provider:toggle-provider';
  },

  getPromptText: function getPromptText() {
    return 'Search Hack symbols. Available prefixes: @function %constant #class';
  },

  getTabTitle: function getTabTitle() {
    return 'Hack Symbols';
  },

  isEligibleForDirectory: _asyncToGenerator(function* (directory) {
    var service = yield (0, (_HackLanguage2 || _HackLanguage()).getHackServiceForProject)(directory);
    return service != null;
  }),

  executeQuery: _asyncToGenerator(function* (query, directory) {
    if (query.length === 0 || directory == null) {
      return [];
    }

    var service = yield (0, (_HackLanguage2 || _HackLanguage()).getHackServiceForProject)(directory);
    if (service == null) {
      return [];
    }

    var directoryPath = directory.getPath();
    var results = yield service.executeQuery(directoryPath, query);
    return results;
  }),

  getComponentForItem: function getComponentForItem(uncastedItem) {
    var item = uncastedItem;
    var filePath = item.path;
    var filename = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.basename(filePath);
    var name = item.name || '';

    var icon = bestIconForItem(item);
    var symbolClasses = 'file icon ' + icon;
    return (_reactForAtom2 || _reactForAtom()).React.createElement(
      'div',
      { title: item.additionalInfo || '' },
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'span',
        { className: symbolClasses },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'code',
          null,
          name
        )
      ),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'span',
        { className: 'omnisearch-symbol-result-filename' },
        filename
      )
    );
  }
};
exports.HackSymbolProvider = HackSymbolProvider;