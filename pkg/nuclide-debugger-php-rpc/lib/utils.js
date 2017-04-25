'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeExpressionHphpdCompatible = makeExpressionHphpdCompatible;

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

const DEBUGGER_LOGGER_CATEGORY = 'nuclide-debugger-php'; /**
                                                          * Copyright (c) 2015-present, Facebook, Inc.
                                                          * All rights reserved.
                                                          *
                                                          * This source code is licensed under the license found in the LICENSE file in
                                                          * the root directory of this source tree.
                                                          *
                                                          * 
                                                          */

exports.default = (0, (_nuclideLogging || _load_nuclideLogging()).getCategoryLogger)(DEBUGGER_LOGGER_CATEGORY);
function makeExpressionHphpdCompatible(params) {
  // Hphpd requires that '=' is prefixed to expressions, but xdebug doesn't require this, so
  // we remove leading '=' if necessary.
  const expr = params.expression;
  if (expr.startsWith('=')) {
    params.expression = expr.substring(1);
  }
  return params;
}