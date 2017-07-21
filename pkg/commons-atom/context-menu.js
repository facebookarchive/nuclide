'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.showMenuForEvent = showMenuForEvent;

var _electron = require('electron');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
* Shows the provided menu template. This will result in [an extra call to `templateForEvent()`][1],
* but it means that we still go through `showMenuForEvent()`, maintaining its behavior wrt
* (a)synchronousness. See atom/atom#13398.
*
* [1]: https://github.com/atom/atom/blob/v1.13.0/src/context-menu-manager.coffee#L200
*/
function showMenuForEvent(event, menuTemplate) {
  if (!(_electron.remote != null)) {
    throw new Error('Invariant violation: "remote != null"');
  }

  const win = _electron.remote.getCurrentWindow();
  const originalEmit = win.emit;
  const restore = () => {
    win.emit = originalEmit;
  };
  win.emit = (eventType, ...args) => {
    if (eventType !== 'context-menu') {
      return originalEmit(eventType, ...args);
    }
    const result = originalEmit('context-menu', menuTemplate);
    restore();
    return result;
  };
  atom.contextMenu.showForEvent(event);
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(restore);
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */