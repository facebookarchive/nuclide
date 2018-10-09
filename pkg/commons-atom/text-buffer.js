"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeBufferOpen = observeBufferOpen;
exports.observeBufferCloseOrRename = observeBufferCloseOrRename;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _event() {
  const data = require("../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
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
// Observes all buffer opens.
// Buffer renames are sent as an open of the new name.
function observeBufferOpen() {
  return (0, _event().observableFromSubscribeFunction)(cb => atom.project.observeBuffers(cb)).mergeMap(buffer => {
    const end = (0, _event().observableFromSubscribeFunction)(buffer.onDidDestroy.bind(buffer));
    const rename = (0, _event().observableFromSubscribeFunction)(buffer.onDidChangePath.bind(buffer)).map(() => buffer).takeUntil(end);
    return _RxMin.Observable.of(buffer).concat(rename);
  });
} // Note that on a rename, the openedPath will be the path of the buffer when the open was sent,
// which may not match the current name of the buffer.


// Fires a single event when the buffer is destroyed or renamed.
// Note that on a rename the buffer path will not be the same as the openedPath.
function observeBufferCloseOrRename(buffer) {
  const openedPath = buffer.getPath();
  const end = (0, _event().observableFromSubscribeFunction)(buffer.onDidDestroy.bind(buffer));
  const rename = (0, _event().observableFromSubscribeFunction)(buffer.onDidChangePath.bind(buffer));
  return end.merge(rename).take(1).map(() => ({
    kind: 'close',
    buffer,
    openedPath
  }));
}