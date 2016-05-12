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
  var hackEnvironment = yield (0, (_nuclideHackLibUtils2 || _nuclideHackLibUtils()).getHackEnvironmentDetails)(directoryPath);

  // Note that service being non-null only verifies that the nuclide-server that corresponds to the
  // directory has the HackService registered: it does not guarantee that the specified
  // directory is searchable via Hack. As such, we have to perform a second check to make sure
  // that the specified directory belongs to a Hack project.
  return hackEnvironment.isAvailable ? hackEnvironment.hackService : null;
});

exports.getHackService = getHackService;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _nuclideHackLibUtils2;

function _nuclideHackLibUtils() {
  return _nuclideHackLibUtils2 = require('../../nuclide-hack/lib/utils');
}