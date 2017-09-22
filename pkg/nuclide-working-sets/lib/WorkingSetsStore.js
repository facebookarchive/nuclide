'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkingSetsStore = undefined;

var _atom = require('atom');

var _nuclideWorkingSetsCommon;

function _load_nuclideWorkingSetsCommon() {
  return _nuclideWorkingSetsCommon = require('../../nuclide-working-sets-common');
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const NEW_WORKING_SET_EVENT = 'new-working-set';
const NEW_DEFINITIONS_EVENT = 'new-definitions';
const SAVE_DEFINITIONS_EVENT = 'save-definitions';

class WorkingSetsStore {

  constructor() {
    this._emitter = new _atom.Emitter();
    this._current = new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet();
    this._definitions = [];
    this._applicableDefinitions = [];
    this._notApplicableDefinitions = [];
    this._prevCombinedUris = [];
    this._lastSelected = [];
  }

  getCurrent() {
    return this._current;
  }

  getDefinitions() {
    return this._definitions;
  }

  getApplicableDefinitions() {
    return this._applicableDefinitions;
  }

  getNotApplicableDefinitions() {
    return this._notApplicableDefinitions;
  }

  subscribeToCurrent(callback) {
    return this._emitter.on(NEW_WORKING_SET_EVENT, callback);
  }

  subscribeToDefinitions(callback) {
    return this._emitter.on(NEW_DEFINITIONS_EVENT, callback);
  }

  onSaveDefinitions(callback) {
    return this._emitter.on(SAVE_DEFINITIONS_EVENT, callback);
  }

  updateDefinitions(definitions) {
    const { applicable, notApplicable } = this._sortOutApplicability(definitions);
    this._setDefinitions(applicable, notApplicable, definitions);
  }

  updateApplicability() {
    const { applicable, notApplicable } = this._sortOutApplicability(this._definitions);
    this._setDefinitions(applicable, notApplicable, this._definitions);
  }

  saveWorkingSet(name, workingSet) {
    this._saveDefinition(name, name, workingSet);
  }

  update(name, newName, workingSet) {
    this._saveDefinition(name, newName, workingSet);
  }

  activate(name) {
    this._activateDefinition(name, /* active */true);
  }

  deactivate(name) {
    this._activateDefinition(name, /* active */false);
  }

  deleteWorkingSet(name) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('working-sets-delete', { name });

    const definitions = this._definitions.filter(d => d.name !== name);
    this._saveDefinitions(definitions);
  }

  _setDefinitions(applicable, notApplicable, definitions) {
    const somethingHasChanged = !(0, (_collection || _load_collection()).arrayEqual)(this._applicableDefinitions, applicable) || !(0, (_collection || _load_collection()).arrayEqual)(this._notApplicableDefinitions, notApplicable);

    if (somethingHasChanged) {
      this._applicableDefinitions = applicable;
      this._notApplicableDefinitions = notApplicable;
      this._definitions = definitions;

      const activeApplicable = applicable.filter(d => d.active);
      if (activeApplicable.length > 0) {
        this._lastSelected = activeApplicable.map(d => d.name);
      }
      this._emitter.emit(NEW_DEFINITIONS_EVENT, { applicable, notApplicable });

      this._updateCurrentWorkingSet(activeApplicable);
    }
  }

  _updateCurrentWorkingSet(activeApplicable) {
    const combinedUris = [].concat(...activeApplicable.map(d => d.uris));

    const newWorkingSet = new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet(combinedUris);
    if (!this._current.equals(newWorkingSet)) {
      this._current = newWorkingSet;
      this._emitter.emit(NEW_WORKING_SET_EVENT, newWorkingSet);
    }
  }

  _saveDefinition(name, newName, workingSet) {
    const definitions = this.getDefinitions();

    let nameIndex = -1;
    definitions.forEach((d, i) => {
      if (d.name === name) {
        nameIndex = i;
      }
    });

    let newDefinitions;
    if (nameIndex < 0) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('working-sets-create', {
        name,
        uris: workingSet.getUris().join(',')
      });

      newDefinitions = definitions.concat({
        name,
        uris: workingSet.getUris(),
        active: false
      });
    } else {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('working-sets-update', {
        oldName: name,
        name: newName,
        uris: workingSet.getUris().join(',')
      });

      const active = definitions[nameIndex].active;
      newDefinitions = [].concat(definitions.slice(0, nameIndex), { name: newName, uris: workingSet.getUris(), active }, definitions.slice(nameIndex + 1));
    }

    this._saveDefinitions(newDefinitions);
  }

  _activateDefinition(name, active) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('working-sets-activate', { name, active: active.toString() });

    const definitions = this.getDefinitions();
    const newDefinitions = definitions.map(d => {
      if (d.name === name) {
        d.active = active;
      }

      return d;
    });
    this._saveDefinitions(newDefinitions);
  }

  deactivateAll() {
    const definitions = this.getDefinitions().map(d => {
      if (!this._isApplicable(d)) {
        return d;
      }

      return Object.assign({}, d, { active: false });
    });
    this._saveDefinitions(definitions);
  }

  toggleLastSelected() {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('working-sets-toggle-last-selected');

    if (this.getApplicableDefinitions().some(d => d.active)) {
      this.deactivateAll();
    } else {
      const newDefinitions = this.getDefinitions().map(d => {
        return Object.assign({}, d, {
          active: d.active || this._lastSelected.indexOf(d.name) > -1
        });
      });
      this._saveDefinitions(newDefinitions);
    }
  }

  _saveDefinitions(definitions) {
    this._emitter.emit(SAVE_DEFINITIONS_EVENT, definitions);
  }

  _sortOutApplicability(definitions) {
    const applicable = [];
    const notApplicable = [];

    definitions.forEach(def => {
      if (this._isApplicable(def)) {
        applicable.push(def);
      } else {
        notApplicable.push(def);
      }
    });

    return { applicable, notApplicable };
  }

  _isApplicable(definition) {
    const workingSet = new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet(definition.uris);
    const dirs = atom.project.getDirectories().filter(dir => {
      // Apparently sometimes Atom supplies an invalid directory, or a directory with an
      // invalid paths. See https://github.com/facebook/nuclide/issues/416
      if (dir == null) {
        const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-working-sets');

        logger.warn('Received a null directory from Atom');
        return false;
      }
      try {
        (_nuclideUri || _load_nuclideUri()).default.parse(dir.getPath());
        return true;
      } catch (e) {
        const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-working-sets');

        logger.warn('Failed to parse path supplied by Atom', dir.getPath());
        return false;
      }
    });

    return dirs.some(dir => workingSet.containsDir(dir.getPath()));
  }
}
exports.WorkingSetsStore = WorkingSetsStore;