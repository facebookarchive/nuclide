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

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _HackLanguage2;

function _HackLanguage() {
  return _HackLanguage2 = require('./HackLanguage');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

// Provides Diagnostics for un-typed regions of Hack code.

var TypeCoverageProvider = (function () {
  function TypeCoverageProvider(busySignalProvider) {
    _classCallCheck(this, TypeCoverageProvider);

    this._busySignalProvider = busySignalProvider;
    this._requestSerializer = new (_commonsNodePromise2 || _commonsNodePromise()).RequestSerializer();
  }

  _createDecoratedClass(TypeCoverageProvider, [{
    key: 'getTypeCoverage',
    value: function getTypeCoverage(path) {
      var _this = this;

      return this._busySignalProvider.reportBusy('Hack: Waiting for type coverage results', function () {
        return _this._getTypeCoverage(path);
      }).catch(_asyncToGenerator(function* (e) {
        logger.error(e);
      }));
    }
  }, {
    key: '_getTypeCoverage',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('hack:run-type-coverage')],
    value: _asyncToGenerator(function* (path) {
      var hackLanguage = yield (0, (_HackLanguage2 || _HackLanguage()).getHackLanguageForUri)(path);
      if (hackLanguage == null) {
        return null;
      }

      var result = yield this._requestSerializer.run(hackLanguage.getTypeCoverage(path));
      if (result.status === 'outdated') {
        return null;
      }

      var hackCoverageResult = result.result;
      if (hackCoverageResult == null) {
        return null;
      }
      var uncoveredRegions = hackCoverageResult.uncoveredRegions.map(function (region) {
        return convertHackRegionToCoverageRegion(path, region);
      });
      return {
        percentage: hackCoverageResult.percentage,
        uncoveredRegions: uncoveredRegions
      };
    })
  }]);

  return TypeCoverageProvider;
})();

exports.TypeCoverageProvider = TypeCoverageProvider;

var UNCHECKED_MESSAGE = 'Un-type checked code. Consider adding type annotations.';
var PARTIAL_MESSAGE = 'Partially type checked code. Consider adding type annotations.';

function convertHackRegionToCoverageRegion(filePath, region) {
  var line = region.line - 1;
  return {
    range: new (_atom2 || _atom()).Range([line, region.start - 1], [line, region.end]),
    message: region.type === 'partial' ? PARTIAL_MESSAGE : UNCHECKED_MESSAGE
  };
}