'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

//------------------------------------------------------------------------------
// NodeTranspiler is a wrapper around babel with:
//  * Nuclide specific configuration, that must be shared among several
//    independent transpile systems.
//  * Lazy-loading of expensive libs like babel.
//  * Support for externally loaded babel.
//------------------------------------------------------------------------------

/*eslint-disable no-console*/
/*eslint-disable prefer-object-spread/prefer-object-spread*/

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PREFIXES = ["'use babel'", '"use babel"', '/* @flow */', '/** @babel */'];
const PREFIX_LENGTH = Math.max(...PREFIXES.map(x => x.length));

// Atom defaults: https://github.com/atom/atom/blob/v1.6.2/static/babelrc.json
// {
//   "breakConfig": true,
//   "sourceMap": "inline",
//   "blacklist": ["es6.forOf", "useStrict"],
//   "optional": ["asyncToGenerator"],
//   "stage": 0
// }

const BABEL_OPTIONS = {
  breakConfig: true,
  // sourceMap: 'inline',
  blacklist: [
    'es3.memberExpressionLiterals',
    'es6.forOf',
    'useStrict',
  ],
  optional: [
    'asyncToGenerator',
  ],
  // TODO(asuarez): Improve perf by explicitly running only the transforms we use.
  stage: 1,
  plugins: [
    require.resolve('./remove-use-babel-tr'),
    require.resolve('./use-minified-libs-tr'),
    require.resolve('./inline-imports-tr'),
  ],
  // comments: false,
  // compact: true,
  // externalHelpers: true,
  // loose: [
  //   'es6.classes',
  //   'es6.destructuring',
  //   'es6.forOf',
  //   'es6.modules',
  //   'es6.properties.computed',
  //   'es6.spread',
  //   'es6.templateLiterals',
  // ],
};

class NodeTranspiler {

  static shouldCompile(bufferOrString) {
    const start = bufferOrString.slice(0, PREFIX_LENGTH).toString();
    return PREFIXES.some(prefix => start.startsWith(prefix));
  }

  constructor(babelVersion, getBabel) {
    if (babelVersion) {
      assert(typeof babelVersion === 'string');
      assert(typeof getBabel === 'function');
      this._babelVersion = babelVersion;
      this._getBabel = getBabel;
    } else {
      this._babelVersion = require('babel-core/package.json').version;
      this._getBabel = () => require('babel-core');
    }
    this._babel = null;
    this._cacheDir = null;
    this._configDigest = null;
  }

  getConfigDigest() {
    if (!this._configDigest) {
      // Keep the digest consistent regardless of what directory we're in.
      const optsOnly = Object.assign({}, BABEL_OPTIONS, {plugins: null});
      const hash = crypto
        .createHash('sha1')
        .update('babel-core', 'utf8')
        .update('\0', 'utf8')
        .update(this._babelVersion, 'utf8')
        .update('\0', 'utf8')
        .update(JSON.stringify(optsOnly), 'utf8');
      // The source of this file and that of plugins is used as part of the
      // hash as a way to version our transforms.
      [__filename]
        .concat(BABEL_OPTIONS.plugins)
        .filter(Boolean)
        .forEach(pluginFile => {
          hash
            .update(fs.readFileSync(pluginFile))
            .update('\0', 'utf8');
        });
      this._configDigest = hash.digest('hex');
    }
    return this._configDigest;
  }

  transform(src, filename) {
    if (!this._babel) {
      this._babel = this._getBabel();
    }
    try {
      const input = Buffer.isBuffer(src) ? src.toString() : src;
      const output = this._babel.transform(input, BABEL_OPTIONS).code;
      return output;
    } catch (err) {
      console.error(`Error transpiling "${filename}"`);
      throw err;
    }
  }

  transformWithCache(src, filename) {
    const cacheFilename = this._getCacheFilename(src);

    if (fs.existsSync(cacheFilename)) {
      const cached = fs.readFileSync(cacheFilename, 'utf8');
      return cached;
    }

    const output = this.transform(src, filename);
    this._cacheWriteSync(cacheFilename, output);

    return output;
  }

  _getCacheFilename(src) {
    const fileDigest = crypto
      .createHash('sha1')
      // Buffers are fast, but strings work too.
      .update(src, Buffer.isBuffer(src) ? undefined : 'utf8')
      .digest('hex');

    if (!this._cacheDir) {
      this._cacheDir = path.join(
        os.tmpdir(),
        'nuclide-node-transpiler',
        this.getConfigDigest()
      );
    }

    const cacheFilename = path.join(this._cacheDir, fileDigest + '.js');
    return cacheFilename;
  }

  _cacheWriteSync(cacheFilename, src) {
    // Write the file to a temp file first and then move it so the write to the
    // cache is atomic. Although Node is single-threaded, there could be
    // multiple Node processes running simultaneously that are using the cache.

    const mkdirp = require('mkdirp');
    const uuid = require('uuid');

    const basedir = path.dirname(cacheFilename);
    const tmpName = path.join(basedir, '.' + uuid.v4());

    try {
      mkdirp.sync(basedir);
    } catch (err) {
      console.error(`Cache mkdirp failed. ${err}`);
      return;
    }

    try {
      fs.writeFileSync(tmpName, src);
      fs.renameSync(tmpName, cacheFilename);
    } catch (err) {
      console.error(`Cache write failed. ${err}`);
      try { fs.unlinkSync(tmpName); } catch (err_) {}
    }
  }
}

module.exports = NodeTranspiler;
