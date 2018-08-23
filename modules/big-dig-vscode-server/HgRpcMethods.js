"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HgRpcMethods = void 0;

function proto() {
  const data = _interopRequireWildcard(require("./Protocol.js"));

  proto = function () {
    return data;
  };

  return data;
}

var pathModule = _interopRequireWildcard(require("path"));

function _fs() {
  const data = _interopRequireDefault(require("../big-dig/src/common/fs"));

  _fs = function () {
    return data;
  };

  return data;
}

function _shallowequal() {
  const data = _interopRequireDefault(require("shallowequal"));

  _shallowequal = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _process() {
  const data = require("../nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
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

/**
 * This class provides RPC methods for talking to Hg that should be sufficient
 * to support basic SCM integration in an editor. Of note, it publishes changes
 * to `hg status` as a stream.
 */
class HgRpcMethods {
  constructor(watcher) {
    this._watcher = watcher;
  }

  register(registrar) {
    registrar.registerFun('hg/is-repo', this.isHgRepo.bind(this));
    registrar.registerObservable('hg/status', this.observeStatus.bind(this));
    registrar.registerFun('hg/get-contents', this.getHgGetContents.bind(this));
  }
  /** @return whether the specified directory is part of an Hg repo. */


  async isHgRepo(params) {
    const dir = await _fs().default.findNearestDir('.hg', params.directory);
    const root = dir != null ? pathModule.dirname(dir) : null;
    return {
      root
    };
  }
  /**
   * Produce a stream of `hg status` changes by re-running `hg status` every
   * time Watchman notifies us about a file change. Only notify the observer if
   * the result is different from the previous value that was broadcast.
   */


  observeStatus(params) {
    const {
      root
    } = params; // Should we memoize the result of this function (based on the root)?

    return _RxMin.Observable.defer(() => getHgStatusWatchmanSubscription(root, this._watcher)).switchMap(watchmanSubscription => _RxMin.Observable.fromEvent(watchmanSubscription, 'change')) // We start our Observable with a dummy value so that we trigger a
    // an initial proto.HgObserveStatusData to be dispatched upon connection.
    .startWith(null).switchMap(() => getStatus(root)).distinctUntilChanged((oldStatus, newStatus) => (0, _shallowequal().default)(oldStatus.status, newStatus.status));
  }

  async getHgGetContents(params) {
    const {
      path,
      ref
    } = params;
    const args = ['cat'];

    if (ref !== '') {
      args.push('-r', ref);
    }

    args.push(path);
    let contents;

    try {
      // We don't bother to try to find the root of the repo to use as the cwd:
      // we just use the parent of the path whose contents we are trying to
      // find, which should be sufficient.
      contents = await (0, _process().runCommand)('hg', args, {
        cwd: pathModule.dirname(path),
        env: createEnvWithHgPlain()
      }).toPromise();
    } catch (e) {
      // It is possible that path is untracked or there was a more serious error
      // (e.g., the specified path is not part of an Hg repository). In either
      // case, we return the empty string.
      contents = '';
    }

    return {
      contents
    };
  }

  dispose() {// TODO(mbolin): Remove any subscriptions to Watchman that were made.
  }

}
/**
 * @return a WatchmanSubscription that fires change events that might indicate
 *   that the output of `hg status` has changed. Note that not all change events
 *   will correspond to a change in `hg status`, but our primary concern is
 *   missing an `hg status` change.
 */


exports.HgRpcMethods = HgRpcMethods;

function getHgStatusWatchmanSubscription(root, watcher) {
  const watchmanName = 'big-dig-hg-status-change:' + root;
  return watcher.watchDirectoryRecursive(root, watchmanName, {
    // This expression may look a little intimidating. It should fire a change
    // event when *either* of the following happen:
    // 1. A file outside of the .hg/ folder changes. (We also try to exclude
    //    temp files written by Mercurial outside of the .hg/ folder.)
    // 2. The .hg/dirstate file changes.
    expression: ['anyof', ['allof', ['not', ['dirname', '.hg']], // Hg appears to modify temporary files that begin with these
    // prefixes every time a file is saved.
    ['not', ['match', 'hg-checkexec-*', 'wholename']], ['not', ['match', 'hg-checklink-*', 'wholename']], // This watchman subscription is used to determine when and which
    // files to fetch new statuses for. There is no reason to include
    // directories in these updates, and in fact they may make us overfetch
    // statuses. (See diff summary of D2021498.)
    // This line restricts this subscription to only return files.
    ['type', 'f']], // Commands like `hg add` that have the side-effect of changing the result
    // of `hg status` have the side-effect of writing the .hg/dirstate file,
    // so watching this file is a useful heuristic for detecting changes to
    // `hg status`.
    ['name', '.hg/dirstate', 'wholename']],
    defer: ['hg.update'],
    empty_on_fresh_instance: true
  });
}
/**
 * @return Observable that represents running `hg status` one time. We return an
 *   Observable rather than a Promise so it can be cancelled via unsubscribe().
 */


function getStatus(root) {
  // Note that --print0 would probably be slightly more efficient, but -Tjson
  // is easier to deal with here.
  return (0, _process().runCommand)('hg', ['status', '-mardu', '-Tjson'], {
    cwd: root,
    env: createEnvWithHgPlain()
  }).map(json => {
    const status = {};

    for (const _ref of JSON.parse(json)) {
      const {
        path,
        status: code
      } = _ref;
      status[path] = code;
    }

    return {
      status
    };
  });
}

function createEnvWithHgPlain() {
  return Object.assign({}, process.env, {
    HGPLAIN: '1'
  });
}