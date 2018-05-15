'use strict';var _createPackage;




















function _load_createPackage() {return _createPackage = _interopRequireDefault(require('../../../../nuclide-commons-atom/createPackage'));}var _CodeFormatManager;
function _load_CodeFormatManager() {return _CodeFormatManager = _interopRequireDefault(require('./CodeFormatManager'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                       * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                       * All rights reserved.
                                                                                                                                                                                                                       *
                                                                                                                                                                                                                       * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                       * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                       * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                       *
                                                                                                                                                                                                                       *  strict-local
                                                                                                                                                                                                                       * @format
                                                                                                                                                                                                                       */class Activation {constructor() {this.codeFormatManager = new (_CodeFormatManager || _load_CodeFormatManager()).default();}consumeLegacyProvider(provider) {// Legacy providers used `selector` / `inclusionPriority`.
    provider.grammarScopes =
    provider.grammarScopes || (
    provider.selector != null ? provider.selector.split(', ') : null);
    provider.priority =
    provider.priority != null ?
    provider.priority :
    // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
    provider.inclusionPriority != null ?
    provider.inclusionPriority :
    0;
    if (provider.formatCode) {
      return this.consumeRangeProvider(provider);
    } else if (provider.formatEntireFile) {
      return this.consumeFileProvider(provider);
    } else if (provider.formatAtPosition) {
      return this.consumeOnTypeProvider(provider);
    } else if (provider.formatOnSave) {
      return this.consumeOnSaveProvider(provider);
    }
    throw new Error('Invalid code format provider');
  }

  consumeRangeProvider(provider) {
    return this.codeFormatManager.addRangeProvider(provider);
  }

  consumeFileProvider(provider) {
    return this.codeFormatManager.addFileProvider(provider);
  }

  consumeOnTypeProvider(provider) {
    return this.codeFormatManager.addOnTypeProvider(provider);
  }

  consumeOnSaveProvider(provider) {
    return this.codeFormatManager.addOnSaveProvider(provider);
  }

  consumeBusySignal(busySignalService) {
    return this.codeFormatManager.consumeBusySignal(busySignalService);
  }

  dispose() {
    this.codeFormatManager.dispose();
  }}


(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);