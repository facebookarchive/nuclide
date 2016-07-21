Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _WorkingSet2;

function _WorkingSet() {
  return _WorkingSet2 = require('./WorkingSet');
}

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var NEW_WORKING_SET_EVENT = 'new-working-set';
var NEW_DEFINITIONS_EVENT = 'new-definitions';
var SAVE_DEFINITIONS_EVENT = 'save-definitions';

var WorkingSetsStore = (function () {
  function WorkingSetsStore() {
    _classCallCheck(this, WorkingSetsStore);

    this._emitter = new (_atom2 || _atom()).Emitter();
    this._current = new (_WorkingSet2 || _WorkingSet()).WorkingSet();
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
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('working-sets-delete', { name: name });

      var definitions = this._definitions.filter(function (d) {
        return d.name !== name;
      });
      this._saveDefinitions(definitions);
    }
  }, {
    key: '_setDefinitions',
    value: function _setDefinitions(applicable, notApplicable, definitions) {
      var somethingHasChanged = !(0, (_commonsNodeCollection2 || _commonsNodeCollection()).arrayEqual)(this._applicableDefinitions, applicable) || !(0, (_commonsNodeCollection2 || _commonsNodeCollection()).arrayEqual)(this._notApplicableDefinitions, notApplicable);

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

      var newWorkingSet = new (_WorkingSet2 || _WorkingSet()).WorkingSet(combinedUris);
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
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('working-sets-create', { name: name, uris: workingSet.getUris().join(',') });

        newDefinitions = definitions.concat({ name: name, uris: workingSet.getUris(), active: false });
      } else {
        (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('working-sets-update', { oldName: name, name: newName, uris: workingSet.getUris().join(',') });

        var active = definitions[nameIndex].active;
        newDefinitions = [].concat(definitions.slice(0, nameIndex), { name: newName, uris: workingSet.getUris(), active: active }, definitions.slice(nameIndex + 1));
      }

      this._saveDefinitions(newDefinitions);
    }
  }, {
    key: '_activateDefinition',
    value: function _activateDefinition(name, active) {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('working-sets-activate', { name: name, active: active.toString() });

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

      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('working-sets-toggle-last-selected');

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
      var workingSet = new (_WorkingSet2 || _WorkingSet()).WorkingSet(definition.uris);
      var dirs = atom.project.getDirectories().filter(function (dir) {
        // Apparently sometimes Atom supplies an invalid directory, or a directory with an
        // invalid paths. See https://github.com/facebook/nuclide/issues/416
        if (dir == null) {
          var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

          logger.warn('Received a null directory from Atom');
          return false;
        }
        try {
          (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.parse(dir.getPath());
          return true;
        } catch (e) {
          var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

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