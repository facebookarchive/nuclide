function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _url;

function _load_url() {
  return _url = _interopRequireDefault(require('url'));
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var log = (_utils || _load_utils()).default.log;

function translateMessageFromServer(hostname, message) {
  return translateMessage(message, function (uri) {
    return translateUriFromServer(hostname, uri);
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

function translateUriFromServer(hostname, uri) {
  var components = (_url || _load_url()).default.parse(uri);
  if (components.protocol === 'file:') {
    (0, (_assert || _load_assert()).default)(components.pathname);
    var result = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.createRemoteUri(hostname, decodeURI(components.pathname));
    log('Translated URI from ' + uri + ' to ' + result);
    return result;
  } else {
    return uri;
  }
}

function translateUriToServer(uri) {
  if ((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isRemote(uri)) {
    var result = (_url || _load_url()).default.format({
      protocol: 'file',
      slashes: true,
      pathname: (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getPath(uri)
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