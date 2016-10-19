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

exports.observeBuffers = observeBuffers;
exports.observeBufferOpen = observeBufferOpen;

// Note that on a rename, the openedPath will be the path of the buffer when the open was sent,
// which may not match the current name of the buffer.
exports.observeBufferCloseOrRename = observeBufferCloseOrRename;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../commons-node/nuclideUri'));
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _commonsNodeEvent;

function _load_commonsNodeEvent() {
  return _commonsNodeEvent = require('../commons-node/event');
}

// Once https://github.com/atom/atom/pull/12501 is released, switch to
// `atom.project.observeBuffers`.

function observeBuffers(observeBuffer) {
  atom.project.getBuffers().filter(function (buffer) {
    return !(_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isBrokenDeserializedUri(buffer.getPath());
  }).forEach(observeBuffer);
  return atom.project.onDidAddBuffer(function (buffer) {
    if (!(_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isBrokenDeserializedUri(buffer.getPath())) {
      observeBuffer(buffer);
    }
  });
}

// Observes all buffer opens.
// Buffer renames are sent as an open of the new name.

function observeBufferOpen() {
  return (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(observeBuffers).mergeMap(function (buffer) {
    var end = (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(buffer.onDidDestroy.bind(buffer));
    var rename = (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(buffer.onDidChangePath.bind(buffer)).map(function () {
      return buffer;
    }).takeUntil(end);
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(buffer).concat(rename);
  });
}

// Fires a single event when the buffer is destroyed or renamed.
// Note that on a rename the buffer path will not be the same as the openedPath.

function observeBufferCloseOrRename(buffer) {
  var openedPath = buffer.getPath();
  var end = (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(buffer.onDidDestroy.bind(buffer));
  var rename = (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(buffer.onDidChangePath.bind(buffer));
  return end.merge(rename).take(1).map(function () {
    return { kind: 'close', buffer: buffer, openedPath: openedPath };
  });
}