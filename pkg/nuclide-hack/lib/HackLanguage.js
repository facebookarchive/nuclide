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

var getHackLanguageForUri = _asyncToGenerator(function* (uri) {
  var result = connectionToHackLanguage.getForUri(uri);
  return result == null ? null : (yield result);
});

exports.getHackLanguageForUri = getHackLanguageForUri;
exports.clearHackLanguageCache = clearHackLanguageCache;

var isFileInHackProject = _asyncToGenerator(function* (fileUri) {
  var language = yield getHackLanguageForUri(fileUri);
  if (language == null) {
    return false;
  }
  return yield language.isFileInProject(fileUri);
});

exports.isFileInHackProject = isFileInHackProject;
exports.observeHackLanguages = observeHackLanguages;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var HACK_SERVICE_NAME = 'HackService';

var connectionToHackLanguage = new (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ConnectionCache(_asyncToGenerator(function* (connection) {
  var hackService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByConnection)(HACK_SERVICE_NAME, connection);
  var config = (0, (_config || _load_config()).getConfig)();
  var useIdeConnection = config.useIdeConnection;
  // TODO:     || (await passesGK('nuclide_hack_use_persistent_connection'));
  var fileNotifier = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection);
  var languageService = yield hackService.initialize(config.hhClientPath, useIdeConnection, config.logLevel, fileNotifier);

  return languageService;
}));

function clearHackLanguageCache() {
  connectionToHackLanguage.dispose();
}

function observeHackLanguages() {
  return connectionToHackLanguage.observeValues().switchMap(function (hackLanguage) {
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise(hackLanguage);
  });
}