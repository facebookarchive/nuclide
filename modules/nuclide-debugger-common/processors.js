'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.


















remoteToLocalProcessor = remoteToLocalProcessor;exports.



localToRemoteProcessor = localToRemoteProcessor;exports.






pathProcessor = pathProcessor;var _nuclideUri;function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('../nuclide-commons/nuclideUri'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function remoteToLocalProcessor() {return pathProcessor(path => (_nuclideUri || _load_nuclideUri()).default.getPath(path));} /**
                                                                                                                                                                                                                                                                                                                                                                                             * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                             * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                             * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                             * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                             * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                             * 
                                                                                                                                                                                                                                                                                                                                                                                             * @format
                                                                                                                                                                                                                                                                                                                                                                                             */function localToRemoteProcessor(targetUri) {const hostname = (_nuclideUri || _load_nuclideUri()).default.getHostname(targetUri);return pathProcessor(path => (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, path));}function pathProcessor(pathMapper) {return message => {processRequestsUris(message, pathMapper);processResponseUris(message, pathMapper);processEventsUris(message, pathMapper);};}function processRequestsUris(message, pathMapper) {if (message.type !== 'request') {return;
  }
  switch (message.command) {
    case 'setBreakpoints':
    case 'source':
      translateField(message, 'arguments.source.path', pathMapper);
      break;}

}

function processResponseUris(message, pathMapper) {
  if (message.type !== 'response') {
    return;
  }
  switch (message.command) {
    case 'setBreakpoints':
    case 'setFunctionBreakpoints':
      message.body.breakpoints.forEach(bp =>
      translateField(bp, 'source.path', pathMapper));

      break;
    case 'stackTrace':
      message.body.stackFrames.forEach(frame =>
      translateField(frame, 'source.path', pathMapper));

      break;
    case 'modules':
      message.body.modules.forEach(module =>
      translateField(module, 'path', pathMapper));

      break;
    case 'loadedSources':
      message.body.sources.forEach(source =>
      translateField(source, 'path', pathMapper));

      break;}

}

function processEventsUris(message, pathMapper) {
  if (message.type !== 'event') {
    return;
  }

  switch (message.event) {
    case 'output':
    case 'loadedSource':
      translateField(message, 'body.source.path', pathMapper);
      break;
    case 'breakpoint':
      translateField(message, 'body.breakpoint.source.path', pathMapper);
      break;
    case 'module':
      translateField(message, 'body.module.path', pathMapper);
      break;}

}

// Traverse the source `object` for a deeply nested field,
// then apply the `pathMapper` to that field, if existing.
function translateField(
object,
fieldDescriptor,
pathMapper)
{
  const fields = fieldDescriptor.split('.');
  let lastObj = {};
  const value = fields.reduce((child, field) => {
    if (child == null) {
      return null;
    } else {
      lastObj = child;
      return child[field];
    }
  }, object);
  if (value != null) {
    const [lastField] = fields.slice(-1);
    lastObj[lastField] = pathMapper(value);
  }
}