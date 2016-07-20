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

/**
 * @return FuzzyFileSearchService for the specified directory if it is part of a Hack project.
 */

var getFuzzyFileSearchService = _asyncToGenerator(function* (directory) {
  var directoryPath = directory.getPath();
  var service = (0, (_nuclideClient2 || _nuclideClient()).getServiceByNuclideUri)('FuzzyFileSearchService', directoryPath);
  return service;
});

exports.getFuzzyFileSearchService = getFuzzyFileSearchService;
exports.getIgnoredNames = getIgnoredNames;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _nuclideClient2;

function _nuclideClient() {
  return _nuclideClient2 = require('../../nuclide-client');
}

function getIgnoredNames() {
  return atom.config.get('core.ignoredNames') || [];
}