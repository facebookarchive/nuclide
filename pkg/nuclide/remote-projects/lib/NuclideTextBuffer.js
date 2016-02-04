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
//# sourceMappingURL=data:application/json;base64,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LENBQUMsT0FBTyxFQUFFLENBQUM7T0FDeEI7S0FDRjs7O1NBcElHLGlCQUFpQjtHQUFTLFVBQVU7O0FBdUkxQyxNQUFNLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDIiwiZmlsZSI6Ik51Y2xpZGVUZXh0QnVmZmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1JlbW90ZUNvbm5lY3Rpb259IGZyb20gJy4uLy4uL3JlbW90ZS1jb25uZWN0aW9uL2xpYi9SZW1vdGVDb25uZWN0aW9uJztcbmltcG9ydCB0eXBlIFJlbW90ZUZpbGUgZnJvbSAnLi4vLi4vcmVtb3RlLWNvbm5lY3Rpb24vbGliL1JlbW90ZUZpbGUnO1xuXG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZy8nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBUZXh0QnVmZmVyfSA9IHJlcXVpcmUoJ2F0b20nKTtcblxuY2xhc3MgTnVjbGlkZVRleHRCdWZmZXIgZXh0ZW5kcyBUZXh0QnVmZmVyIHtcbiAgY29ubmVjdGlvbjogUmVtb3RlQ29ubmVjdGlvbjtcbiAgY2FjaGVkRGlza0NvbnRlbnRzOiBzdHJpbmc7XG4gIGZpbGVTdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICAvKiAkRmxvd0ZpeE1lICovXG4gIGZpbGU6ID9SZW1vdGVGaWxlO1xuICBjb25mbGljdDogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihjb25uZWN0aW9uOiBSZW1vdGVDb25uZWN0aW9uLCBwYXJhbXM6IGFueSkge1xuICAgIHN1cGVyKHBhcmFtcyk7XG4gICAgdGhpcy5jb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgICB0aGlzLnNldFBhdGgocGFyYW1zLmZpbGVQYXRoKTtcbiAgfVxuXG4gIHNldFBhdGgoZmlsZVBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5jb25uZWN0aW9uKSB7XG4gICAgICAvLyBJZiB0aGlzLmNvbm5lY3Rpb24gaXMgbm90IHNldCwgdGhlbiB0aGUgc3VwZXJjbGFzcyBjb25zdHJ1Y3RvciBpcyBzdGlsbCBleGVjdXRpbmcuXG4gICAgICAvLyBOdWNsaWRlVGV4dEJ1ZmZlcidzIGNvbnN0cnVjdG9yIHdpbGwgZW5zdXJlIHNldFBhdGgoKSBpcyBjYWxsZWQgb25jZSB0aGlzLmNvbnN0cnVjdG9yXG4gICAgICAvLyBpcyBzZXQuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChmaWxlUGF0aCA9PT0gdGhpcy5nZXRQYXRoKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGZpbGVQYXRoKSB7XG4gICAgICB0aGlzLmZpbGUgPSB0aGlzLmNyZWF0ZUZpbGUoZmlsZVBhdGgpO1xuICAgICAgaWYgKHRoaXMuZmlsZSAhPT0gbnVsbCkge1xuICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5maWxlO1xuICAgICAgICBmaWxlLnNldEVuY29kaW5nKHRoaXMuZ2V0RW5jb2RpbmcoKSk7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9GaWxlKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZmlsZSA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXBhdGgnLCB0aGlzLmdldFBhdGgoKSk7XG4gIH1cblxuICBjcmVhdGVGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBSZW1vdGVGaWxlIHtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uLmNyZWF0ZUZpbGUoZmlsZVBhdGgpO1xuICB9XG5cbiAgYXN5bmMgc2F2ZUFzKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhblxcJ3Qgc2F2ZSBidWZmZXIgd2l0aCBubyBmaWxlIHBhdGgnKTtcbiAgICB9XG5cbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnd2lsbC1zYXZlJywge3BhdGg6IGZpbGVQYXRofSk7XG4gICAgdGhpcy5zZXRQYXRoKGZpbGVQYXRoKTtcbiAgICB0cnkge1xuICAgICAgaW52YXJpYW50KHRoaXMuZmlsZSk7XG4gICAgICBjb25zdCBmaWxlID0gdGhpcy5maWxlO1xuICAgICAgYXdhaXQgZmlsZS53cml0ZSh0aGlzLmdldFRleHQoKSk7XG4gICAgICB0aGlzLmNhY2hlZERpc2tDb250ZW50cyA9IHRoaXMuZ2V0VGV4dCgpO1xuICAgICAgdGhpcy5jb25mbGljdCA9IGZhbHNlO1xuICAgICAgLyogJEZsb3dGaXhNZSBQcml2YXRlIEF0b20gQVBJICovXG4gICAgICB0aGlzLmVtaXRNb2RpZmllZFN0YXR1c0NoYW5nZWQoZmFsc2UpO1xuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1zYXZlJywge3BhdGg6IGZpbGVQYXRofSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nZ2VyLmZhdGFsKCdGYWlsZWQgdG8gc2F2ZSByZW1vdGUgZmlsZS4nLCBlKTtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgRmFpbGVkIHRvIHNhdmUgcmVtb3RlIGZpbGU6ICR7ZS5tZXNzYWdlfWApO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZUNhY2hlZERpc2tDb250ZW50c1N5bmMoKTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1cGRhdGVDYWNoZWREaXNrQ29udGVudHNTeW5jIGlzblxcJ3Qgc3VwcG9ydGVkIGluIE51Y2xpZGVUZXh0QnVmZmVyJyk7XG4gIH1cblxuICBzdWJzY3JpYmVUb0ZpbGUoKSB7XG4gICAgaWYgKHRoaXMuZmlsZVN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuZmlsZVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIH1cbiAgICBpbnZhcmlhbnQodGhpcy5maWxlKTtcbiAgICB0aGlzLmZpbGVTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIHRoaXMuZmlsZVN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZmlsZS5vbkRpZENoYW5nZShhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBpc01vZGlmaWVkID0gYXdhaXQgdGhpcy5faXNNb2RpZmllZCgpO1xuICAgICAgaWYgKGlzTW9kaWZpZWQpIHtcbiAgICAgICAgdGhpcy5jb25mbGljdCA9IHRydWU7XG4gICAgICB9XG4gICAgICBjb25zdCBwcmV2aW91c0NvbnRlbnRzID0gdGhpcy5jYWNoZWREaXNrQ29udGVudHM7XG4gICAgICAvKiAkRmxvd0ZpeE1lIFByaXZhdGUgQXRvbSBBUEkgKi9cbiAgICAgIGF3YWl0IHRoaXMudXBkYXRlQ2FjaGVkRGlza0NvbnRlbnRzKCk7XG4gICAgICBpZiAocHJldmlvdXNDb250ZW50cyA9PT0gdGhpcy5jYWNoZWREaXNrQ29udGVudHMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuY29uZmxpY3QpIHtcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jb25mbGljdCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWxvYWQoKTtcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICBpbnZhcmlhbnQodGhpcy5maWxlKTtcbiAgICB0aGlzLmZpbGVTdWJzY3JpcHRpb25zLmFkZCh0aGlzLmZpbGUub25EaWREZWxldGUoKCkgPT4ge1xuICAgICAgY29uc3QgbW9kaWZpZWQgPSB0aGlzLmdldFRleHQoKSAhPT0gdGhpcy5jYWNoZWREaXNrQ29udGVudHM7XG4gICAgICAvKiAkRmxvd0ZpeE1lIFByaXZhdGUgQXRvbSBBUEkgKi9cbiAgICAgIHRoaXMud2FzTW9kaWZpZWRCZWZvcmVSZW1vdmUgPSBtb2RpZmllZDtcbiAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAvKiAkRmxvd0ZpeE1lIFByaXZhdGUgQXRvbSBBUEkgKi9cbiAgICAgICAgdGhpcy51cGRhdGVDYWNoZWREaXNrQ29udGVudHMoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8qICRGbG93Rml4TWUgUHJpdmF0ZSBBdG9tIEFQSSAqL1xuICAgICAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICBpbnZhcmlhbnQodGhpcy5maWxlKTtcbiAgICB0aGlzLmZpbGVTdWJzY3JpcHRpb25zLmFkZCh0aGlzLmZpbGUub25EaWRSZW5hbWUoKCkgPT4ge1xuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtcGF0aCcsIHRoaXMuZ2V0UGF0aCgpKTtcbiAgICB9KSk7XG5cbiAgICBpbnZhcmlhbnQodGhpcy5maWxlKTtcbiAgICB0aGlzLmZpbGVTdWJzY3JpcHRpb25zLmFkZCh0aGlzLmZpbGUub25XaWxsVGhyb3dXYXRjaEVycm9yKChlcnJvck9iamVjdCkgPT4ge1xuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3dpbGwtdGhyb3ctd2F0Y2gtZXJyb3InLCBlcnJvck9iamVjdCk7XG4gICAgfSkpO1xuICB9XG5cbiAgYXN5bmMgX2lzTW9kaWZpZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKCF0aGlzLmxvYWRlZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAodGhpcy5maWxlKSB7XG4gICAgICBjb25zdCBleGlzdHMgPSBhd2FpdCB0aGlzLmZpbGUuZXhpc3RzKCk7XG4gICAgICBpZiAoZXhpc3RzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFRleHQoKSAhPT0gdGhpcy5jYWNoZWREaXNrQ29udGVudHM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy53YXNNb2RpZmllZEJlZm9yZVJlbW92ZSAhPSBudWxsID9cbiAgICAgICAgICB0aGlzLndhc01vZGlmaWVkQmVmb3JlUmVtb3ZlIDogIXRoaXMuaXNFbXB0eSgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gIXRoaXMuaXNFbXB0eSgpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE51Y2xpZGVUZXh0QnVmZmVyO1xuIl19