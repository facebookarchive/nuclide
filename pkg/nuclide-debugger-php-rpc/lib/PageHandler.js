'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _helpers;

function _load_helpers() {
  return _helpers = require('./helpers');
}

var _Handler;

function _load_Handler() {
  return _Handler = _interopRequireDefault(require('./Handler'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Handles all 'Page.*' Chrome dev tools messages
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class PageHandler extends (_Handler || _load_Handler()).default {
  constructor(clientCallback) {
    super('Page', clientCallback);
  }

  handleMethod(id, method, params) {
    switch (method) {
      case 'canScreencast':
        this.replyToCommand(id, { result: false });
        break;

      case 'enable':
        this.replyToCommand(id, {});
        break;

      case 'getResourceTree':
        this.replyToCommand(id,
        // For now, return a dummy resource tree so various initializations in
        // client happens.
        {
          frameTree: {
            childFrames: [],
            resources: [],
            frame: {
              id: (_helpers || _load_helpers()).DUMMY_FRAME_ID,
              loaderId: 'Loader.0',
              mimeType: '',
              name: 'HHVM',
              securityOrigin: '',
              url: 'hhvm:///'
            }
          }
        });
        break;

      default:
        this.unknownMethod(id, method, params);
        break;
    }
    return Promise.resolve();
  }
}
exports.default = PageHandler;