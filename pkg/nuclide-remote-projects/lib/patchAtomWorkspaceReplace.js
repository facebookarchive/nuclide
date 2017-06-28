'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = patchAtomWorkspaceReplace;

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *           |\___/|
 *          (,\  /,)\
 *          /     /  \
 *         (@_^_@)/   \
 *          W//W_/     \
 *        (//) |        \
 *      (/ /) _|_ /   )  \
 *    (// /) '/,_ _ _/  (~^-.
 *  (( // )) ,-{        _    `.
 * (( /// ))  '/\      /      |
 * (( ///))     `.   {       }
 *  ((/ ))    .----~-.\   \-'
 *           ///.----..>   \
 *            ///-._ _  _ _}
 *
 * Here be dragons! We should try to avoid monkey-patching when humanly possible.
 * This patches `atom.workspace.replace` with a remote-compatible version.
 * The right fix is probably to have Atom call `Directory.replace` or similar,
 * which we can then override in our custom `RemoteDirectory` implementation.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function patchAtomWorkspaceReplace() {
  const workspace = atom.workspace;
  const originalReplace = workspace.replace;

  workspace.replace = (regex, replacementText, filePaths, iterator) => {
    // Atom can handle local paths and opened buffers, so filter those out.
    const filePathSet = new Set(filePaths);
    const openBuffers = new Set(atom.project.getBuffers().map(buf => buf.getPath()).filter(Boolean));
    const unopenedRemotePaths = new Set(filePaths.filter(path => (_nuclideUri || _load_nuclideUri()).default.isRemote(path) && !openBuffers.has(path)));
    const regularReplace = unopenedRemotePaths.size === filePathSet.size ? Promise.resolve(null) : originalReplace.call(atom.workspace, regex, replacementText, Array.from((0, (_collection || _load_collection()).setDifference)(filePathSet, unopenedRemotePaths)), iterator);
    const remotePaths = new Map();
    for (const path of unopenedRemotePaths) {
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getGrepServiceByNuclideUri)(path);
      let list = remotePaths.get(service);
      if (list == null) {
        list = [];
        remotePaths.set(service, list);
      }
      list.push(path);
    }
    const promises = [regularReplace];
    remotePaths.forEach((paths, service) => {
      promises.push(service.grepReplace(paths, regex, replacementText).refCount().do(result => {
        if (result.type === 'error') {
          iterator(null, new Error(`${result.filePath}: ${result.message}`));
        } else {
          iterator(result);
        }
      }).toPromise().catch(err => {
        iterator(null, err);
      }));
    });
    return Promise.all(promises);
  };

  return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
    workspace.replace = originalReplace;
  });
}