function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var log = _utils2.default.log;

function translateMessageFromServer(hostname, port, message) {
  return translateMessage(message, function (uri) {
    return translateUriFromServer(hostname, port, uri);
  });
}

function translateMessageToServer(message) {
  return translateMessage(message, translateUriToServer);
}

function translateMessage(message, translateUri) {
  var obj = JSON.parse(message);
  var result = undefined;
  switch (obj.method) {
    case 'Debugger.scriptParsed':
      result = translateField(obj, 'params.url', translateUri);
      break;
    case 'Debugger.setBreakpointByUrl':
      result = translateField(obj, 'params.url', translateUri);
      break;
    case 'Debugger.getScriptSource':
      result = translateField(obj, 'params.scriptId', translateUri);
      break;
    default:
      result = obj;
      break;
  }
  return JSON.stringify(result);
}

function translateField(obj, field, translateUri) {
  var fields = field.split('.');
  var fieldName = fields[0];
  if (fields.length === 1) {
    obj[fieldName] = translateUri(obj[fieldName]);
  } else {
    obj[fieldName] = translateField(obj[fieldName], fields.slice(1).join('.'), translateUri);
  }
  return obj;
}

function translateUriFromServer(hostname, port, uri) {
  var components = _nuclideRemoteUri2.default.parse(uri);
  if (components.protocol === 'file:') {
    var result = _nuclideRemoteUri2.default.createRemoteUri(hostname, port, components.pathname);
    log('Translated URI from ' + uri + ' to ' + result);
    return result;
  } else {
    return uri;
  }
}

function translateUriToServer(uri) {
  if (_nuclideRemoteUri2.default.isRemote(uri)) {
    var result = _url2.default.format({
      protocol: 'file',
      slashes: true,
      pathname: _nuclideRemoteUri2.default.getPath(uri)
    });
    log('Translated URI from ' + uri + ' to ' + result);
    return result;
  } else {
    return uri;
  }
}

module.exports = {
  translateMessageFromServer: translateMessageFromServer,
  translateMessageToServer: translateMessageToServer
};