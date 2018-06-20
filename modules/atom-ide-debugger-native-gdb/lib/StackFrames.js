'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _HandleMap;

function _load_HandleMap() {
  return _HandleMap = _interopRequireDefault(require('./HandleMap'));
}

var _MIProxy;

function _load_MIProxy() {
  return _MIProxy = _interopRequireDefault(require('./MIProxy'));
}

var _vscodeDebugadapter;

function _load_vscodeDebugadapter() {
  return _vscodeDebugadapter = require('vscode-debugadapter');
}

var _MITypes;

function _load_MITypes() {
  return _MITypes = require('./MITypes');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

class StackFrames {

  constructor(client) {
    this._client = client;
    this._frames = new (_HandleMap || _load_HandleMap()).default();
    this._frameIdsByThreadAndLevel = new Map();
  }

  clearCachedFrames() {
    this._frames.clear();
    this._frameIdsByThreadAndLevel.clear();
  }

  stackFrameByHandle(handle) {
    return this._frames.getObjectByHandle(handle);
  }

  async stackFramesForThread(threadId, startFrame, levels) {
    const depthResult = await this._client.sendCommand(`stack-info-depth --thread ${threadId}`);
    if (!depthResult.done) {
      throw new Error(`Protocol error retrieving stack depth (${(0, (_MITypes || _load_MITypes()).toCommandError)(depthResult).msg})`);
    }

    const depth = parseInt((0, (_MITypes || _load_MITypes()).stackInfoDepthResult)(depthResult).depth, 10);

    const lowFrame = startFrame == null ? 0 : startFrame;
    const highFrame = (levels == null ? lowFrame + depth : lowFrame + levels) - 1;
    const command = `stack-list-frames --thread ${threadId} --no-frame-filters ${lowFrame} ${highFrame}`;
    const frameResult = await this._client.sendCommand(command);
    if (!frameResult.done) {
      throw new Error(`Protocol error retrieving stack frames (${(0, (_MITypes || _load_MITypes()).toCommandError)(frameResult).msg})`);
    }

    const frames = (0, (_MITypes || _load_MITypes()).stackListFramesResult)(frameResult);

    return {
      totalFrames: depth,
      stackFrames: frames.stack.map(_ => {
        const level = parseInt(_.frame.level, 10);
        return {
          id: this._handleForFrame(threadId, level),
          name: _.frame.func != null ? _.frame.func : _.frame.from != null ? _.frame.from : _.frame.addr,
          source: _.frame.file == null && _.frame.fullname == null ? undefined : {
            name: _.frame.file,
            path: _.frame.fullname
          },
          line: _.frame.line == null ? 0 : parseInt(_.frame.line, 10),
          column: 0,
          addr: _.frame.addr
        };
      })
    };
  }

  _handleForFrame(threadId, frameIndex) {
    let mapForThread = this._frameIdsByThreadAndLevel.get(threadId);
    if (mapForThread == null) {
      mapForThread = new Map();
      this._frameIdsByThreadAndLevel.set(threadId, mapForThread);
    }

    let frame = mapForThread.get(frameIndex);
    if (frame == null) {
      const cachedFrame = {
        threadId,
        frameIndex
      };
      frame = this._frames.put(cachedFrame);
      mapForThread.set(frameIndex, frame);
    }

    return frame;
  }
}
exports.default = StackFrames;