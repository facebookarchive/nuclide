Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

/**
 * Finds related files, to be used in `JumpToRelatedFile`.
 *
 * Files are related if they have the same filename but different extension,
 * or if the filename is appended with `Internal` or `-inl`. For example, these files
 * would all be related: `Foo.h`, `Foo.m`, `FooInternal.h`, `Foo-inl.h`
 *
 * For now, we only search in the given path's directory for related files.
 */

var RelatedFileFinder = (function () {
  function RelatedFileFinder() {
    _classCallCheck(this, RelatedFileFinder);
  }

  _createClass(RelatedFileFinder, null, [{
    key: 'find',

    /**
     * Returns the related files and the given file's index in that array.
     * The given file must be in the related files array.
     * @param filePath The filepath for which to get related files.
     * @param fileTypeWhiteList the set of file types that we are looking for;
     *      If this set is empty, all file types will be listed; the original
     *      filePath should always be in the result
     * @return The related files and the given path's index into it.
     */
    value: _asyncToGenerator(function* (filePath) {
      var fileTypeWhitelist = arguments.length <= 1 || arguments[1] === undefined ? new Set() : arguments[1];

      var dirName = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.dirname(filePath);
      var prefix = getPrefix(filePath);
      var service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('FileSystemService', filePath);
      (0, (_assert || _load_assert()).default)(service);
      var listing = yield service.readdir((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getPath(dirName));
      // Here the filtering logic:
      // first get all files with the same prefix -> filelist,
      // get all the files that matches the whitelist -> wlFilelist;
      // check the wlFilelist: if empty, use filelist
      var filelist = listing.filter(function (otherFilePath) {
        return otherFilePath.stats.isFile() && !otherFilePath.file.endsWith('~') && getPrefix(otherFilePath.file) === prefix;
      });
      var wlFilelist = fileTypeWhitelist.size <= 0 ? filelist : filelist.filter(function (otherFilePath) {
        return fileTypeWhitelist.has((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.extname(otherFilePath.file));
      });
      if (wlFilelist.length <= 0) {
        // no files in white list
        wlFilelist = filelist;
      }

      var relatedFiles = wlFilelist.map(function (otherFilePath) {
        return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(dirName, otherFilePath.file);
      });

      if (relatedFiles.indexOf(filePath) < 0) {
        relatedFiles.push(filePath);
      }
      relatedFiles.sort();
      return {
        relatedFiles: relatedFiles,
        index: relatedFiles.indexOf(filePath)
      };
    })
  }]);

  return RelatedFileFinder;
})();

exports.default = RelatedFileFinder;

function getPrefix(filePath) {
  var base = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.basename(filePath);
  // Strip off the extension.
  var pos = base.lastIndexOf('.');
  if (pos !== -1) {
    base = base.substring(0, pos);
  }
  // In Objective-C we often have the X + XInternal.h for implementation methods.
  // Similarly, C++ users often use X.h + X-inl.h.
  return base.replace(/(Internal|-inl)$/, '');
}
module.exports = exports.default;