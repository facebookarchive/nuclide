"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

/**
 * This service allows other packages to search JS symbols using language service
 */
class JSSymbolSearchProvider {
  constructor(languageService) {
    this._languageService = languageService;
  }

  async searchJSSymbol(query, directoryUri) {
    const uriLanguageService = await this._languageService.getLanguageServiceForUri(directoryUri);
    return uriLanguageService ? uriLanguageService.symbolSearch(query, [directoryUri]) : null;
  }

}

exports.default = JSSymbolSearchProvider;