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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var getCtagsService = _asyncToGenerator(function* (directory) {
  // The tags package looks in the directory, so give it a sample file.
  var path = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(directory.getPath(), 'file');
  var service = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByNuclideUri)('CtagsService', path);
  if (service == null) {
    return null;
  }
  return yield service.getCtagsService(path);
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var _nuclideHackSymbolProviderLibGetHackService2;

function _nuclideHackSymbolProviderLibGetHackService() {
  return _nuclideHackSymbolProviderLibGetHackService2 = require('../../nuclide-hack-symbol-provider/lib/getHackService');
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _utils2;

function _utils() {
  return _utils2 = require('./utils');
}

// ctags doesn't have a true limit API, so having too many results slows down Nuclide.
var MIN_QUERY_LENGTH = 2;
var RESULTS_LIMIT = 10;
var DEFAULT_ICON = 'icon-squirrel';

var QuickOpenHelpers = (function () {
  function QuickOpenHelpers() {
    _classCallCheck(this, QuickOpenHelpers);
  }

  _createClass(QuickOpenHelpers, null, [{
    key: 'isEligibleForDirectory',
    value: _asyncToGenerator(function* (directory) {
      var svc = yield getCtagsService(directory);
      if (svc != null) {
        svc.dispose();
        return true;
      }
      return false;
    })
  }, {
    key: 'getComponentForItem',
    value: function getComponentForItem(uncastedItem) {
      var item = uncastedItem;
      var path = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.relative(item.dir, item.path);
      var kind = undefined;
      var icon = undefined;
      if (item.kind != null) {
        kind = (_utils2 || _utils()).CTAGS_KIND_NAMES[item.kind];
        icon = (_utils2 || _utils()).CTAGS_KIND_ICONS[item.kind];
      }
      icon = icon || DEFAULT_ICON;
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { title: kind },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'span',
          { className: 'file icon ' + icon },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'code',
            null,
            item.name
          )
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'span',
          { className: 'omnisearch-symbol-result-filename' },
          path
        )
      );
    }
  }, {
    key: 'executeQuery',
    value: _asyncToGenerator(function* (query, directory) {
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
      if ((_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-remote-ctags.disableWithHack') !== false) {
        hack = yield (0, (_nuclideHackSymbolProviderLibGetHackService2 || _nuclideHackSymbolProviderLibGetHackService()).getHackService)(directory);
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
          var line = yield (0, (_utils2 || _utils()).getLineNumberForTag)(tag);
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
  }]);

  return QuickOpenHelpers;
})();

exports.default = QuickOpenHelpers;
module.exports = exports.default;