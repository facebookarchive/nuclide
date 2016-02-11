var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _logging = require('../../logging/');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var logger = (0, _logging.getLogger)();

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var TextBuffer = _require.TextBuffer;

var NuclideTextBuffer = (function (_TextBuffer) {
  _inherits(NuclideTextBuffer, _TextBuffer);

  function NuclideTextBuffer(connection, params) {
    _classCallCheck(this, NuclideTextBuffer);

    _get(Object.getPrototypeOf(NuclideTextBuffer.prototype), 'constructor', this).call(this, params);
    this.connection = connection;
    this.setPath(params.filePath);
    var encoding = atom.config.get('core.fileEncoding');
    this.setEncoding(encoding);
  }

  _createClass(NuclideTextBuffer, [{
    key: 'setPath',
    value: function setPath(filePath) {
      if (!this.connection) {
        // If this.connection is not set, then the superclass constructor is still executing.
        // NuclideTextBuffer's constructor will ensure setPath() is called once this.constructor
        // is set.
        return;
      }
      if (filePath === this.getPath()) {
        return;
      }
      if (filePath) {
        this.file = this.createFile(filePath);
        if (this.file !== null) {
          var file = this.file;
          file.setEncoding(this.getEncoding());
          this.subscribeToFile();
        }
      } else {
        this.file = null;
      }
      this.emitter.emit('did-change-path', this.getPath());
    }
  }, {
    key: 'createFile',
    value: function createFile(filePath) {
      return this.connection.createFile(filePath);
    }
  }, {
    key: 'saveAs',
    value: _asyncToGenerator(function* (filePath) {
      if (!filePath) {
        throw new Error('Can\'t save buffer with no file path');
      }

      this.emitter.emit('will-save', { path: filePath });
      this.setPath(filePath);
      try {
        (0, _assert2['default'])(this.file);
        var file = this.file;
        yield file.write(this.getText());
        this.cachedDiskContents = this.getText();
        this.conflict = false;
        /* $FlowFixMe Private Atom API */
        this.emitModifiedStatusChanged(false);
        this.emitter.emit('did-save', { path: filePath });
      } catch (e) {
        logger.fatal('Failed to save remote file.', e);
        atom.notifications.addError('Failed to save remote file: ' + e.message);
      }
    })
  }, {
    key: 'updateCachedDiskContentsSync',
    value: function updateCachedDiskContentsSync() {
      throw new Error('updateCachedDiskContentsSync isn\'t supported in NuclideTextBuffer');
    }
  }, {
    key: 'subscribeToFile',
    value: function subscribeToFile() {
      var _this = this;

      if (this.fileSubscriptions) {
        this.fileSubscriptions.dispose();
      }
      (0, _assert2['default'])(this.file);
      this.fileSubscriptions = new CompositeDisposable();

      this.fileSubscriptions.add(this.file.onDidChange(_asyncToGenerator(function* () {
        var isModified = yield _this._isModified();
        if (isModified) {
          _this.conflict = true;
        }
        var previousContents = _this.cachedDiskContents;
        /* $FlowFixMe Private Atom API */
        yield _this.updateCachedDiskContents();
        if (previousContents === _this.cachedDiskContents) {
          return;
        }
        if (_this.conflict) {
          _this.emitter.emit('did-conflict');
        } else {
          _this.reload();
        }
      })));

      (0, _assert2['default'])(this.file);
      this.fileSubscriptions.add(this.file.onDidDelete(function () {
        var modified = _this.getText() !== _this.cachedDiskContents;
        /* $FlowFixMe Private Atom API */
        _this.wasModifiedBeforeRemove = modified;
        if (modified) {
          /* $FlowFixMe Private Atom API */
          _this.updateCachedDiskContents();
        } else {
          /* $FlowFixMe Private Atom API */
          _this.destroy();
        }
      }));

      (0, _assert2['default'])(this.file);
      this.fileSubscriptions.add(this.file.onDidRename(function () {
        _this.emitter.emit('did-change-path', _this.getPath());
      }));

      (0, _assert2['default'])(this.file);
      this.fileSubscriptions.add(this.file.onWillThrowWatchError(function (errorObject) {
        _this.emitter.emit('will-throw-watch-error', errorObject);
      }));
    }
  }, {
    key: '_isModified',
    value: _asyncToGenerator(function* () {
      if (!this.loaded) {
        return false;
      }
      if (this.file) {
        var exists = yield this.file.exists();
        if (exists) {
          return this.getText() !== this.cachedDiskContents;
        } else {
          return this.wasModifiedBeforeRemove != null ? this.wasModifiedBeforeRemove : !this.isEmpty();
        }
      } else {
        return !this.isEmpty();
      }
    })
  }]);

  return NuclideTextBuffer;
})(TextBuffer);

module.exports = NuclideTextBuffer;

/* $FlowFixMe */
//# sourceMappingURL=data:application/json;base64,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Q0FBQyx1QkFBdUIsSUFBSSxJQUFJLEdBQ3pDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNsRDtPQUNGLE1BQU07QUFDTCxlQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3hCO0tBQ0Y7OztTQXJJRyxpQkFBaUI7R0FBUyxVQUFVOztBQXdJMUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJOdWNsaWRlVGV4dEJ1ZmZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtSZW1vdGVDb25uZWN0aW9ufSBmcm9tICcuLi8uLi9yZW1vdGUtY29ubmVjdGlvbi9saWIvUmVtb3RlQ29ubmVjdGlvbic7XG5pbXBvcnQgdHlwZSBSZW1vdGVGaWxlIGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uL2xpYi9SZW1vdGVGaWxlJztcblxuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcvJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgVGV4dEJ1ZmZlcn0gPSByZXF1aXJlKCdhdG9tJyk7XG5cbmNsYXNzIE51Y2xpZGVUZXh0QnVmZmVyIGV4dGVuZHMgVGV4dEJ1ZmZlciB7XG4gIGNvbm5lY3Rpb246IFJlbW90ZUNvbm5lY3Rpb247XG4gIGZpbGVTdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICAvKiAkRmxvd0ZpeE1lICovXG4gIGZpbGU6ID9SZW1vdGVGaWxlO1xuICBjb25mbGljdDogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uLCBwYXJhbXM6IGFueSkge1xuICAgIHN1cGVyKHBhcmFtcyk7XG4gICAgdGhpcy5jb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgICB0aGlzLnNldFBhdGgocGFyYW1zLmZpbGVQYXRoKTtcbiAgICBjb25zdCBlbmNvZGluZzogc3RyaW5nID0gKGF0b20uY29uZmlnLmdldCgnY29yZS5maWxlRW5jb2RpbmcnKTogYW55KTtcbiAgICB0aGlzLnNldEVuY29kaW5nKGVuY29kaW5nKTtcbiAgfVxuXG4gIHNldFBhdGgoZmlsZVBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5jb25uZWN0aW9uKSB7XG4gICAgICAvLyBJZiB0aGlzLmNvbm5lY3Rpb24gaXMgbm90IHNldCwgdGhlbiB0aGUgc3VwZXJjbGFzcyBjb25zdHJ1Y3RvciBpcyBzdGlsbCBleGVjdXRpbmcuXG4gICAgICAvLyBOdWNsaWRlVGV4dEJ1ZmZlcidzIGNvbnN0cnVjdG9yIHdpbGwgZW5zdXJlIHNldFBhdGgoKSBpcyBjYWxsZWQgb25jZSB0aGlzLmNvbnN0cnVjdG9yXG4gICAgICAvLyBpcyBzZXQuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChmaWxlUGF0aCA9PT0gdGhpcy5nZXRQYXRoKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGZpbGVQYXRoKSB7XG4gICAgICB0aGlzLmZpbGUgPSB0aGlzLmNyZWF0ZUZpbGUoZmlsZVBhdGgpO1xuICAgICAgaWYgKHRoaXMuZmlsZSAhPT0gbnVsbCkge1xuICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5maWxlO1xuICAgICAgICBmaWxlLnNldEVuY29kaW5nKHRoaXMuZ2V0RW5jb2RpbmcoKSk7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9GaWxlKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZmlsZSA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXBhdGgnLCB0aGlzLmdldFBhdGgoKSk7XG4gIH1cblxuICBjcmVhdGVGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBSZW1vdGVGaWxlIHtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uLmNyZWF0ZUZpbGUoZmlsZVBhdGgpO1xuICB9XG5cbiAgYXN5bmMgc2F2ZUFzKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhblxcJ3Qgc2F2ZSBidWZmZXIgd2l0aCBubyBmaWxlIHBhdGgnKTtcbiAgICB9XG5cbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnd2lsbC1zYXZlJywge3BhdGg6IGZpbGVQYXRofSk7XG4gICAgdGhpcy5zZXRQYXRoKGZpbGVQYXRoKTtcbiAgICB0cnkge1xuICAgICAgaW52YXJpYW50KHRoaXMuZmlsZSk7XG4gICAgICBjb25zdCBmaWxlID0gdGhpcy5maWxlO1xuICAgICAgYXdhaXQgZmlsZS53cml0ZSh0aGlzLmdldFRleHQoKSk7XG4gICAgICB0aGlzLmNhY2hlZERpc2tDb250ZW50cyA9IHRoaXMuZ2V0VGV4dCgpO1xuICAgICAgdGhpcy5jb25mbGljdCA9IGZhbHNlO1xuICAgICAgLyogJEZsb3dGaXhNZSBQcml2YXRlIEF0b20gQVBJICovXG4gICAgICB0aGlzLmVtaXRNb2RpZmllZFN0YXR1c0NoYW5nZWQoZmFsc2UpO1xuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1zYXZlJywge3BhdGg6IGZpbGVQYXRofSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nZ2VyLmZhdGFsKCdGYWlsZWQgdG8gc2F2ZSByZW1vdGUgZmlsZS4nLCBlKTtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgRmFpbGVkIHRvIHNhdmUgcmVtb3RlIGZpbGU6ICR7ZS5tZXNzYWdlfWApO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZUNhY2hlZERpc2tDb250ZW50c1N5bmMoKTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1cGRhdGVDYWNoZWREaXNrQ29udGVudHNTeW5jIGlzblxcJ3Qgc3VwcG9ydGVkIGluIE51Y2xpZGVUZXh0QnVmZmVyJyk7XG4gIH1cblxuICBzdWJzY3JpYmVUb0ZpbGUoKSB7XG4gICAgaWYgKHRoaXMuZmlsZVN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuZmlsZVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIH1cbiAgICBpbnZhcmlhbnQodGhpcy5maWxlKTtcbiAgICB0aGlzLmZpbGVTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIHRoaXMuZmlsZVN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZmlsZS5vbkRpZENoYW5nZShhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBpc01vZGlmaWVkID0gYXdhaXQgdGhpcy5faXNNb2RpZmllZCgpO1xuICAgICAgaWYgKGlzTW9kaWZpZWQpIHtcbiAgICAgICAgdGhpcy5jb25mbGljdCA9IHRydWU7XG4gICAgICB9XG4gICAgICBjb25zdCBwcmV2aW91c0NvbnRlbnRzID0gdGhpcy5jYWNoZWREaXNrQ29udGVudHM7XG4gICAgICAvKiAkRmxvd0ZpeE1lIFByaXZhdGUgQXRvbSBBUEkgKi9cbiAgICAgIGF3YWl0IHRoaXMudXBkYXRlQ2FjaGVkRGlza0NvbnRlbnRzKCk7XG4gICAgICBpZiAocHJldmlvdXNDb250ZW50cyA9PT0gdGhpcy5jYWNoZWREaXNrQ29udGVudHMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuY29uZmxpY3QpIHtcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jb25mbGljdCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWxvYWQoKTtcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICBpbnZhcmlhbnQodGhpcy5maWxlKTtcbiAgICB0aGlzLmZpbGVTdWJzY3JpcHRpb25zLmFkZCh0aGlzLmZpbGUub25EaWREZWxldGUoKCkgPT4ge1xuICAgICAgY29uc3QgbW9kaWZpZWQgPSB0aGlzLmdldFRleHQoKSAhPT0gdGhpcy5jYWNoZWREaXNrQ29udGVudHM7XG4gICAgICAvKiAkRmxvd0ZpeE1lIFByaXZhdGUgQXRvbSBBUEkgKi9cbiAgICAgIHRoaXMud2FzTW9kaWZpZWRCZWZvcmVSZW1vdmUgPSBtb2RpZmllZDtcbiAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAvKiAkRmxvd0ZpeE1lIFByaXZhdGUgQXRvbSBBUEkgKi9cbiAgICAgICAgdGhpcy51cGRhdGVDYWNoZWREaXNrQ29udGVudHMoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8qICRGbG93Rml4TWUgUHJpdmF0ZSBBdG9tIEFQSSAqL1xuICAgICAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICBpbnZhcmlhbnQodGhpcy5maWxlKTtcbiAgICB0aGlzLmZpbGVTdWJzY3JpcHRpb25zLmFkZCh0aGlzLmZpbGUub25EaWRSZW5hbWUoKCkgPT4ge1xuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtcGF0aCcsIHRoaXMuZ2V0UGF0aCgpKTtcbiAgICB9KSk7XG5cbiAgICBpbnZhcmlhbnQodGhpcy5maWxlKTtcbiAgICB0aGlzLmZpbGVTdWJzY3JpcHRpb25zLmFkZCh0aGlzLmZpbGUub25XaWxsVGhyb3dXYXRjaEVycm9yKGVycm9yT2JqZWN0ID0+IHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCd3aWxsLXRocm93LXdhdGNoLWVycm9yJywgZXJyb3JPYmplY3QpO1xuICAgIH0pKTtcbiAgfVxuXG4gIGFzeW5jIF9pc01vZGlmaWVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmICghdGhpcy5sb2FkZWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHRoaXMuZmlsZSkge1xuICAgICAgY29uc3QgZXhpc3RzID0gYXdhaXQgdGhpcy5maWxlLmV4aXN0cygpO1xuICAgICAgaWYgKGV4aXN0cykge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRUZXh0KCkgIT09IHRoaXMuY2FjaGVkRGlza0NvbnRlbnRzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2FzTW9kaWZpZWRCZWZvcmVSZW1vdmUgIT0gbnVsbCA/XG4gICAgICAgICAgdGhpcy53YXNNb2RpZmllZEJlZm9yZVJlbW92ZSA6ICF0aGlzLmlzRW1wdHkoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICF0aGlzLmlzRW1wdHkoKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOdWNsaWRlVGV4dEJ1ZmZlcjtcbiJdfQ==