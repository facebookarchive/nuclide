'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This service allows other packages to search JS symbols using language service
 */
class JSSymbolSearchProvider {

  constructor(languageService) {
    this._languageService = languageService;
  }

  searchJSSymbol(query, directoryUri) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const uriLanguageService = yield _this._languageService.getLanguageServiceForUri(directoryUri);
      return uriLanguageService ? uriLanguageService.symbolSearch(query, [directoryUri]) : null;
    })();
  }
}
exports.default = JSSymbolSearchProvider; /**
                                           * Copyright (c) 2015-present, Facebook, Inc.
                                           * All rights reserved.
                                           *
                                           * This source code is licensed under the license found in the LICENSE file in
                                           * the root directory of this source tree.
                                           *
                                           * 
                                           * @format
                                           */