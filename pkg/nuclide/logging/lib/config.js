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

var LOGGER_CATEGORY = 'nuclide';
var LOG_FILE_PATH = '/tmp/nuclide-logs/nuclide.log';

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
          type: 'file',
          absolute: true,
          filename: LOG_FILE_PATH,
          category: LOGGER_CATEGORY,
          maxLogSize: 5 * 1024 * 1024, // 5 MB
          backups: 10,
        },
      ],
    };
  },

  LOG_FILE_PATH,
};
