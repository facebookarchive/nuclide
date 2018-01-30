'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _highlightText;

function _load_highlightText() {
  return _highlightText = _interopRequireDefault(require('nuclide-commons-ui/highlightText'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _nuclideTerminalUri;

function _load_nuclideTerminalUri() {
  return _nuclideTerminalUri = require('../../commons-node/nuclide-terminal-uri');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TerminalOmni2Provider {

  constructor(opts) {
    this.debounceDelay = 0;
    this.display = {
      title: 'Terminal',
      prompt: 'Run a terminal command...',
      action: 'terminal-omni2-provider:toggle-provider'
    };
    this.name = 'TerminalProvider';
    this.prefix = '!';
    this.priority = 10;

    this._getCwdApi = opts.getCwdApi;
  }

  executeQuery(query, queryContext, callback) {
    let results;
    if (query === '') {
      results = [{
        type: 'generic',
        primaryText: 'Enter a command to run in the terminal',
        relevance: 1
      }];
    } else {
      const cwdApi = this._getCwdApi();
      const cwd = cwdApi ? cwdApi.getCwd() : null;
      const cwdPath = cwd ? cwd.getPath() : (_nuclideUri || _load_nuclideUri()).default.expandHomeDir('~');
      results = [{
        type: 'generic',
        primaryText: (_highlightText || _load_highlightText()).default`Run ${query} in the terminal`,
        secondaryText: `at ${cwdPath}`,
        relevance: 1,
        callback: () => {
          (0, (_goToLocation || _load_goToLocation()).goToLocation)((0, (_nuclideTerminalUri || _load_nuclideTerminalUri()).uriFromInfo)({
            cwd: cwdPath,
            defaultLocation: 'bottom',
            icon: 'terminal',
            remainOnCleanExit: true,
            title: this.prefix + query,
            command: {
              file: '/bin/bash',
              args: ['-c', query]
            }
          }));
        }
      }];
    }

    callback(results);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }
}
exports.default = TerminalOmni2Provider; /**
                                          * Copyright (c) 2015-present, Facebook, Inc.
                                          * All rights reserved.
                                          *
                                          * This source code is licensed under the license found in the LICENSE file in
                                          * the root directory of this source tree.
                                          *
                                          * 
                                          * @format
                                          */