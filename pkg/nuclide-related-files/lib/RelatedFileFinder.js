'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Finds related files, to be used in `JumpToRelatedFile`.
 *
 * Files are related if they have the same filename but different extension,
 * or if the filename is appended with `Internal` or `-inl`. For example, these files
 * would all be related: `Foo.h`, `Foo.m`, `FooInternal.h`, `Foo-inl.h`
 *
 * For now, we only search in the given path's directory for related files.
 */
let RelatedFileFinder = class RelatedFileFinder {
  /**
   * Returns the related files and the given file's index in that array.
   * The given file must be in the related files array.
   * @param filePath The filepath for which to get related files.
   * @param fileTypeWhiteList the set of file types that we are looking for;
   *      If this set is empty, all file types will be listed; the original
   *      filePath should always be in the result
   * @return The related files and the given path's index into it.
   */
  static find(filePath) {
    var _arguments = arguments;
    return (0, _asyncToGenerator.default)(function* () {
      let fileTypeWhitelist = _arguments.length > 1 && _arguments[1] !== undefined ? _arguments[1] : new Set();

      const dirName = (_nuclideUri || _load_nuclideUri()).default.dirname(filePath);
      const prefix = getPrefix(filePath);
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('FileSystemService', filePath);

      if (!service) {
        throw new Error('Invariant violation: "service"');
      }

      const listing = yield service.readdir((_nuclideUri || _load_nuclideUri()).default.getPath(dirName));
      // Here the filtering logic:
      // first get all files with the same prefix -> filelist,
      // get all the files that matches the whitelist -> wlFilelist;
      // check the wlFilelist: if empty, use filelist
      const filelist = listing.filter(function (otherFilePath) {
        return otherFilePath.stats.isFile() && !otherFilePath.file.endsWith('~') && getPrefix(otherFilePath.file) === prefix;
      });
      let wlFilelist = fileTypeWhitelist.size <= 0 ? filelist : filelist.filter(function (otherFilePath) {
        return fileTypeWhitelist.has((_nuclideUri || _load_nuclideUri()).default.extname(otherFilePath.file));
      });
      if (wlFilelist.length <= 0) {
        // no files in white list
        wlFilelist = filelist;
      }

      const relatedFiles = wlFilelist.map(function (otherFilePath) {
        return (_nuclideUri || _load_nuclideUri()).default.join(dirName, otherFilePath.file);
      });

      if (relatedFiles.indexOf(filePath) < 0) {
        relatedFiles.push(filePath);
      }
      relatedFiles.sort();
      return {
        relatedFiles: relatedFiles,
        index: relatedFiles.indexOf(filePath)
      };
    })();
  }
};
exports.default = RelatedFileFinder;


function getPrefix(filePath) {
  let base = (_nuclideUri || _load_nuclideUri()).default.basename(filePath);
  // Strip off the extension.
  const pos = base.lastIndexOf('.');
  if (pos !== -1) {
    base = base.substring(0, pos);
  }
  // In Objective-C we often have the X + XInternal.h for implementation methods.
  // Similarly, C++ users often use X.h + X-inl.h.
  return base.replace(/(Internal|-inl)$/, '');
}
module.exports = exports['default'];