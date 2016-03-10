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

var _commons = require('../../commons');

var _analytics = require('../../analytics');

var NEW_WORKING_SET_EVENT = 'new-working-set';
var NEW_DEFINITIONS_EVENT = 'new-definitions';
var SAVE_DEFINITIONS_EVENT = 'save-definitions';

var WorkingSetsStore = (function () {
  function WorkingSetsStore() {
    _classCallCheck(this, WorkingSetsStore);

    this._emitter = new _atom.Emitter();
    this._current = new _WorkingSet.WorkingSet();
    this._definitions = [];
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
      var _ref;

      var activeDefinitions = definitions.filter(function (d) {
        return d.active;
      });
      if (activeDefinitions.length > 0) {
        this._lastSelected = activeDefinitions.map(function (d) {
          return d.name;
        });
      }
      var combinedUris = (_ref = []).concat.apply(_ref, _toConsumableArray(activeDefinitions.map(function (d) {
        return d.uris;
      })));
      combinedUris.sort();

      var invisibleChange = _commons.array.equal(combinedUris, this._prevCombinedUris);
      this._prevCombinedUris = combinedUris;

      // Do not fire an update event if the change is of a cosmetical nature. Such as order in UI.
      if (!invisibleChange) {
        (0, _analytics.track)('working-sets-applying-definitions', { uris: combinedUris.join(',') });

        var workingSet = new _WorkingSet.WorkingSet(combinedUris);
        this._updateCurrent(workingSet);
      }

      this._definitions = definitions;
      this._emitter.emit(NEW_DEFINITIONS_EVENT, definitions);
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
      (0, _analytics.track)('working-sets-delete', { name: name });

      var definitions = this._definitions.filter(function (d) {
        return d.name !== name;
      });
      this._saveDefinitions(definitions);
    }
  }, {
    key: '_updateCurrent',
    value: function _updateCurrent(newSet) {
      this._current = newSet;
      this._emitter.emit(NEW_WORKING_SET_EVENT, newSet);
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
        (0, _analytics.track)('working-sets-create', { name: name, uris: workingSet.getUris().join(',') });

        newDefinitions = definitions.concat({ name: name, uris: workingSet.getUris(), active: false });
      } else {
        (0, _analytics.track)('working-sets-update', { oldName: name, name: newName, uris: workingSet.getUris().join(',') });

        var active = definitions[nameIndex].active;
        newDefinitions = [].concat(definitions.slice(0, nameIndex), { name: newName, uris: workingSet.getUris(), active: active }, definitions.slice(nameIndex + 1));
      }

      this._saveDefinitions(newDefinitions);
    }
  }, {
    key: '_activateDefinition',
    value: function _activateDefinition(name, active) {
      (0, _analytics.track)('working-sets-activate', { name: name, active: active.toString() });

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
      var definitions = this.getDefinitions().map(function (d) {
        return _extends({}, d, { active: false });
      });
      this._saveDefinitions(definitions);
    }
  }, {
    key: 'toggleLastSelected',
    value: function toggleLastSelected() {
      var _this = this;

      (0, _analytics.track)('working-sets-toggle-last-selected');

      if (this.getDefinitions().some(function (d) {
        return d.active;
      })) {
        this.deactivateAll();
      } else {
        var newDefinitions = this.getDefinitions().map(function (d) {
          return _extends({}, d, {
            active: _this._lastSelected.indexOf(d.name) > -1
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
  }]);

  return WorkingSetsStore;
})();

exports.WorkingSetsStore = WorkingSetsStore;
//# sourceMappingURL=data:application/json;base64,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QixDQUFDLGNBQWMsQ0FBQyxDQUFDO09BQ3ZDO0tBQ0Y7OztXQUVlLDBCQUFDLFdBQXdDLEVBQVE7QUFDL0QsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsV0FBVyxDQUFDLENBQUM7S0FDekQ7OztTQWpLVSxnQkFBZ0IiLCJmaWxlIjoiV29ya2luZ1NldHNTdG9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7RW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1dvcmtpbmdTZXR9IGZyb20gJy4vV29ya2luZ1NldCc7XG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5cbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0RGVmaW5pdGlvbn0gZnJvbSAnLi9tYWluJztcblxuY29uc3QgTkVXX1dPUktJTkdfU0VUX0VWRU5UID0gJ25ldy13b3JraW5nLXNldCc7XG5jb25zdCBORVdfREVGSU5JVElPTlNfRVZFTlQgPSAnbmV3LWRlZmluaXRpb25zJztcbmNvbnN0IFNBVkVfREVGSU5JVElPTlNfRVZFTlQgPSAnc2F2ZS1kZWZpbml0aW9ucyc7XG5cbmV4cG9ydCBjbGFzcyBXb3JraW5nU2V0c1N0b3JlIHtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9jdXJyZW50OiBXb3JraW5nU2V0O1xuICBfZGVmaW5pdGlvbnM6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPjtcbiAgX3ByZXZDb21iaW5lZFVyaXM6IEFycmF5PHN0cmluZz47XG4gIF9sYXN0U2VsZWN0ZWQ6IEFycmF5PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fY3VycmVudCA9IG5ldyBXb3JraW5nU2V0KCk7XG4gICAgdGhpcy5fZGVmaW5pdGlvbnMgPSBbXTtcbiAgICB0aGlzLl9wcmV2Q29tYmluZWRVcmlzID0gW107XG4gICAgdGhpcy5fbGFzdFNlbGVjdGVkID0gW107XG4gIH1cblxuICBnZXRDdXJyZW50KCk6IFdvcmtpbmdTZXQge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50O1xuICB9XG5cbiAgZ2V0RGVmaW5pdGlvbnMoKTogQXJyYXk8V29ya2luZ1NldERlZmluaXRpb24+IHtcbiAgICByZXR1cm4gdGhpcy5fZGVmaW5pdGlvbnM7XG4gIH1cblxuICBzdWJzY3JpYmVUb0N1cnJlbnQoY2FsbGJhY2s6IChjdXJyZW50OiBXb3JraW5nU2V0KSA9PiB2b2lkKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKE5FV19XT1JLSU5HX1NFVF9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgc3Vic2NyaWJlVG9EZWZpbml0aW9ucyhcbiAgICBjYWxsYmFjazogKGRlZmluaXRpb25zOiBBcnJheTxXb3JraW5nU2V0RGVmaW5pdGlvbj4pID0+IG1peGVkXG4gICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihORVdfREVGSU5JVElPTlNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uU2F2ZURlZmluaXRpb25zKFxuICAgIGNhbGxiYWNrOiAoZGVmaW5pdGlvbnM6IEFycmF5PFdvcmtpbmdTZXREZWZpbml0aW9uPikgPT4gbWl4ZWRcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKFNBVkVfREVGSU5JVElPTlNfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIHVwZGF0ZURlZmluaXRpb25zKGRlZmluaXRpb25zOiBBcnJheTxXb3JraW5nU2V0RGVmaW5pdGlvbj4pOiB2b2lkIHtcbiAgICBjb25zdCBhY3RpdmVEZWZpbml0aW9ucyA9IGRlZmluaXRpb25zLmZpbHRlcihkID0+IGQuYWN0aXZlKTtcbiAgICBpZiAoYWN0aXZlRGVmaW5pdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fbGFzdFNlbGVjdGVkID0gYWN0aXZlRGVmaW5pdGlvbnMubWFwKGQgPT4gZC5uYW1lKTtcbiAgICB9XG4gICAgY29uc3QgY29tYmluZWRVcmlzID0gW10uY29uY2F0KFxuICAgICAgLi4uYWN0aXZlRGVmaW5pdGlvbnMubWFwKGQgPT4gZC51cmlzKVxuICAgICk7XG4gICAgY29tYmluZWRVcmlzLnNvcnQoKTtcblxuICAgIGNvbnN0IGludmlzaWJsZUNoYW5nZSA9IGFycmF5LmVxdWFsKGNvbWJpbmVkVXJpcywgdGhpcy5fcHJldkNvbWJpbmVkVXJpcyk7XG4gICAgdGhpcy5fcHJldkNvbWJpbmVkVXJpcyA9IGNvbWJpbmVkVXJpcztcblxuICAgIC8vIERvIG5vdCBmaXJlIGFuIHVwZGF0ZSBldmVudCBpZiB0aGUgY2hhbmdlIGlzIG9mIGEgY29zbWV0aWNhbCBuYXR1cmUuIFN1Y2ggYXMgb3JkZXIgaW4gVUkuXG4gICAgaWYgKCFpbnZpc2libGVDaGFuZ2UpIHtcbiAgICAgIHRyYWNrKCd3b3JraW5nLXNldHMtYXBwbHlpbmctZGVmaW5pdGlvbnMnLCB7dXJpczogY29tYmluZWRVcmlzLmpvaW4oJywnKX0pO1xuXG4gICAgICBjb25zdCB3b3JraW5nU2V0ID0gbmV3IFdvcmtpbmdTZXQoY29tYmluZWRVcmlzKTtcbiAgICAgIHRoaXMuX3VwZGF0ZUN1cnJlbnQod29ya2luZ1NldCk7XG4gICAgfVxuXG4gICAgdGhpcy5fZGVmaW5pdGlvbnMgPSBkZWZpbml0aW9ucztcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoTkVXX0RFRklOSVRJT05TX0VWRU5ULCBkZWZpbml0aW9ucyk7XG4gIH1cblxuICBzYXZlV29ya2luZ1NldChuYW1lOiBzdHJpbmcsIHdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQpOiB2b2lkIHtcbiAgICB0aGlzLl9zYXZlRGVmaW5pdGlvbihuYW1lLCBuYW1lLCB3b3JraW5nU2V0KTtcbiAgfVxuXG4gIHVwZGF0ZShuYW1lOiBzdHJpbmcsIG5ld05hbWU6IHN0cmluZywgd29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIHRoaXMuX3NhdmVEZWZpbml0aW9uKG5hbWUsIG5ld05hbWUsIHdvcmtpbmdTZXQpO1xuICB9XG5cbiAgYWN0aXZhdGUobmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aXZhdGVEZWZpbml0aW9uKG5hbWUsIC8qIGFjdGl2ZSAqLyB0cnVlKTtcbiAgfVxuXG4gIGRlYWN0aXZhdGUobmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aXZhdGVEZWZpbml0aW9uKG5hbWUsIC8qIGFjdGl2ZSAqLyBmYWxzZSk7XG4gIH1cblxuICBkZWxldGVXb3JraW5nU2V0KG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRyYWNrKCd3b3JraW5nLXNldHMtZGVsZXRlJywge25hbWV9KTtcblxuICAgIGNvbnN0IGRlZmluaXRpb25zID0gdGhpcy5fZGVmaW5pdGlvbnMuZmlsdGVyKGQgPT4gZC5uYW1lICE9PSBuYW1lKTtcbiAgICB0aGlzLl9zYXZlRGVmaW5pdGlvbnMoZGVmaW5pdGlvbnMpO1xuICB9XG5cbiAgX3VwZGF0ZUN1cnJlbnQobmV3U2V0OiBXb3JraW5nU2V0KTogdm9pZCB7XG4gICAgdGhpcy5fY3VycmVudCA9IG5ld1NldDtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoTkVXX1dPUktJTkdfU0VUX0VWRU5ULCBuZXdTZXQpO1xuICB9XG5cbiAgX3NhdmVEZWZpbml0aW9uKG5hbWU6IHN0cmluZywgbmV3TmFtZTogc3RyaW5nLCB3b3JraW5nU2V0OiBXb3JraW5nU2V0KTogdm9pZCB7XG4gICAgY29uc3QgZGVmaW5pdGlvbnMgPSB0aGlzLmdldERlZmluaXRpb25zKCk7XG5cbiAgICBsZXQgbmFtZUluZGV4ID0gLTE7XG4gICAgZGVmaW5pdGlvbnMuZm9yRWFjaCgoZCwgaSkgPT4ge1xuICAgICAgaWYgKGQubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICBuYW1lSW5kZXggPSBpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IG5ld0RlZmluaXRpb25zO1xuICAgIGlmIChuYW1lSW5kZXggPCAwKSB7XG4gICAgICB0cmFjaygnd29ya2luZy1zZXRzLWNyZWF0ZScsIHtuYW1lLCB1cmlzOiB3b3JraW5nU2V0LmdldFVyaXMoKS5qb2luKCcsJyl9KTtcblxuICAgICAgbmV3RGVmaW5pdGlvbnMgPSBkZWZpbml0aW9ucy5jb25jYXQoe25hbWUsIHVyaXM6IHdvcmtpbmdTZXQuZ2V0VXJpcygpLCBhY3RpdmU6IGZhbHNlfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyYWNrKFxuICAgICAgICAnd29ya2luZy1zZXRzLXVwZGF0ZScsXG4gICAgICAgIHtvbGROYW1lOiBuYW1lLCBuYW1lOiBuZXdOYW1lLCB1cmlzOiB3b3JraW5nU2V0LmdldFVyaXMoKS5qb2luKCcsJyl9LFxuICAgICAgKTtcblxuICAgICAgY29uc3QgYWN0aXZlID0gZGVmaW5pdGlvbnNbbmFtZUluZGV4XS5hY3RpdmU7XG4gICAgICBuZXdEZWZpbml0aW9ucyA9IFtdLmNvbmNhdChcbiAgICAgICAgZGVmaW5pdGlvbnMuc2xpY2UoMCwgbmFtZUluZGV4KSxcbiAgICAgICAge25hbWU6IG5ld05hbWUsIHVyaXM6IHdvcmtpbmdTZXQuZ2V0VXJpcygpLCBhY3RpdmV9LFxuICAgICAgICBkZWZpbml0aW9ucy5zbGljZShuYW1lSW5kZXggKyAxKSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhpcy5fc2F2ZURlZmluaXRpb25zKG5ld0RlZmluaXRpb25zKTtcbiAgfVxuXG4gIF9hY3RpdmF0ZURlZmluaXRpb24obmFtZTogc3RyaW5nLCBhY3RpdmU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0cmFjaygnd29ya2luZy1zZXRzLWFjdGl2YXRlJywge25hbWUsIGFjdGl2ZTogYWN0aXZlLnRvU3RyaW5nKCl9KTtcblxuICAgIGNvbnN0IGRlZmluaXRpb25zID0gdGhpcy5nZXREZWZpbml0aW9ucygpO1xuICAgIGNvbnN0IG5ld0RlZmluaXRpb25zID0gZGVmaW5pdGlvbnMubWFwKGQgPT4ge1xuICAgICAgaWYgKGQubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICBkLmFjdGl2ZSA9IGFjdGl2ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGQ7XG4gICAgfSk7XG4gICAgdGhpcy5fc2F2ZURlZmluaXRpb25zKG5ld0RlZmluaXRpb25zKTtcbiAgfVxuXG4gIGRlYWN0aXZhdGVBbGwoKTogdm9pZCB7XG4gICAgY29uc3QgZGVmaW5pdGlvbnMgPSB0aGlzLmdldERlZmluaXRpb25zKCkubWFwKGQgPT4ge3JldHVybiB7Li4uZCwgYWN0aXZlOiBmYWxzZX07fSk7XG4gICAgdGhpcy5fc2F2ZURlZmluaXRpb25zKGRlZmluaXRpb25zKTtcbiAgfVxuXG4gIHRvZ2dsZUxhc3RTZWxlY3RlZCgpOiB2b2lkIHtcbiAgICB0cmFjaygnd29ya2luZy1zZXRzLXRvZ2dsZS1sYXN0LXNlbGVjdGVkJyk7XG5cbiAgICBpZiAodGhpcy5nZXREZWZpbml0aW9ucygpLnNvbWUoZCA9PiBkLmFjdGl2ZSkpIHtcbiAgICAgIHRoaXMuZGVhY3RpdmF0ZUFsbCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBuZXdEZWZpbml0aW9ucyA9IHRoaXMuZ2V0RGVmaW5pdGlvbnMoKS5tYXAoZCA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uZCxcbiAgICAgICAgICBhY3RpdmU6IHRoaXMuX2xhc3RTZWxlY3RlZC5pbmRleE9mKGQubmFtZSkgPiAtMSxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fc2F2ZURlZmluaXRpb25zKG5ld0RlZmluaXRpb25zKTtcbiAgICB9XG4gIH1cblxuICBfc2F2ZURlZmluaXRpb25zKGRlZmluaXRpb25zOiBBcnJheTxXb3JraW5nU2V0RGVmaW5pdGlvbj4pOiB2b2lkIHtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoU0FWRV9ERUZJTklUSU9OU19FVkVOVCwgZGVmaW5pdGlvbnMpO1xuICB9XG59XG4iXX0=