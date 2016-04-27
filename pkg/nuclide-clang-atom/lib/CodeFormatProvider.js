function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideAnalytics = require('../../nuclide-analytics');

var _constants = require('./constants');

var _nuclideLogging = require('../../nuclide-logging');

var _libclang = require('./libclang');

var _libclang2 = _interopRequireDefault(_libclang);

module.exports = {
  selector: Array.from(_constants.GRAMMAR_SET).join(', '),
  inclusionPriority: 1,
  formatEntireFile: function formatEntireFile(editor, range) {
    return (0, _nuclideAnalytics.trackOperationTiming)('nuclide-clang-atom.formatCode', _asyncToGenerator(function* () {
      try {
        return yield _libclang2['default'].formatCode(editor, range);
      } catch (e) {
        (0, _nuclideLogging.getLogger)().error('Could not run clang-format:', e);
        atom.notifications.addError('Could not run clang-format.<br>Ensure it is installed and in your $PATH.');
        throw e;
      }
    }));
  }
};