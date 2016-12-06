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

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class AutocompleteCacher {

  constructor(config) {
    this._config = config;
  }

  getSuggestions(request) {
    const session = this._session;
    if (session != null && canFilterResults(session, request)) {
      const result = this._filterSuggestions(request, session.firstResult);
      this._session = {
        firstResult: session.firstResult,
        lastRequest: request
      };
      return result;
    } else {
      const result = this._config.getSuggestions(request);
      this._session = {
        firstResult: result,
        lastRequest: request
      };
      return result;
    }
  }

  _filterSuggestions(request, firstResult) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this._config.updateResults(request, (yield firstResult));
    })();
  }
}

exports.default = AutocompleteCacher; // TODO make this configurable per language

const IDENTIFIER_CHAR_REGEX = /[a-zA-Z_]/;

function canFilterResults(session, request) {
  const { lastRequest } = session;
  return lastRequest.bufferPosition.row === request.bufferPosition.row && lastRequest.bufferPosition.column + 1 === request.bufferPosition.column && request.prefix.startsWith(lastRequest.prefix) && IDENTIFIER_CHAR_REGEX.test(request.prefix.charAt(request.prefix.length - 1));
}
module.exports = exports['default'];