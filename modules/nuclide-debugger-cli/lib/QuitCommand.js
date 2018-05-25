'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class QuitCommand {

  constructor(quit) {
    this.name = 'quit';
    this.helpText = 'Exit the debugger.';

    this.quit = quit;
  }

  async execute() {
    this.quit();
  }
}
exports.default = QuitCommand; /**
                                * Copyright (c) 2017-present, Facebook, Inc.
                                * All rights reserved.
                                *
                                * This source code is licensed under the BSD-style license found in the
                                * LICENSE file in the root directory of this source tree. An additional grant
                                * of patent rights can be found in the PATENTS file in the same directory.
                                *
                                *  strict
                                * @format
                                */