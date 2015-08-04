'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {EventEmitter} = require('events');
var {fsPromise} = require('nuclide-commons');
var {services: watcherServices} = require('nuclide-server/lib/services/NuclideWatcherService');
var {
  '/watcher/watchFile': watchFile,
  '/watcher/watchDirectory': watchDirectory,
  '/watcher/watchDirectoryRecursive': watchDirectoryRecursive,
  '/watcher/unwatchFile': unwatchFile,
  '/watcher/unwatchDirectory': unwatchDirectory,
  '/watcher/unwatchDirectoryRecursive': unwatchDirectoryRecursive
} = watcherServices;

/*
 * Match the signature of `NuclideClient::newFile`:
 *
 *     newFile(path: string): Promise<boolean>
 */
fsPromise.newFile = async function(path) {
  return true;
};

var eventbus = new EventEmitter();
var eventEmitter;
var serverApi = {
  registerEventEmitter: (_eventEmitter) => {
    eventEmitter = _eventEmitter;
  },
  publish: eventbus.emit.bind(eventbus),
};

fsPromise.watchFile = async function(...args) {
  await watchFile.handler.apply(serverApi, args);
  return eventEmitter;
};

fsPromise.watchDirectory = async function(...args) {
  await watchDirectory.handler.apply(serverApi, args);
  return eventEmitter;
};

fsPromise.watchDirectoryRecursive = async (directoryPath, handler) => {
  var channel = 'watch' + directoryPath;
  if (handler) {
    eventbus.on(channel, handler);
  }
  await watchDirectoryRecursive.handler.call(serverApi, directoryPath, channel);
};

fsPromise.unwatchFile = unwatchFile.handler;
fsPromise.unwatchDirectory = unwatchDirectory.handler;
fsPromise.unwatchDirectoryRecursive = unwatchDirectoryRecursive.handler;

module.exports = {
  getClient: () => fsPromise,
};
