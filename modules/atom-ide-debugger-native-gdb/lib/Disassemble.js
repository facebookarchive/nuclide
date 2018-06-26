'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bigInteger;

function _load_bigInteger() {
  return _bigInteger = _interopRequireDefault(require('big-integer'));
}

var _MITypes;

function _load_MITypes() {
  return _MITypes = require('./MITypes');
}

var _HandleMap;

function _load_HandleMap() {
  return _HandleMap = _interopRequireDefault(require('./HandleMap'));
}

var _MIProxy;

function _load_MIProxy() {
  return _MIProxy = _interopRequireDefault(require('./MIProxy'));
}

var _StackFrames;

function _load_StackFrames() {
  return _StackFrames = _interopRequireDefault(require('./StackFrames'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Disassemble {

  constructor(client, stackFrames) {
    this._client = client;
    this._stackFrames = stackFrames;
    this._handleMap = new (_HandleMap || _load_HandleMap()).default();
    this._sourceRefByStackFrameHandle = new Map();
  }

  sourceReferenceForStackFrame(stackFrameHandle) {
    let handle = this._sourceRefByStackFrameHandle.get(stackFrameHandle);
    if (handle == null) {
      const sourceRef = { stackFrameHandle, startingPoint: undefined };
      handle = this._handleMap.put(sourceRef);
      this._sourceRefByStackFrameHandle.set(stackFrameHandle, handle);
    }

    return handle;
  }

  async getDisassembly(sourceRef) {
    const source = this._handleMap.getObjectByHandle(sourceRef);
    if (source == null) {
      throw new Error(`Invalid source reference ${sourceRef}`);
    }

    let startingAddress = source.startingPoint;
    if (startingAddress == null) {
      source.startingPoint = await this._getFrameAddress(source.stackFrameHandle);
      startingAddress = source.startingPoint;
    }

    const hexPattern = /^0x([0-9a-fA-F]+)$/;
    const match = startingAddress.match(hexPattern);
    if (match == null) {
      throw new Error(`Failed to disassemble because value ${startingAddress} is not a valid hex address`);
    }

    const start = (0, (_bigInteger || _load_bigInteger()).default)(match[1], 16);

    // $TODO find a good balance between useful and performant. For now
    // just disassemble 4k worth of code, which is a fair bit but still comes
    // back quickly
    const end = start.add(4096);

    const command = `data-disassemble -s 0x${start.toString(16)} -e 0x${end.toString(16)} -- 0`;

    const response = await this._client.sendCommand(command);
    if (!response.done) {
      throw new Error(`Failed to disassemble for source handle ${sourceRef}`);
    }

    const instructions = (0, (_MITypes || _load_MITypes()).dataDisassembleResult)(response);

    return instructions.asm_insns.map(_ => `${_.address} ${_.inst}`).join('\n');
  }

  async _getFrameAddress(stackFrameHandle) {
    const frameRef = this._stackFrames.stackFrameByHandle(stackFrameHandle);
    if (frameRef == null) {
      throw new Error(`Could not discover stack frame handle ${stackFrameHandle} for disassembly`);
    }

    const frames = await this._stackFrames.stackFramesForThread(frameRef.threadId, frameRef.frameIndex, 1);

    const frame = frames.stackFrames[0];
    if (frame == null || frame.addr == null) {
      throw new Error(`Could not retrieve stack frame for handle ${stackFrameHandle} for disassembly`);
    }

    return frame.addr;
  }
}
exports.default = Disassemble; /**
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