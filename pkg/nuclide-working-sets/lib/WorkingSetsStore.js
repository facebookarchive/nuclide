Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _WorkingSet = require('./WorkingSet');

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _uri = require('./uri');

var _nuclideLogging = require('../../nuclide-logging');

var NEW_WORKING_SET_EVENT = 'new-working-set';
var NEW_DEFINITIONS_EVENT = 'new-definitions';
var SAVE_DEFINITIONS_EVENT = 'save-definitions';

var WorkingSetsStore = (function () {
  function WorkingSetsStore() {
    _classCallCheck(this, WorkingSetsStore);

    this._emitter = new _atom.Emitter();
    this._current = new _WorkingSet.WorkingSet();
    this._definitions = [];
    this._applicableDefinitions = [];
    this._notApplicableDefinitions = [];
    this._prevCombinedUris = [];
    this._lastSelected = [];
  }

  _createClass(WorkingSetsStore, [{
    key: 'getCurrent',
    value: function getCurrent() {
      return this._current;
    }
  }, {
    key: 'getDefinitions',
    value: function getDefinitions() {
      return this._definitions;
    }
  }, {
    key: 'getApplicableDefinitions',
    value: function getApplicableDefinitions() {
      return this._applicableDefinitions;
    }
  }, {
    key: 'getNotApplicableDefinitions',
    value: function getNotApplicableDefinitions() {
      return this._notApplicableDefinitions;
    }
  }, {
    key: 'subscribeToCurrent',
    value: function subscribeToCurrent(callback) {
      return this._emitter.on(NEW_WORKING_SET_EVENT, callback);
    }
  }, {
    key: 'subscribeToDefinitions',
    value: function subscribeToDefinitions(callback) {
      return this._emitter.on(NEW_DEFINITIONS_EVENT, callback);
    }
  }, {
    key: 'onSaveDefinitions',
    value: function onSaveDefinitions(callback) {
      return this._emitter.on(SAVE_DEFINITIONS_EVENT, callback);
    }
  }, {
    key: 'updateDefinitions',
    value: function updateDefinitions(definitions) {
      var _sortOutApplicability2 = this._sortOutApplicability(definitions);

      var applicable = _sortOutApplicability2.applicable;
      var notApplicable = _sortOutApplicability2.notApplicable;

      this._setDefinitions(applicable, notApplicable, definitions);
    }
  }, {
    key: 'updateApplicability',
    value: function updateApplicability() {
      var _sortOutApplicability3 = this._sortOutApplicability(this._definitions);

      var applicable = _sortOutApplicability3.applicable;
      var notApplicable = _sortOutApplicability3.notApplicable;

      this._setDefinitions(applicable, notApplicable, this._definitions);
    }
  }, {
    key: 'saveWorkingSet',
    value: function saveWorkingSet(name, workingSet) {
      this._saveDefinition(name, name, workingSet);
    }
  }, {
    key: 'update',
    value: function update(name, newName, workingSet) {
      this._saveDefinition(name, newName, workingSet);
    }
  }, {
    key: 'activate',
    value: function activate(name) {
      this._activateDefinition(name, /* active */true);
    }
  }, {
    key: 'deactivate',
    value: function deactivate(name) {
      this._activateDefinition(name, /* active */false);
    }
  }, {
    key: 'deleteWorkingSet',
    value: function deleteWorkingSet(name) {
      (0, _nuclideAnalytics.track)('working-sets-delete', { name: name });

      var definitions = this._definitions.filter(function (d) {
        return d.name !== name;
      });
      this._saveDefinitions(definitions);
    }
  }, {
    key: '_setDefinitions',
    value: function _setDefinitions(applicable, notApplicable, definitions) {
      var somethingHasChanged = !_nuclideCommons.array.equal(this._applicableDefinitions, applicable) || !_nuclideCommons.array.equal(this._notApplicableDefinitions, notApplicable);

      if (somethingHasChanged) {
        this._applicableDefinitions = applicable;
        this._notApplicableDefinitions = notApplicable;
        this._definitions = definitions;

        var activeApplicable = applicable.filter(function (d) {
          return d.active;
        });
        if (activeApplicable.length > 0) {
          this._lastSelected = activeApplicable.map(function (d) {
            return d.name;
          });
        }
        this._emitter.emit(NEW_DEFINITIONS_EVENT, { applicable: applicable, notApplicable: notApplicable });

        this._updateCurrentWorkingSet(activeApplicable);
      }
    }
  }, {
    key: '_updateCurrentWorkingSet',
    value: function _updateCurrentWorkingSet(activeApplicable) {
      var _ref;

      var combinedUris = (_ref = []).concat.apply(_ref, _toConsumableArray(activeApplicable.map(function (d) {
        return d.uris;
      })));

      var newWorkingSet = new _WorkingSet.WorkingSet(combinedUris);
      if (!this._current.equals(newWorkingSet)) {
        this._current = newWorkingSet;
        this._emitter.emit(NEW_WORKING_SET_EVENT, newWorkingSet);
      }
    }
  }, {
    key: '_saveDefinition',
    value: function _saveDefinition(name, newName, workingSet) {
      var definitions = this.getDefinitions();

      var nameIndex = -1;
      definitions.forEach(function (d, i) {
        if (d.name === name) {
          nameIndex = i;
        }
      });

      var newDefinitions = undefined;
      if (nameIndex < 0) {
        (0, _nuclideAnalytics.track)('working-sets-create', { name: name, uris: workingSet.getUris().join(',') });

        newDefinitions = definitions.concat({ name: name, uris: workingSet.getUris(), active: false });
      } else {
        (0, _nuclideAnalytics.track)('working-sets-update', { oldName: name, name: newName, uris: workingSet.getUris().join(',') });

        var active = definitions[nameIndex].active;
        newDefinitions = [].concat(definitions.slice(0, nameIndex), { name: newName, uris: workingSet.getUris(), active: active }, definitions.slice(nameIndex + 1));
      }

      this._saveDefinitions(newDefinitions);
    }
  }, {
    key: '_activateDefinition',
    value: function _activateDefinition(name, active) {
      (0, _nuclideAnalytics.track)('working-sets-activate', { name: name, active: active.toString() });

      var definitions = this.getDefinitions();
      var newDefinitions = definitions.map(function (d) {
        if (d.name === name) {
          d.active = active;
        }

        return d;
      });
      this._saveDefinitions(newDefinitions);
    }
  }, {
    key: 'deactivateAll',
    value: function deactivateAll() {
      var _this = this;

      var definitions = this.getDefinitions().map(function (d) {
        if (!_this._isApplicable(d)) {
          return d;
        }

        return _extends({}, d, { active: false });
      });
      this._saveDefinitions(definitions);
    }
  }, {
    key: 'toggleLastSelected',
    value: function toggleLastSelected() {
      var _this2 = this;

      (0, _nuclideAnalytics.track)('working-sets-toggle-last-selected');

      if (this.getApplicableDefinitions().some(function (d) {
        return d.active;
      })) {
        this.deactivateAll();
      } else {
        var newDefinitions = this.getDefinitions().map(function (d) {
          return _extends({}, d, {
            active: d.active || _this2._lastSelected.indexOf(d.name) > -1
          });
        });
        this._saveDefinitions(newDefinitions);
      }
    }
  }, {
    key: '_saveDefinitions',
    value: function _saveDefinitions(definitions) {
      this._emitter.emit(SAVE_DEFINITIONS_EVENT, definitions);
    }
  }, {
    key: '_sortOutApplicability',
    value: function _sortOutApplicability(definitions) {
      var _this3 = this;

      var applicable = [];
      var notApplicable = [];

      definitions.forEach(function (def) {
        if (_this3._isApplicable(def)) {
          applicable.push(def);
        } else {
          notApplicable.push(def);
        }
      });

      return { applicable: applicable, notApplicable: notApplicable };
    }
  }, {
    key: '_isApplicable',
    value: function _isApplicable(definition) {
      var workingSet = new _WorkingSet.WorkingSet(definition.uris);
      var dirs = atom.project.getDirectories().filter(function (dir) {
        // Apparently sometimes Atom supplies an invalid directory, or a directory with an
        // invalid paths. See https://github.com/facebook/nuclide/issues/416
        if (dir == null) {
          var logger = (0, _nuclideLogging.getLogger)();

          logger.warn('Received a null directory from Atom');
          return false;
        }
        try {
          (0, _uri.normalizePathUri)(dir.getPath());
          return true;
        } catch (e) {
          var logger = (0, _nuclideLogging.getLogger)();

          logger.warn('Failed to parse path supplied by Atom', dir.getPath());
          return false;
        }
      });

      return dirs.some(function (dir) {
        return workingSet.containsDir(dir.getPath());
      });
    }
  }]);

  return WorkingSetsStore;
})();

exports.WorkingSetsStore = WorkingSetsStore;
//# sourceMappingURL=data:application/json;base64,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RixDQUFDLENBQUM7O0FBRUgsYUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQUEsR0FBRztlQUFJLFVBQVUsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQ2hFOzs7U0EzT1UsZ0JBQWdCIiwiZmlsZSI6IldvcmtpbmdTZXRzU3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtXb3JraW5nU2V0fSBmcm9tICcuL1dvcmtpbmdTZXQnO1xuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7bm9ybWFsaXplUGF0aFVyaX0gZnJvbSAnLi91cmknO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5cbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0RGVmaW5pdGlvbn0gZnJvbSAnLi4nO1xuXG5leHBvcnQgdHlwZSBBcHBsaWNhYmlsaXR5U29ydGVkRGVmaW5pdGlvbnMgPSB7XG4gIGFwcGxpY2FibGU6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPjtcbiAgbm90QXBwbGljYWJsZTogQXJyYXk8V29ya2luZ1NldERlZmluaXRpb24+O1xufTtcblxuY29uc3QgTkVXX1dPUktJTkdfU0VUX0VWRU5UID0gJ25ldy13b3JraW5nLXNldCc7XG5jb25zdCBORVdfREVGSU5JVElPTlNfRVZFTlQgPSAnbmV3LWRlZmluaXRpb25zJztcbmNvbnN0IFNBVkVfREVGSU5JVElPTlNfRVZFTlQgPSAnc2F2ZS1kZWZpbml0aW9ucyc7XG5cbmV4cG9ydCBjbGFzcyBXb3JraW5nU2V0c1N0b3JlIHtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9jdXJyZW50OiBXb3JraW5nU2V0O1xuICBfZGVmaW5pdGlvbnM6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPjtcbiAgX2FwcGxpY2FibGVEZWZpbml0aW9uczogQXJyYXk8V29ya2luZ1NldERlZmluaXRpb24+O1xuICBfbm90QXBwbGljYWJsZURlZmluaXRpb25zOiBBcnJheTxXb3JraW5nU2V0RGVmaW5pdGlvbj47XG4gIF9wcmV2Q29tYmluZWRVcmlzOiBBcnJheTxzdHJpbmc+O1xuICBfbGFzdFNlbGVjdGVkOiBBcnJheTxzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX2N1cnJlbnQgPSBuZXcgV29ya2luZ1NldCgpO1xuICAgIHRoaXMuX2RlZmluaXRpb25zID0gW107XG4gICAgdGhpcy5fYXBwbGljYWJsZURlZmluaXRpb25zID0gW107XG4gICAgdGhpcy5fbm90QXBwbGljYWJsZURlZmluaXRpb25zID0gW107XG4gICAgdGhpcy5fcHJldkNvbWJpbmVkVXJpcyA9IFtdO1xuICAgIHRoaXMuX2xhc3RTZWxlY3RlZCA9IFtdO1xuICB9XG5cbiAgZ2V0Q3VycmVudCgpOiBXb3JraW5nU2V0IHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudDtcbiAgfVxuXG4gIGdldERlZmluaXRpb25zKCk6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RlZmluaXRpb25zO1xuICB9XG5cbiAgZ2V0QXBwbGljYWJsZURlZmluaXRpb25zKCk6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPiB7XG4gICAgcmV0dXJuIHRoaXMuX2FwcGxpY2FibGVEZWZpbml0aW9ucztcbiAgfVxuXG4gIGdldE5vdEFwcGxpY2FibGVEZWZpbml0aW9ucygpOiBBcnJheTxXb3JraW5nU2V0RGVmaW5pdGlvbj4ge1xuICAgIHJldHVybiB0aGlzLl9ub3RBcHBsaWNhYmxlRGVmaW5pdGlvbnM7XG4gIH1cblxuICBzdWJzY3JpYmVUb0N1cnJlbnQoY2FsbGJhY2s6IChjdXJyZW50OiBXb3JraW5nU2V0KSA9PiB2b2lkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKE5FV19XT1JLSU5HX1NFVF9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgc3Vic2NyaWJlVG9EZWZpbml0aW9ucyhcbiAgICBjYWxsYmFjazogKGRlZmluaXRpb25zOiBBcHBsaWNhYmlsaXR5U29ydGVkRGVmaW5pdGlvbnMpID0+IG1peGVkXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihORVdfREVGSU5JVElPTlNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uU2F2ZURlZmluaXRpb25zKFxuICAgIGNhbGxiYWNrOiAoZGVmaW5pdGlvbnM6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPikgPT4gbWl4ZWRcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKFNBVkVfREVGSU5JVElPTlNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIHVwZGF0ZURlZmluaXRpb25zKGRlZmluaXRpb25zOiBBcnJheTxXb3JraW5nU2V0RGVmaW5pdGlvbj4pOiB2b2lkIHtcbiAgICBjb25zdCB7YXBwbGljYWJsZSwgbm90QXBwbGljYWJsZX0gPSB0aGlzLl9zb3J0T3V0QXBwbGljYWJpbGl0eShkZWZpbml0aW9ucyk7XG4gICAgdGhpcy5fc2V0RGVmaW5pdGlvbnMoYXBwbGljYWJsZSwgbm90QXBwbGljYWJsZSwgZGVmaW5pdGlvbnMpO1xuICB9XG5cbiAgdXBkYXRlQXBwbGljYWJpbGl0eSgpOiB2b2lkIHtcbiAgICBjb25zdCB7YXBwbGljYWJsZSwgbm90QXBwbGljYWJsZX0gPSB0aGlzLl9zb3J0T3V0QXBwbGljYWJpbGl0eSh0aGlzLl9kZWZpbml0aW9ucyk7XG4gICAgdGhpcy5fc2V0RGVmaW5pdGlvbnMoYXBwbGljYWJsZSwgbm90QXBwbGljYWJsZSwgdGhpcy5fZGVmaW5pdGlvbnMpO1xuICB9XG5cbiAgc2F2ZVdvcmtpbmdTZXQobmFtZTogc3RyaW5nLCB3b3JraW5nU2V0OiBXb3JraW5nU2V0KTogdm9pZCB7XG4gICAgdGhpcy5fc2F2ZURlZmluaXRpb24obmFtZSwgbmFtZSwgd29ya2luZ1NldCk7XG4gIH1cblxuICB1cGRhdGUobmFtZTogc3RyaW5nLCBuZXdOYW1lOiBzdHJpbmcsIHdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQpOiB2b2lkIHtcbiAgICB0aGlzLl9zYXZlRGVmaW5pdGlvbihuYW1lLCBuZXdOYW1lLCB3b3JraW5nU2V0KTtcbiAgfVxuXG4gIGFjdGl2YXRlKG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGl2YXRlRGVmaW5pdGlvbihuYW1lLCAvKiBhY3RpdmUgKi8gdHJ1ZSk7XG4gIH1cblxuICBkZWFjdGl2YXRlKG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGl2YXRlRGVmaW5pdGlvbihuYW1lLCAvKiBhY3RpdmUgKi8gZmFsc2UpO1xuICB9XG5cbiAgZGVsZXRlV29ya2luZ1NldChuYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0cmFjaygnd29ya2luZy1zZXRzLWRlbGV0ZScsIHtuYW1lfSk7XG5cbiAgICBjb25zdCBkZWZpbml0aW9ucyA9IHRoaXMuX2RlZmluaXRpb25zLmZpbHRlcihkID0+IGQubmFtZSAhPT0gbmFtZSk7XG4gICAgdGhpcy5fc2F2ZURlZmluaXRpb25zKGRlZmluaXRpb25zKTtcbiAgfVxuXG4gIF9zZXREZWZpbml0aW9ucyhcbiAgICBhcHBsaWNhYmxlOiBBcnJheTxXb3JraW5nU2V0RGVmaW5pdGlvbj4sXG4gICAgbm90QXBwbGljYWJsZTogQXJyYXk8V29ya2luZ1NldERlZmluaXRpb24+LFxuICAgIGRlZmluaXRpb25zOiBBcnJheTxXb3JraW5nU2V0RGVmaW5pdGlvbj5cbiAgKTogdm9pZCB7XG4gICAgY29uc3Qgc29tZXRoaW5nSGFzQ2hhbmdlZCA9XG4gICAgICAhYXJyYXkuZXF1YWwodGhpcy5fYXBwbGljYWJsZURlZmluaXRpb25zLCBhcHBsaWNhYmxlKSB8fFxuICAgICAgIWFycmF5LmVxdWFsKHRoaXMuX25vdEFwcGxpY2FibGVEZWZpbml0aW9ucywgbm90QXBwbGljYWJsZSk7XG5cbiAgICBpZiAoc29tZXRoaW5nSGFzQ2hhbmdlZCkge1xuICAgICAgdGhpcy5fYXBwbGljYWJsZURlZmluaXRpb25zID0gYXBwbGljYWJsZTtcbiAgICAgIHRoaXMuX25vdEFwcGxpY2FibGVEZWZpbml0aW9ucyA9IG5vdEFwcGxpY2FibGU7XG4gICAgICB0aGlzLl9kZWZpbml0aW9ucyA9IGRlZmluaXRpb25zO1xuXG4gICAgICBjb25zdCBhY3RpdmVBcHBsaWNhYmxlID0gYXBwbGljYWJsZS5maWx0ZXIoZCA9PiBkLmFjdGl2ZSk7XG4gICAgICBpZiAoYWN0aXZlQXBwbGljYWJsZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuX2xhc3RTZWxlY3RlZCA9IGFjdGl2ZUFwcGxpY2FibGUubWFwKGQgPT4gZC5uYW1lKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChORVdfREVGSU5JVElPTlNfRVZFTlQsIHthcHBsaWNhYmxlLCBub3RBcHBsaWNhYmxlfSk7XG5cbiAgICAgIHRoaXMuX3VwZGF0ZUN1cnJlbnRXb3JraW5nU2V0KGFjdGl2ZUFwcGxpY2FibGUpO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVDdXJyZW50V29ya2luZ1NldChhY3RpdmVBcHBsaWNhYmxlOiBBcnJheTxXb3JraW5nU2V0RGVmaW5pdGlvbj4pOiB2b2lkIHtcbiAgICBjb25zdCBjb21iaW5lZFVyaXMgPSBbXS5jb25jYXQoXG4gICAgICAuLi5hY3RpdmVBcHBsaWNhYmxlLm1hcChkID0+IGQudXJpcylcbiAgICApO1xuXG4gICAgY29uc3QgbmV3V29ya2luZ1NldCA9IG5ldyBXb3JraW5nU2V0KGNvbWJpbmVkVXJpcyk7XG4gICAgaWYgKCF0aGlzLl9jdXJyZW50LmVxdWFscyhuZXdXb3JraW5nU2V0KSkge1xuICAgICAgdGhpcy5fY3VycmVudCA9IG5ld1dvcmtpbmdTZXQ7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoTkVXX1dPUktJTkdfU0VUX0VWRU5ULCBuZXdXb3JraW5nU2V0KTtcbiAgICB9XG4gIH1cblxuICBfc2F2ZURlZmluaXRpb24obmFtZTogc3RyaW5nLCBuZXdOYW1lOiBzdHJpbmcsIHdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQpOiB2b2lkIHtcbiAgICBjb25zdCBkZWZpbml0aW9ucyA9IHRoaXMuZ2V0RGVmaW5pdGlvbnMoKTtcblxuICAgIGxldCBuYW1lSW5kZXggPSAtMTtcbiAgICBkZWZpbml0aW9ucy5mb3JFYWNoKChkLCBpKSA9PiB7XG4gICAgICBpZiAoZC5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgIG5hbWVJbmRleCA9IGk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgbmV3RGVmaW5pdGlvbnM7XG4gICAgaWYgKG5hbWVJbmRleCA8IDApIHtcbiAgICAgIHRyYWNrKCd3b3JraW5nLXNldHMtY3JlYXRlJywge25hbWUsIHVyaXM6IHdvcmtpbmdTZXQuZ2V0VXJpcygpLmpvaW4oJywnKX0pO1xuXG4gICAgICBuZXdEZWZpbml0aW9ucyA9IGRlZmluaXRpb25zLmNvbmNhdCh7bmFtZSwgdXJpczogd29ya2luZ1NldC5nZXRVcmlzKCksIGFjdGl2ZTogZmFsc2V9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJhY2soXG4gICAgICAgICd3b3JraW5nLXNldHMtdXBkYXRlJyxcbiAgICAgICAge29sZE5hbWU6IG5hbWUsIG5hbWU6IG5ld05hbWUsIHVyaXM6IHdvcmtpbmdTZXQuZ2V0VXJpcygpLmpvaW4oJywnKX0sXG4gICAgICApO1xuXG4gICAgICBjb25zdCBhY3RpdmUgPSBkZWZpbml0aW9uc1tuYW1lSW5kZXhdLmFjdGl2ZTtcbiAgICAgIG5ld0RlZmluaXRpb25zID0gW10uY29uY2F0KFxuICAgICAgICBkZWZpbml0aW9ucy5zbGljZSgwLCBuYW1lSW5kZXgpLFxuICAgICAgICB7bmFtZTogbmV3TmFtZSwgdXJpczogd29ya2luZ1NldC5nZXRVcmlzKCksIGFjdGl2ZX0sXG4gICAgICAgIGRlZmluaXRpb25zLnNsaWNlKG5hbWVJbmRleCArIDEpLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLl9zYXZlRGVmaW5pdGlvbnMobmV3RGVmaW5pdGlvbnMpO1xuICB9XG5cbiAgX2FjdGl2YXRlRGVmaW5pdGlvbihuYW1lOiBzdHJpbmcsIGFjdGl2ZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRyYWNrKCd3b3JraW5nLXNldHMtYWN0aXZhdGUnLCB7bmFtZSwgYWN0aXZlOiBhY3RpdmUudG9TdHJpbmcoKX0pO1xuXG4gICAgY29uc3QgZGVmaW5pdGlvbnMgPSB0aGlzLmdldERlZmluaXRpb25zKCk7XG4gICAgY29uc3QgbmV3RGVmaW5pdGlvbnMgPSBkZWZpbml0aW9ucy5tYXAoZCA9PiB7XG4gICAgICBpZiAoZC5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgIGQuYWN0aXZlID0gYWN0aXZlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZDtcbiAgICB9KTtcbiAgICB0aGlzLl9zYXZlRGVmaW5pdGlvbnMobmV3RGVmaW5pdGlvbnMpO1xuICB9XG5cbiAgZGVhY3RpdmF0ZUFsbCgpOiB2b2lkIHtcbiAgICBjb25zdCBkZWZpbml0aW9ucyA9IHRoaXMuZ2V0RGVmaW5pdGlvbnMoKS5tYXAoZCA9PiB7XG4gICAgICBpZiAoIXRoaXMuX2lzQXBwbGljYWJsZShkKSkge1xuICAgICAgICByZXR1cm4gZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHsuLi5kLCBhY3RpdmU6IGZhbHNlfTtcbiAgICB9KTtcbiAgICB0aGlzLl9zYXZlRGVmaW5pdGlvbnMoZGVmaW5pdGlvbnMpO1xuICB9XG5cbiAgdG9nZ2xlTGFzdFNlbGVjdGVkKCk6IHZvaWQge1xuICAgIHRyYWNrKCd3b3JraW5nLXNldHMtdG9nZ2xlLWxhc3Qtc2VsZWN0ZWQnKTtcblxuICAgIGlmICh0aGlzLmdldEFwcGxpY2FibGVEZWZpbml0aW9ucygpLnNvbWUoZCA9PiBkLmFjdGl2ZSkpIHtcbiAgICAgIHRoaXMuZGVhY3RpdmF0ZUFsbCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBuZXdEZWZpbml0aW9ucyA9IHRoaXMuZ2V0RGVmaW5pdGlvbnMoKS5tYXAoZCA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uZCxcbiAgICAgICAgICBhY3RpdmU6IGQuYWN0aXZlIHx8IHRoaXMuX2xhc3RTZWxlY3RlZC5pbmRleE9mKGQubmFtZSkgPiAtMSxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fc2F2ZURlZmluaXRpb25zKG5ld0RlZmluaXRpb25zKTtcbiAgICB9XG4gIH1cblxuICBfc2F2ZURlZmluaXRpb25zKGRlZmluaXRpb25zOiBBcnJheTxXb3JraW5nU2V0RGVmaW5pdGlvbj4pOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoU0FWRV9ERUZJTklUSU9OU19FVkVOVCwgZGVmaW5pdGlvbnMpO1xuICB9XG5cbiAgX3NvcnRPdXRBcHBsaWNhYmlsaXR5KGRlZmluaXRpb25zOiBBcnJheTxXb3JraW5nU2V0RGVmaW5pdGlvbj4pOiBBcHBsaWNhYmlsaXR5U29ydGVkRGVmaW5pdGlvbnMge1xuICAgIGNvbnN0IGFwcGxpY2FibGUgPSBbXTtcbiAgICBjb25zdCBub3RBcHBsaWNhYmxlID0gW107XG5cbiAgICBkZWZpbml0aW9ucy5mb3JFYWNoKGRlZiA9PiB7XG4gICAgICBpZiAodGhpcy5faXNBcHBsaWNhYmxlKGRlZikpIHtcbiAgICAgICAgYXBwbGljYWJsZS5wdXNoKGRlZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub3RBcHBsaWNhYmxlLnB1c2goZGVmKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB7YXBwbGljYWJsZSwgbm90QXBwbGljYWJsZX07XG4gIH1cblxuICBfaXNBcHBsaWNhYmxlKGRlZmluaXRpb246IFdvcmtpbmdTZXREZWZpbml0aW9uKTogYm9vbGVhbiB7XG4gICAgY29uc3Qgd29ya2luZ1NldCA9IG5ldyBXb3JraW5nU2V0KGRlZmluaXRpb24udXJpcyk7XG4gICAgY29uc3QgZGlycyA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpLmZpbHRlcihkaXIgPT4ge1xuICAgICAgLy8gQXBwYXJlbnRseSBzb21ldGltZXMgQXRvbSBzdXBwbGllcyBhbiBpbnZhbGlkIGRpcmVjdG9yeSwgb3IgYSBkaXJlY3Rvcnkgd2l0aCBhblxuICAgICAgLy8gaW52YWxpZCBwYXRocy4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9udWNsaWRlL2lzc3Vlcy80MTZcbiAgICAgIGlmIChkaXIgPT0gbnVsbCkge1xuICAgICAgICBjb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuICAgICAgICBsb2dnZXIud2FybignUmVjZWl2ZWQgYSBudWxsIGRpcmVjdG9yeSBmcm9tIEF0b20nKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgbm9ybWFsaXplUGF0aFVyaShkaXIuZ2V0UGF0aCgpKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG4gICAgICAgIGxvZ2dlci53YXJuKCdGYWlsZWQgdG8gcGFyc2UgcGF0aCBzdXBwbGllZCBieSBBdG9tJywgZGlyLmdldFBhdGgoKSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBkaXJzLnNvbWUoZGlyID0+IHdvcmtpbmdTZXQuY29udGFpbnNEaXIoZGlyLmdldFBhdGgoKSkpO1xuICB9XG59XG4iXX0=