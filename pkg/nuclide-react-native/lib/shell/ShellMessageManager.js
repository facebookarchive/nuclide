'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShellMessageManager = undefined;

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const EXECUTOR_PORT = 8081; /**
                             * Copyright (c) 2015-present, Facebook, Inc.
                             * All rights reserved.
                             *
                             * This source code is licensed under the license found in the LICENSE file in
                             * the root directory of this source tree.
                             *
                             * 
                             * @format
                             */

const WS_URL = `ws://localhost:${EXECUTOR_PORT}/message?role=interface&name=Nuclide`;

class ShellMessageManager {

  constructor() {
    this._url = WS_URL;
  }

  send(message) {
    if (this._ws == null) {
      // Currently, use cases only require a simple fire-and-forget interaction
      const ws = new (_ws || _load_ws()).default(this._url);
      this._ws = ws;
      ws.onopen = () => {
        ws.send(JSON.stringify(message));
        ws.close();
      };
      ws.onerror = () => {
        atom.notifications.addWarning('Error connecting to React Native shell.');
      };
      ws.onclose = () => {
        this._ws = null;
      };
    }
  }
}
exports.ShellMessageManager = ShellMessageManager;