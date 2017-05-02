'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PerConnectionLanguageService = undefined;

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _process;

function _load_process() {
  return _process = require('./process');
}

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

var _process2;

function _load_process2() {
  return _process2 = require('../../commons-node/process');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class PerConnectionLanguageService extends (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).MultiProjectLanguageService {
  constructor(logger, fileCache, command, args, projectFileName, fileExtensions) {
    const languageServiceFactory = projectDir => {
      return (_process || _load_process()).LanguageServerProtocolProcess.create(logger, fileCache, () => {
        logger.logInfo(`PerConnectionLanguageService launch: ${command} ${args.join(' ')}`);
        // TODO: This should be cancelable/killable.
        const processStream = (0, (_process2 || _load_process2()).spawn)(command, args).publish(); // TODO: current dir?
        const processPromise = processStream.take(1).toPromise();
        processStream.connect();
        return processPromise;
      }, projectDir, fileExtensions);
    };
    super(logger, fileCache, projectFileName, fileExtensions, languageServiceFactory);
  }
}
exports.PerConnectionLanguageService = PerConnectionLanguageService;