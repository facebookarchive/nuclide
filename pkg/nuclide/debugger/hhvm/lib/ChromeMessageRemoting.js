'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


const url = require('url');
const remoteUri = require('../../../remote-uri');
const {log} = require('./utils');

function translateMessageFromServer(hostname: string, port: number, message: string): string {
  return translateMessage(message, uri => translateUriFromServer(hostname, port, uri));
}

function translateMessageToServer(message: string): string {
  return translateMessage(message, translateUriToServer);
}

function translateMessage(message: string, translateUri: (uri: string) => string): string {
  const obj = JSON.parse(message);
  let result;
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

function translateField(obj: Object, field: string, translateUri: (uri: string) => string): mixed {
  const fields = field.split('.');
  const fieldName = fields[0];
  if (fields.length === 1) {
    obj[fieldName] = translateUri(obj[fieldName]);
  } else {
    obj[fieldName] = translateField(obj[fieldName], fields.slice(1).join('.'), translateUri);
  }
  return obj;
}

function translateUriFromServer(hostname: string, port: number, uri: string): string {
  const components = remoteUri.parse(uri);
  if (components.protocol === 'file:') {
    const result = remoteUri.createRemoteUri(hostname, port, components.pathname);
    log(`Translated URI from ${uri} to ${result}`);
    return result;
  } else {
    return uri;
  }
}

function translateUriToServer(uri: string): string {
  if (remoteUri.isRemote(uri)) {
    const result = url.format({
      protocol: 'file',
      slashes: true,
      pathname: remoteUri.getPath(uri),
    });
    log(`Translated URI from ${uri} to ${result}`);
    return result;
  } else {
    return uri;
  }
}

module.exports = {
  translateMessageFromServer,
  translateMessageToServer,
};
