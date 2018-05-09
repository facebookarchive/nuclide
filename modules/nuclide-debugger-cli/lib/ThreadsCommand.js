'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}















class ThreadsCommand {






  constructor(con, debug) {this.name = 'threads';this.helpText = "List all of the target's threads.";
    this._console = con;
    this._debugger = debug;
  }

  execute() {var _this = this;return (0, _asyncToGenerator.default)(function* () {
      const threads = _this._debugger.getThreads();
      const focusThread = threads.focusThreadId;

      threads.allThreads.
      sort(function (left, right) {return left.id() - right.id();}).
      forEach(function (thread) {
        const activeMarker = thread.id() === focusThread ? '*' : ' ';
        _this._console.outputLine(
        `${activeMarker} ${thread.id()} ${thread.name() || ''}`);

      });})();
  }}exports.default = ThreadsCommand; /**
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