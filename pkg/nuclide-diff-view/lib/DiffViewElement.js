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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var DID_DESTROY_EVENT_NAME = 'did-destroy';
var CHANGE_TITLE_EVENT_NAME = 'did-change-title';

var DiffViewElement = (function (_HTMLElement) {
  _inherits(DiffViewElement, _HTMLElement);

  function DiffViewElement() {
    _classCallCheck(this, DiffViewElement);

    _get(Object.getPrototypeOf(DiffViewElement.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DiffViewElement, [{
    key: 'initialize',
    value: function initialize(diffModel, uri) {
      var _this = this;

      this._diffModel = diffModel;
      this._uri = uri;
      this._emitter = new (_atom2 || _atom()).Emitter();
      this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();

      var fileName = this._getActiveFileName();
      this._subscriptions.add(this._diffModel.onActiveFileUpdates(function () {
        var newFileName = _this._getActiveFileName();
        if (newFileName !== fileName) {
          fileName = newFileName;
          _this._emitter.emit(CHANGE_TITLE_EVENT_NAME, _this.getTitle());
        }
      }));
      this._subscriptions.add(this._emitter);
      return this;
    }
  }, {
    key: '_getActiveFileName',
    value: function _getActiveFileName() {
      var _diffModel$getActiveFileState = this._diffModel.getActiveFileState();

      var filePath = _diffModel$getActiveFileState.filePath;

      if (filePath == null || filePath.length === 0) {
        return null;
      }
      return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(filePath);
    }
  }, {
    key: 'getIconName',
    value: function getIconName() {
      return 'git-branch';
    }

    /**
     * Return the tab title for the opened diff view tab item.
     */
  }, {
    key: 'getTitle',
    value: function getTitle() {
      var fileName = this._getActiveFileName();
      return 'Diff View' + (fileName == null ? '' : ' : ' + fileName);
    }

    /**
     * Change the title as the active file changes.
     */
  }, {
    key: 'onDidChangeTitle',
    value: function onDidChangeTitle(callback) {
      return this._emitter.on('did-change-title', callback);
    }

    /**
     * Return the tab URI for the opened diff view tab item.
     * This guarantees only one diff view will be opened per URI.
     */
  }, {
    key: 'getURI',
    value: function getURI() {
      return this._uri;
    }

    /**
     * Saves the edited file in the editable right text editor.
     */
  }, {
    key: 'save',
    value: function save() {
      this._diffModel.saveActiveFile();
    }
  }, {
    key: 'onDidChangeModified',
    value: function onDidChangeModified(callback) {
      return this._diffModel.onDidActiveBufferChangeModified(callback);
    }
  }, {
    key: 'isModified',
    value: function isModified() {
      return this._diffModel.isActiveBufferModified();
    }

    /**
     * Emits a destroy event that's used to unmount the attached React component
     * and invalidate the cached view instance of the Diff View.
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this._emitter.emit('did-destroy');
      this._subscriptions.dispose();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return null;
    }
  }, {
    key: 'onDidDestroy',
    value: function onDidDestroy(callback) {
      return this._emitter.on(DID_DESTROY_EVENT_NAME, callback);
    }
  }]);

  return DiffViewElement;
})(HTMLElement);

exports.default = document.registerElement('nuclide-diff-view', {
  prototype: DiffViewElement.prototype
});
module.exports = exports.default;