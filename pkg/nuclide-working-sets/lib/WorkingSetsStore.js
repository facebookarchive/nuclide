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
//# sourceMappingURL=data:application/json;base64,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RixDQUFDLENBQUM7O0FBRUgsYUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQUEsR0FBRztlQUFJLFVBQVUsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQ2hFOzs7U0EzT1UsZ0JBQWdCIiwiZmlsZSI6IldvcmtpbmdTZXRzU3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtXb3JraW5nU2V0fSBmcm9tICcuL1dvcmtpbmdTZXQnO1xuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7bm9ybWFsaXplUGF0aFVyaX0gZnJvbSAnLi91cmknO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5cbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0RGVmaW5pdGlvbn0gZnJvbSAnLi4nO1xuXG5leHBvcnQgdHlwZSBBcHBsaWNhYmlsaXR5U29ydGVkRGVmaW5pdGlvbnMgPSB7XG4gIGFwcGxpY2FibGU6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPjtcbiAgbm90QXBwbGljYWJsZTogQXJyYXk8V29ya2luZ1NldERlZmluaXRpb24+O1xufVxuXG5jb25zdCBORVdfV09SS0lOR19TRVRfRVZFTlQgPSAnbmV3LXdvcmtpbmctc2V0JztcbmNvbnN0IE5FV19ERUZJTklUSU9OU19FVkVOVCA9ICduZXctZGVmaW5pdGlvbnMnO1xuY29uc3QgU0FWRV9ERUZJTklUSU9OU19FVkVOVCA9ICdzYXZlLWRlZmluaXRpb25zJztcblxuZXhwb3J0IGNsYXNzIFdvcmtpbmdTZXRzU3RvcmUge1xuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX2N1cnJlbnQ6IFdvcmtpbmdTZXQ7XG4gIF9kZWZpbml0aW9uczogQXJyYXk8V29ya2luZ1NldERlZmluaXRpb24+O1xuICBfYXBwbGljYWJsZURlZmluaXRpb25zOiBBcnJheTxXb3JraW5nU2V0RGVmaW5pdGlvbj47XG4gIF9ub3RBcHBsaWNhYmxlRGVmaW5pdGlvbnM6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPjtcbiAgX3ByZXZDb21iaW5lZFVyaXM6IEFycmF5PHN0cmluZz47XG4gIF9sYXN0U2VsZWN0ZWQ6IEFycmF5PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fY3VycmVudCA9IG5ldyBXb3JraW5nU2V0KCk7XG4gICAgdGhpcy5fZGVmaW5pdGlvbnMgPSBbXTtcbiAgICB0aGlzLl9hcHBsaWNhYmxlRGVmaW5pdGlvbnMgPSBbXTtcbiAgICB0aGlzLl9ub3RBcHBsaWNhYmxlRGVmaW5pdGlvbnMgPSBbXTtcbiAgICB0aGlzLl9wcmV2Q29tYmluZWRVcmlzID0gW107XG4gICAgdGhpcy5fbGFzdFNlbGVjdGVkID0gW107XG4gIH1cblxuICBnZXRDdXJyZW50KCk6IFdvcmtpbmdTZXQge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50O1xuICB9XG5cbiAgZ2V0RGVmaW5pdGlvbnMoKTogQXJyYXk8V29ya2luZ1NldERlZmluaXRpb24+IHtcbiAgICByZXR1cm4gdGhpcy5fZGVmaW5pdGlvbnM7XG4gIH1cblxuICBnZXRBcHBsaWNhYmxlRGVmaW5pdGlvbnMoKTogQXJyYXk8V29ya2luZ1NldERlZmluaXRpb24+IHtcbiAgICByZXR1cm4gdGhpcy5fYXBwbGljYWJsZURlZmluaXRpb25zO1xuICB9XG5cbiAgZ2V0Tm90QXBwbGljYWJsZURlZmluaXRpb25zKCk6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPiB7XG4gICAgcmV0dXJuIHRoaXMuX25vdEFwcGxpY2FibGVEZWZpbml0aW9ucztcbiAgfVxuXG4gIHN1YnNjcmliZVRvQ3VycmVudChjYWxsYmFjazogKGN1cnJlbnQ6IFdvcmtpbmdTZXQpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oTkVXX1dPUktJTkdfU0VUX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBzdWJzY3JpYmVUb0RlZmluaXRpb25zKFxuICAgIGNhbGxiYWNrOiAoZGVmaW5pdGlvbnM6IEFwcGxpY2FiaWxpdHlTb3J0ZWREZWZpbml0aW9ucykgPT4gbWl4ZWRcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKE5FV19ERUZJTklUSU9OU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25TYXZlRGVmaW5pdGlvbnMoXG4gICAgY2FsbGJhY2s6IChkZWZpbml0aW9uczogQXJyYXk8V29ya2luZ1NldERlZmluaXRpb24+KSA9PiBtaXhlZFxuICApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oU0FWRV9ERUZJTklUSU9OU19FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgdXBkYXRlRGVmaW5pdGlvbnMoZGVmaW5pdGlvbnM6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPik6IHZvaWQge1xuICAgIGNvbnN0IHthcHBsaWNhYmxlLCBub3RBcHBsaWNhYmxlfSA9IHRoaXMuX3NvcnRPdXRBcHBsaWNhYmlsaXR5KGRlZmluaXRpb25zKTtcbiAgICB0aGlzLl9zZXREZWZpbml0aW9ucyhhcHBsaWNhYmxlLCBub3RBcHBsaWNhYmxlLCBkZWZpbml0aW9ucyk7XG4gIH1cblxuICB1cGRhdGVBcHBsaWNhYmlsaXR5KCk6IHZvaWQge1xuICAgIGNvbnN0IHthcHBsaWNhYmxlLCBub3RBcHBsaWNhYmxlfSA9IHRoaXMuX3NvcnRPdXRBcHBsaWNhYmlsaXR5KHRoaXMuX2RlZmluaXRpb25zKTtcbiAgICB0aGlzLl9zZXREZWZpbml0aW9ucyhhcHBsaWNhYmxlLCBub3RBcHBsaWNhYmxlLCB0aGlzLl9kZWZpbml0aW9ucyk7XG4gIH1cblxuICBzYXZlV29ya2luZ1NldChuYW1lOiBzdHJpbmcsIHdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQpOiB2b2lkIHtcbiAgICB0aGlzLl9zYXZlRGVmaW5pdGlvbihuYW1lLCBuYW1lLCB3b3JraW5nU2V0KTtcbiAgfVxuXG4gIHVwZGF0ZShuYW1lOiBzdHJpbmcsIG5ld05hbWU6IHN0cmluZywgd29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIHRoaXMuX3NhdmVEZWZpbml0aW9uKG5hbWUsIG5ld05hbWUsIHdvcmtpbmdTZXQpO1xuICB9XG5cbiAgYWN0aXZhdGUobmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aXZhdGVEZWZpbml0aW9uKG5hbWUsIC8qIGFjdGl2ZSAqLyB0cnVlKTtcbiAgfVxuXG4gIGRlYWN0aXZhdGUobmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aXZhdGVEZWZpbml0aW9uKG5hbWUsIC8qIGFjdGl2ZSAqLyBmYWxzZSk7XG4gIH1cblxuICBkZWxldGVXb3JraW5nU2V0KG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRyYWNrKCd3b3JraW5nLXNldHMtZGVsZXRlJywge25hbWV9KTtcblxuICAgIGNvbnN0IGRlZmluaXRpb25zID0gdGhpcy5fZGVmaW5pdGlvbnMuZmlsdGVyKGQgPT4gZC5uYW1lICE9PSBuYW1lKTtcbiAgICB0aGlzLl9zYXZlRGVmaW5pdGlvbnMoZGVmaW5pdGlvbnMpO1xuICB9XG5cbiAgX3NldERlZmluaXRpb25zKFxuICAgIGFwcGxpY2FibGU6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPixcbiAgICBub3RBcHBsaWNhYmxlOiBBcnJheTxXb3JraW5nU2V0RGVmaW5pdGlvbj4sXG4gICAgZGVmaW5pdGlvbnM6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPlxuICApOiB2b2lkIHtcbiAgICBjb25zdCBzb21ldGhpbmdIYXNDaGFuZ2VkID1cbiAgICAgICFhcnJheS5lcXVhbCh0aGlzLl9hcHBsaWNhYmxlRGVmaW5pdGlvbnMsIGFwcGxpY2FibGUpIHx8XG4gICAgICAhYXJyYXkuZXF1YWwodGhpcy5fbm90QXBwbGljYWJsZURlZmluaXRpb25zLCBub3RBcHBsaWNhYmxlKTtcblxuICAgIGlmIChzb21ldGhpbmdIYXNDaGFuZ2VkKSB7XG4gICAgICB0aGlzLl9hcHBsaWNhYmxlRGVmaW5pdGlvbnMgPSBhcHBsaWNhYmxlO1xuICAgICAgdGhpcy5fbm90QXBwbGljYWJsZURlZmluaXRpb25zID0gbm90QXBwbGljYWJsZTtcbiAgICAgIHRoaXMuX2RlZmluaXRpb25zID0gZGVmaW5pdGlvbnM7XG5cbiAgICAgIGNvbnN0IGFjdGl2ZUFwcGxpY2FibGUgPSBhcHBsaWNhYmxlLmZpbHRlcihkID0+IGQuYWN0aXZlKTtcbiAgICAgIGlmIChhY3RpdmVBcHBsaWNhYmxlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5fbGFzdFNlbGVjdGVkID0gYWN0aXZlQXBwbGljYWJsZS5tYXAoZCA9PiBkLm5hbWUpO1xuICAgICAgfVxuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KE5FV19ERUZJTklUSU9OU19FVkVOVCwge2FwcGxpY2FibGUsIG5vdEFwcGxpY2FibGV9KTtcblxuICAgICAgdGhpcy5fdXBkYXRlQ3VycmVudFdvcmtpbmdTZXQoYWN0aXZlQXBwbGljYWJsZSk7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZUN1cnJlbnRXb3JraW5nU2V0KGFjdGl2ZUFwcGxpY2FibGU6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPik6IHZvaWQge1xuICAgIGNvbnN0IGNvbWJpbmVkVXJpcyA9IFtdLmNvbmNhdChcbiAgICAgIC4uLmFjdGl2ZUFwcGxpY2FibGUubWFwKGQgPT4gZC51cmlzKVxuICAgICk7XG5cbiAgICBjb25zdCBuZXdXb3JraW5nU2V0ID0gbmV3IFdvcmtpbmdTZXQoY29tYmluZWRVcmlzKTtcbiAgICBpZiAoIXRoaXMuX2N1cnJlbnQuZXF1YWxzKG5ld1dvcmtpbmdTZXQpKSB7XG4gICAgICB0aGlzLl9jdXJyZW50ID0gbmV3V29ya2luZ1NldDtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChORVdfV09SS0lOR19TRVRfRVZFTlQsIG5ld1dvcmtpbmdTZXQpO1xuICAgIH1cbiAgfVxuXG4gIF9zYXZlRGVmaW5pdGlvbihuYW1lOiBzdHJpbmcsIG5ld05hbWU6IHN0cmluZywgd29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIGNvbnN0IGRlZmluaXRpb25zID0gdGhpcy5nZXREZWZpbml0aW9ucygpO1xuXG4gICAgbGV0IG5hbWVJbmRleCA9IC0xO1xuICAgIGRlZmluaXRpb25zLmZvckVhY2goKGQsIGkpID0+IHtcbiAgICAgIGlmIChkLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgbmFtZUluZGV4ID0gaTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGxldCBuZXdEZWZpbml0aW9ucztcbiAgICBpZiAobmFtZUluZGV4IDwgMCkge1xuICAgICAgdHJhY2soJ3dvcmtpbmctc2V0cy1jcmVhdGUnLCB7bmFtZSwgdXJpczogd29ya2luZ1NldC5nZXRVcmlzKCkuam9pbignLCcpfSk7XG5cbiAgICAgIG5ld0RlZmluaXRpb25zID0gZGVmaW5pdGlvbnMuY29uY2F0KHtuYW1lLCB1cmlzOiB3b3JraW5nU2V0LmdldFVyaXMoKSwgYWN0aXZlOiBmYWxzZX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0cmFjayhcbiAgICAgICAgJ3dvcmtpbmctc2V0cy11cGRhdGUnLFxuICAgICAgICB7b2xkTmFtZTogbmFtZSwgbmFtZTogbmV3TmFtZSwgdXJpczogd29ya2luZ1NldC5nZXRVcmlzKCkuam9pbignLCcpfSxcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IGFjdGl2ZSA9IGRlZmluaXRpb25zW25hbWVJbmRleF0uYWN0aXZlO1xuICAgICAgbmV3RGVmaW5pdGlvbnMgPSBbXS5jb25jYXQoXG4gICAgICAgIGRlZmluaXRpb25zLnNsaWNlKDAsIG5hbWVJbmRleCksXG4gICAgICAgIHtuYW1lOiBuZXdOYW1lLCB1cmlzOiB3b3JraW5nU2V0LmdldFVyaXMoKSwgYWN0aXZlfSxcbiAgICAgICAgZGVmaW5pdGlvbnMuc2xpY2UobmFtZUluZGV4ICsgMSksXG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMuX3NhdmVEZWZpbml0aW9ucyhuZXdEZWZpbml0aW9ucyk7XG4gIH1cblxuICBfYWN0aXZhdGVEZWZpbml0aW9uKG5hbWU6IHN0cmluZywgYWN0aXZlOiBib29sZWFuKTogdm9pZCB7XG4gICAgdHJhY2soJ3dvcmtpbmctc2V0cy1hY3RpdmF0ZScsIHtuYW1lLCBhY3RpdmU6IGFjdGl2ZS50b1N0cmluZygpfSk7XG5cbiAgICBjb25zdCBkZWZpbml0aW9ucyA9IHRoaXMuZ2V0RGVmaW5pdGlvbnMoKTtcbiAgICBjb25zdCBuZXdEZWZpbml0aW9ucyA9IGRlZmluaXRpb25zLm1hcChkID0+IHtcbiAgICAgIGlmIChkLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgZC5hY3RpdmUgPSBhY3RpdmU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkO1xuICAgIH0pO1xuICAgIHRoaXMuX3NhdmVEZWZpbml0aW9ucyhuZXdEZWZpbml0aW9ucyk7XG4gIH1cblxuICBkZWFjdGl2YXRlQWxsKCk6IHZvaWQge1xuICAgIGNvbnN0IGRlZmluaXRpb25zID0gdGhpcy5nZXREZWZpbml0aW9ucygpLm1hcChkID0+IHtcbiAgICAgIGlmICghdGhpcy5faXNBcHBsaWNhYmxlKGQpKSB7XG4gICAgICAgIHJldHVybiBkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gey4uLmQsIGFjdGl2ZTogZmFsc2V9O1xuICAgIH0pO1xuICAgIHRoaXMuX3NhdmVEZWZpbml0aW9ucyhkZWZpbml0aW9ucyk7XG4gIH1cblxuICB0b2dnbGVMYXN0U2VsZWN0ZWQoKTogdm9pZCB7XG4gICAgdHJhY2soJ3dvcmtpbmctc2V0cy10b2dnbGUtbGFzdC1zZWxlY3RlZCcpO1xuXG4gICAgaWYgKHRoaXMuZ2V0QXBwbGljYWJsZURlZmluaXRpb25zKCkuc29tZShkID0+IGQuYWN0aXZlKSkge1xuICAgICAgdGhpcy5kZWFjdGl2YXRlQWxsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG5ld0RlZmluaXRpb25zID0gdGhpcy5nZXREZWZpbml0aW9ucygpLm1hcChkID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5kLFxuICAgICAgICAgIGFjdGl2ZTogZC5hY3RpdmUgfHwgdGhpcy5fbGFzdFNlbGVjdGVkLmluZGV4T2YoZC5uYW1lKSA+IC0xLFxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9zYXZlRGVmaW5pdGlvbnMobmV3RGVmaW5pdGlvbnMpO1xuICAgIH1cbiAgfVxuXG4gIF9zYXZlRGVmaW5pdGlvbnMoZGVmaW5pdGlvbnM6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPik6IHZvaWQge1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChTQVZFX0RFRklOSVRJT05TX0VWRU5ULCBkZWZpbml0aW9ucyk7XG4gIH1cblxuICBfc29ydE91dEFwcGxpY2FiaWxpdHkoZGVmaW5pdGlvbnM6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPik6IEFwcGxpY2FiaWxpdHlTb3J0ZWREZWZpbml0aW9ucyB7XG4gICAgY29uc3QgYXBwbGljYWJsZSA9IFtdO1xuICAgIGNvbnN0IG5vdEFwcGxpY2FibGUgPSBbXTtcblxuICAgIGRlZmluaXRpb25zLmZvckVhY2goZGVmID0+IHtcbiAgICAgIGlmICh0aGlzLl9pc0FwcGxpY2FibGUoZGVmKSkge1xuICAgICAgICBhcHBsaWNhYmxlLnB1c2goZGVmKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vdEFwcGxpY2FibGUucHVzaChkZWYpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHthcHBsaWNhYmxlLCBub3RBcHBsaWNhYmxlfTtcbiAgfVxuXG4gIF9pc0FwcGxpY2FibGUoZGVmaW5pdGlvbjogV29ya2luZ1NldERlZmluaXRpb24pOiBib29sZWFuIHtcbiAgICBjb25zdCB3b3JraW5nU2V0ID0gbmV3IFdvcmtpbmdTZXQoZGVmaW5pdGlvbi51cmlzKTtcbiAgICBjb25zdCBkaXJzID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKCkuZmlsdGVyKGRpciA9PiB7XG4gICAgICAvLyBBcHBhcmVudGx5IHNvbWV0aW1lcyBBdG9tIHN1cHBsaWVzIGFuIGludmFsaWQgZGlyZWN0b3J5LCBvciBhIGRpcmVjdG9yeSB3aXRoIGFuXG4gICAgICAvLyBpbnZhbGlkIHBhdGhzLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL251Y2xpZGUvaXNzdWVzLzQxNlxuICAgICAgaWYgKGRpciA9PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG4gICAgICAgIGxvZ2dlci53YXJuKCdSZWNlaXZlZCBhIG51bGwgZGlyZWN0b3J5IGZyb20gQXRvbScpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBub3JtYWxpemVQYXRoVXJpKGRpci5nZXRQYXRoKCkpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbiAgICAgICAgbG9nZ2VyLndhcm4oJ0ZhaWxlZCB0byBwYXJzZSBwYXRoIHN1cHBsaWVkIGJ5IEF0b20nLCBkaXIuZ2V0UGF0aCgpKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGRpcnMuc29tZShkaXIgPT4gd29ya2luZ1NldC5jb250YWluc0RpcihkaXIuZ2V0UGF0aCgpKSk7XG4gIH1cbn1cbiJdfQ==