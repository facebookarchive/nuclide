"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const relatedFilesProviders = new Set();
/**
 * Finds related files, to be used in `JumpToRelatedFile`.
 *
 * Files are related if they have the same filename but different extension,
 * or if the filename is appended with `Internal` or `-inl`. For example, these files
 * would all be related: `Foo.h`, `Foo.m`, `FooInternal.h`, `Foo-inl.h`
 *
 * For now, we only search in the given path's directory for related files.
 */

class RelatedFileFinder {
  static registerRelatedFilesProvider(provider) {
    relatedFilesProviders.add(provider);
    return new (_UniversalDisposable().default)(() => relatedFilesProviders.delete(provider));
  }

  static getRelatedFilesProvidersDisposable() {
    return new (_UniversalDisposable().default)(() => relatedFilesProviders.clear());
  }

  static async _findRelatedFilesFromProviders(path) {
    const relatedLists = await Promise.all(Array.from(relatedFilesProviders.values()).map(provider => (0, _promise().timeoutPromise)(provider.getRelatedFiles(path), 1000).catch(error => {
      // silently catch the error and return an empty result
      return [];
    })));
    const relatedFiles = new Set();

    for (const relatedList of relatedLists) {
      for (const relatedFile of relatedList) {
        relatedFiles.add(relatedFile);
      }
    }

    return Array.from(relatedFiles.values());
  }
  /**
   * Returns the related files and the given file's index in that array.
   * The given file must be in the related files array.
   * @param filePath The filepath for which to get related files.
   * @param fileTypeWhiteList the set of file types that we are looking for;
   *      If this set is empty, all file types will be listed; the original
   *      filePath should always be in the result
   * @return The related files and the given path's index into it.
   */


  static async find(filePath, fileTypeWhitelist = new Set()) {
    const dirName = _nuclideUri().default.dirname(filePath);

    const prefix = getPrefix(filePath);
    const service = (0, _nuclideRemoteConnection().getFileSystemServiceByNuclideUri)(filePath);
    const listing = await service.readdir(dirName); // Here the filtering logic:
    // first get all files with the same prefix -> filelist,
    // add the related files from external providers
    // get all the files that matches the whitelist -> wlFilelist;
    // check the wlFilelist: if empty, use filelist

    const filelist = listing.filter(entry => {
      const [name, isFile] = entry;
      return isFile && !name.endsWith('~') && getPrefix(name) === prefix;
    }).map(entry => _nuclideUri().default.join(dirName, entry[0])).concat((await RelatedFileFinder._findRelatedFilesFromProviders(filePath)));
    let wlFilelist = fileTypeWhitelist.size <= 0 ? filelist : filelist.filter(otherFilePath => {
      return fileTypeWhitelist.has(_nuclideUri().default.extname(otherFilePath));
    });

    if (wlFilelist.length <= 0) {
      // no files in white list
      wlFilelist = filelist;
    }

    const relatedFiles = Array.from(new Set(wlFilelist));

    if (relatedFiles.indexOf(filePath) < 0) {
      relatedFiles.push(filePath);
    }

    relatedFiles.sort();
    return {
      relatedFiles,
      index: relatedFiles.indexOf(filePath)
    };
  }

}

exports.default = RelatedFileFinder;

function getPrefix(filePath) {
  let base = _nuclideUri().default.basename(filePath); // Strip off the extension.


  const pos = base.lastIndexOf('.');

  if (pos !== -1) {
    base = base.substring(0, pos);
  } // In Objective-C we often have the X + XInternal.h for implementation methods.
  // Similarly, C++ users often use X.h + X-inl.h.


  return base.replace(/(Internal|-inl)$/, '');
}