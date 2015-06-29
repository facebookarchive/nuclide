'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {fsPromise} = require('nuclide-commons');
var path = require('path');
var {USER} = require('nuclide-commons').env;

var LOG_FILE_PATH = `/tmp/nuclide-${USER}-logs/nuclide.log`;

var logDirectory = path.dirname(LOG_FILE_PATH);
var logDirectoryInitialized = false;

module.exports = {
  async getDefaultConfig(): Promise<any> {

    if (!logDirectoryInitialized) {
      await fsPromise.mkdirp(logDirectory);
      logDirectoryInitialized = true;
    }

    return {
      appenders: [
        {
          'type': 'logLevelFilter',
          'level': 'INFO',
          'appender': {
            type: path.join(__dirname, './consoleAppender'),
          },
        },
        {
          type: 'dateFile',
          alwaysIncludePattern: true,
          absolute: true,
          filename: LOG_FILE_PATH,
          pattern: '-yyyy-MM-dd',
        },
      ],
    };
  },

  LOG_FILE_PATH,
};
