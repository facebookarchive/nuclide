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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

var MercurialConflictContext = (function () {
  function MercurialConflictContext(hgRepository, workingDirectory, priority) {
    _classCallCheck(this, MercurialConflictContext);

    this._hgRepository = hgRepository;
    this.workingDirectory = workingDirectory;
    this.priority = priority;
    this.resolveText = 'Resolve';
  }

  _createClass(MercurialConflictContext, [{
    key: 'readConflicts',
    value: function readConflicts() {
      // TODO(most)
      return Promise.resolve([{
        message: 'both changed',
        path: 'test.txt',
        resolveMessage: 'Resolve'
      }]);
    }
  }, {
    key: 'isResolvedFile',
    value: function isResolvedFile(filePath) {
      return Promise.resolve(true);
    }
  }, {
    key: 'checkoutSide',
    value: function checkoutSide(sideName, filePath) {
      // TODO(most)
      return Promise.resolve();
    }
  }, {
    key: 'resolveFile',
    value: function resolveFile(filePath) {
      // TODO(most): mark as resolved.
      return Promise.resolve();
    }

    // Deletermine if that's a rebase or merge operation.
  }, {
    key: 'isRebasing',
    value: function isRebasing() {
      // TODO(most)
      return true;
    }
  }, {
    key: 'joinPath',
    value: function joinPath(relativePath) {
      return _nuclideRemoteUri2['default'].join(this.workingDirectory.getPath(), relativePath);
    }
  }]);

  return MercurialConflictContext;
})();

exports.MercurialConflictContext = MercurialConflictContext;