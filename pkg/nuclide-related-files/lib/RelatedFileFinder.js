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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
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

  _createClass(RelatedFileFinder, [{
    key: 'find',

    /**
     * Returns the related files and the given file's index in that array.
     * The given file must be in the related files array.
     * @param filePath The filepath for which to get related files.
     * @return The related files and the given path's index into it.
     */
    value: _asyncToGenerator(function* (filePath) {
      var _this = this;

      var dirName = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(filePath);
      var prefix = this._getPrefix(filePath);

      var service = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByNuclideUri)('FileSystemService', filePath);
      (0, (_assert2 || _assert()).default)(service);
      var listing = yield service.readdir((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.getPath(dirName));
      var relatedFiles = listing.filter(function (otherFilePath) {
        return otherFilePath.stats.isFile() && _this._getPrefix(otherFilePath.file) === prefix;
      }).map(function (otherFilePath) {
        return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(dirName, otherFilePath.file);
      }).sort();

      var index = relatedFiles.indexOf(filePath);
      if (index === -1) {
        throw new Error('Given path must be in `relatedFiles`: ' + filePath);
      }

      return {
        relatedFiles: relatedFiles,
        index: index
      };
    })
  }, {
    key: '_getPrefix',
    value: function _getPrefix(filePath) {
      var base = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(filePath);
      // Strip off the extension.
      var pos = base.lastIndexOf('.');
      if (pos !== -1) {
        base = base.substring(0, pos);
      }
      // In Objective-C we often have the X + XInternal.h for implementation methods.
      // Similarly, C++ users often use X.h + X-inl.h.
      return base.replace(/(Internal|-inl)$/, '');
    }
  }]);

  return RelatedFileFinder;
})();

exports.default = RelatedFileFinder;
module.exports = exports.default;