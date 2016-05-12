

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function notifyLocalDiskFile(fileUri) {
  atom.notifications.addInfo('File `' + fileUri + '` exists on the local filesystem.');
}

function notifyConnectedRemoteFile(fileUri) {
  var hostname = require('../../nuclide-remote-uri').getHostname(fileUri);
  atom.notifications.addInfo('The connection to the server: `' + hostname + '` is healthy.');
}

function notifyDisconnectedRemoteFile(fileUri) {
  var hostname = require('../../nuclide-remote-uri').getHostname(fileUri);
  atom.notifications.addError('The connection to the server: `' + hostname + '` is lost, retrying in the background!');
}

module.exports = {
  notifyLocalDiskFile: notifyLocalDiskFile,
  notifyConnectedRemoteFile: notifyConnectedRemoteFile,
  notifyDisconnectedRemoteFile: notifyDisconnectedRemoteFile
};