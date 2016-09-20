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
 * @return HackService for the specified directory if it is part of a Hack project.
 */

var getHackService = _asyncToGenerator(function* (directory) {
  var directoryPath = directory.getPath();
  return (yield (0, (_nuclideHackLibHackLanguage2 || _nuclideHackLibHackLanguage()).isFileInHackProject)(directoryPath)) ? (yield (0, (_nuclideHackLibHackLanguage2 || _nuclideHackLibHackLanguage()).getHackServiceByNuclideUri)(directoryPath)) : null;
});

exports.getHackService = getHackService;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideHackLibHackLanguage2;

function _nuclideHackLibHackLanguage() {
  return _nuclideHackLibHackLanguage2 = require('../../nuclide-hack/lib/HackLanguage');
}