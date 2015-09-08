'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {fsPromise, systemInfo} = require('nuclide-commons');
var os = require('os');
var path = require('path');
var {USER} = require('nuclide-commons').env;

if (systemInfo.isRunningInWindows()) {
  var LOG_FILE_PATH = path.join(os.tmpdir(), `/nuclide-${USER}-logs/nuclide.log`);
} else {
  var LOG_FILE_PATH = `/tmp/nuclide-${USER}-logs/nuclide.log`;
}

var logDirectory = path.dirname(LOG_FILE_PATH);
var logDirectoryInitialized = false;
var scribeAppenderPath = path.join(__dirname, '../fb/scribeAppender.js');

async function getServerLogAppenderConfig(): Promise<?Object> {
  // Skip if we are running in Atom or open source version of Nuclide.
  if (global.atom || !(await fsPromise.exists(scribeAppenderPath))) {
    return null;
  }

  return {
    type: 'logLevelFilter',
    level: 'DEBUG',
    appender: {
      type: scribeAppenderPath,
      scribeCategory: 'errorlog_arsenal',
    },
  };
}

module.exports = {
  async getDefaultConfig(): Promise<mixed> {

    if (!logDirectoryInitialized) {
      await fsPromise.mkdirp(logDirectory);
      logDirectoryInitialized = true;
    }

    var config = {
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

    var serverLogAppenderConfig = await getServerLogAppenderConfig();
    if (serverLogAppenderConfig) {
      config.appenders.push(serverLogAppenderConfig);
    }

    return config;
  },

  LOG_FILE_PATH,
};
