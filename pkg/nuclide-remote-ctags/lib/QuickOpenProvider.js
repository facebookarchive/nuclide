var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var getCtagsService = _asyncToGenerator(function* (directory) {
  // The tags package looks in the directory, so give it a sample file.
  var path = (0, _nuclideRemoteUri.join)(directory.getPath(), 'file');
  var service = (0, _nuclideRemoteConnection.getServiceByNuclideUri)('CtagsService', path);
  if (service == null) {
    return null;
  }
  return yield service.getCtagsService(path);
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom = require('react-for-atom');

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _nuclideHackSymbolProviderLibGetHackService = require('../../nuclide-hack-symbol-provider/lib/getHackService');

var _nuclideRemoteConnection = require('../../nuclide-remote-connection');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _utils = require('./utils');

// ctags doesn't have a true limit API, so having too many results slows down Nuclide.
var MIN_QUERY_LENGTH = 2;
var RESULTS_LIMIT = 10;
var DEFAULT_ICON = 'icon-squirrel';

module.exports = {

  getProviderType: function getProviderType() {
    return 'DIRECTORY';
  },

  getName: function getName() {
    return 'CtagsSymbolProvider';
  },

  isRenderable: function isRenderable() {
    return true;
  },

  getTabTitle: function getTabTitle() {
    return 'Ctags';
  },

  isEligibleForDirectory: _asyncToGenerator(function* (directory) {
    var svc = yield getCtagsService(directory);
    if (svc != null) {
      svc.dispose();
      return true;
    }
    return false;
  }),

  getComponentForItem: function getComponentForItem(uncastedItem) {
    var item = uncastedItem;
    var path = (0, _nuclideRemoteUri.relative)(item.dir, item.path);
    var kind = undefined,
        icon = undefined;
    if (item.kind != null) {
      kind = _utils.CTAGS_KIND_NAMES[item.kind];
      icon = _utils.CTAGS_KIND_ICONS[item.kind];
    }
    icon = icon || DEFAULT_ICON;
    return _reactForAtom.React.createElement(
      'div',
      { title: kind },
      _reactForAtom.React.createElement(
        'span',
        { className: 'file icon ' + icon },
        _reactForAtom.React.createElement(
          'code',
          null,
          item.name
        )
      ),
      _reactForAtom.React.createElement(
        'span',
        { className: 'omnisearch-symbol-result-filename' },
        path
      )
    );
  },

  executeQuery: _asyncToGenerator(function* (query, directory) {
    if (directory == null || query.length < MIN_QUERY_LENGTH) {
      return [];
    }

    var dir = directory.getPath();
    var service = yield getCtagsService(directory);
    if (service == null) {
      return [];
    }

    // HACK: Ctags results typically just duplicate Hack results when they're present.
    // Filter out results from PHP files when the Hack service is available.
    // TODO(hansonw): Remove this when quick-open has proper ranking/de-duplication.
    var hack = undefined;
    if (_nuclideFeatureConfig2['default'].get('nuclide-remote-ctags.disableWithHack') !== false) {
      hack = yield (0, _nuclideHackSymbolProviderLibGetHackService.getHackService)(directory);
    }

    try {
      var results = yield service.findTags(query, {
        caseInsensitive: true,
        partialMatch: true,
        limit: RESULTS_LIMIT
      });

      return yield Promise.all(results.filter(function (tag) {
        return hack == null || !tag.file.endsWith('.php');
      }).map(_asyncToGenerator(function* (tag) {
        var line = yield (0, _utils.getLineNumberForTag)(tag);
        return _extends({}, tag, {
          path: tag.file,
          dir: dir,
          line: line
        });
      })));
    } finally {
      service.dispose();
    }
  })

};