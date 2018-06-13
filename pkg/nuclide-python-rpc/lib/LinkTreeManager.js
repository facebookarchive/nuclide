'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _memoize2;

function _load_memoize() {
  return _memoize2 = _interopRequireDefault(require('lodash/memoize'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideBuckRpc;

function _load_nuclideBuckRpc() {
  return _nuclideBuckRpc = _interopRequireWildcard(require('../../nuclide-buck-rpc'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const BUCK_GEN_PATH = 'buck-out/gen'; /**
                                       * Copyright (c) 2015-present, Facebook, Inc.
                                       * All rights reserved.
                                       *
                                       * This source code is licensed under the license found in the LICENSE file in
                                       * the root directory of this source tree.
                                       *
                                       *  strict-local
                                       * @format
                                       */

const FILENAME_BLACKLIST = [
// These are treated as Python files but obviously they don't have linktrees.
'BUCK', 'TARGETS'];
const LINK_TREE_SUFFIXES = Object.freeze({
  python_binary: '#link-tree',
  python_test: '#binary,link-tree'
});

const logger = (0, (_log4js || _load_log4js()).getLogger)('LinkTreeManager');

class LinkTreeManager {
  constructor() {
    this.getBuckRoot = (0, (_memoize2 || _load_memoize()).default)(src => {
      return (_nuclideBuckRpc || _load_nuclideBuckRpc()).getRootForPath(src);
    });
    this.getOwner = (0, (_memoize2 || _load_memoize()).default)(async src => {
      const buckRoot = await this.getBuckRoot(src);
      if (buckRoot == null) {
        return null;
      }
      const owners = await (_nuclideBuckRpc || _load_nuclideBuckRpc()).getOwners(buckRoot, src, []).catch(err => {
        logger.error(`Failed to get Buck owner for ${src}`, err);
        return [];
      });
      return owners.length > 0 ? owners[0] : null;
    });
    this.getDependents = (0, (_memoize2 || _load_memoize()).default)(async (buckRoot, target) => {
      try {
        /**
         * Buck 'rdeps' has a pretty slow implementation:
         * it crawls all transitive deps of the first argument looking for the second.
         * Without a more efficient solution we'll just crawl the surrounding targets.
         * e.g. the universe for //a:b will just be //a/...
         */
        const targetDir = target.substr(0, target.indexOf(':'));
        const universe = targetDir + '/...';
        // Quote kinds - the kind() operator takes a string.
        const kinds = JSON.stringify(Object.keys(LINK_TREE_SUFFIXES).join('|'));
        const dependents = await (_nuclideBuckRpc || _load_nuclideBuckRpc()).queryWithAttributes(buckRoot, `kind(${kinds}, rdeps(${universe}, ${target}))`, ['buck.type', 'deps']);
        // Python binaries/unit tests often come with many 'helper targets'.
        // (e.g. a binary might have a version built for ipython use).
        // We'll restrict ourselves to only using the top level targets.
        const nonToplevel = new Set();
        (0, (_collection || _load_collection()).objectValues)(dependents).forEach(attrs => {
          if (Array.isArray(attrs.deps)) {
            attrs.deps.forEach(dep => {
              if (typeof dep !== 'string') {
                return;
              }
              // Resolve relative dependencies, e.g. :dep
              const resolvedDep = dep.startsWith(':') ? targetDir + dep : dep;
              nonToplevel.add(resolvedDep);
            });
          }
        });
        return new Map((0, (_collection || _load_collection()).objectEntries)(dependents).filter(([dep]) => !nonToplevel.has(dep)).map(([dep, attrs]) => {
          const buckType = String(attrs['buck.type']);

          if (!LINK_TREE_SUFFIXES.hasOwnProperty(buckType)) {
            throw new Error('got invalid buck.type');
          }

          return [dep, buckType];
        }));
      } catch (err) {
        logger.error(`Failed to get dependents of target ${target}`, err);
        return new Map();
      }
    }, (buckRoot, target) => `${buckRoot}/${target}`);
    this.getLinkTreePaths = (0, (_memoize2 || _load_memoize()).default)(async src => {
      const basename = (_nuclideUri || _load_nuclideUri()).default.basename(src);
      if (FILENAME_BLACKLIST.includes(basename)) {
        return [];
      }

      const buckRoot = await this.getBuckRoot(src);
      if (buckRoot == null) {
        return [];
      }

      return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('python.link-tree', async () => {
        const owner = await this.getOwner(src);
        if (owner == null) {
          return [];
        }
        const dependents = await this.getDependents(buckRoot, owner);
        const paths = Array.from(dependents).map(([target, kind]) => {
          const linkTreeSuffix = LINK_TREE_SUFFIXES[kind];
          // Turn //test/target:a into test/target/a.
          const binPath = target.substr(2).replace(':', '/');
          return (_nuclideUri || _load_nuclideUri()).default.join(buckRoot, BUCK_GEN_PATH, binPath + linkTreeSuffix);
        });
        logger.info(`Resolved link trees for ${src}`, paths);
        return paths;
      }, { src });
    });
  }

  /**
   * For a given file, attempts to find python_binary/python_unittest dependents.
   * Returns a mapping of target -> target type.
   */


}
exports.default = LinkTreeManager;