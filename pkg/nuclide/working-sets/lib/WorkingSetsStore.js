'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Emitter} from 'atom';
import {WorkingSet} from './WorkingSet';
import {array} from '../../commons';

import type {WorkingSetDefinition} from './main';

const NEW_WORKING_SET_EVENT = 'new-working-set';
const NEW_DEFINITIONS_EVENT = 'new-definitions';
const SAVE_DEFINITIONS_EVENT = 'save-definitions';

export class WorkingSetsStore {
  _emitter: Emitter;
  _current: WorkingSet;
  _definitions: Array<WorkingSetDefinition>;
  _prevCombinedUris: Array<string>;
  _lastSelected: Array<string>;

  constructor() {
    this._emitter = new Emitter();
    this._current = new WorkingSet();
    this._definitions = [];
    this._prevCombinedUris = [];
    this._lastSelected = [];
  }

  getCurrent(): WorkingSet {
    return this._current;
  }

  getDefinitions(): Array<WorkingSetDefinition> {
    return this._definitions;
  }

  subscribeToCurrent(callback: (current: WorkingSet) => void): IDisposable {
    return this._emitter.on(NEW_WORKING_SET_EVENT, callback);
  }

  subscribeToDefinitions(
    callback: (definitions: Array<WorkingSetDefinition>) => mixed
  ): IDisposable {
    return this._emitter.on(NEW_DEFINITIONS_EVENT, callback);
  }

  onSaveDefinitions(
    callback: (definitions: Array<WorkingSetDefinition>) => mixed
  ): IDisposable {
    return this._emitter.on(SAVE_DEFINITIONS_EVENT, callback);
  }

  updateDefinitions(definitions: Array<WorkingSetDefinition>): void {
    const activeDefinitions = definitions.filter(d => d.active);
    if (activeDefinitions.length > 0) {
      this._lastSelected = activeDefinitions.map(d => d.name);
    }
    const combinedUris = [].concat(
      ...activeDefinitions.map(d => d.uris)
    );
    combinedUris.sort();

    const invisibleChange = array.equal(combinedUris, this._prevCombinedUris);
    this._prevCombinedUris = combinedUris;

    // Do not fire an update event if the change is of a cosmetical nature. Such as order in UI.
    if (!invisibleChange) {
      const workingSet = new WorkingSet(combinedUris);
      this._updateCurrent(workingSet);
    }

    this._definitions = definitions;
    this._emitter.emit(NEW_DEFINITIONS_EVENT, definitions);
  }

  saveWorkingSet(name: string, workingSet: WorkingSet): void {
    this._saveDefinition(name, name, workingSet);
  }

  update(name: string, newName: string, workingSet: WorkingSet): void {
    this._saveDefinition(name, newName, workingSet);
  }

  activate(name: string): void {
    this._activateDefinition(name, /* active */ true);
  }

  deactivate(name: string): void {
    this._activateDefinition(name, /* active */ false);
  }

  deleteWorkingSet(name: string): void {
    const definitions = this._definitions.filter(d => d.name !== name);
    this._saveDefinitions(definitions);
  }

  _updateCurrent(newSet: WorkingSet): void {
    this._current = newSet;
    this._emitter.emit(NEW_WORKING_SET_EVENT, newSet);
  }

  _saveDefinition(name: string, newName: string, workingSet: WorkingSet): void {
    const definitions = this.getDefinitions();

    let nameIndex = -1;
    definitions.forEach((d, i) => {
      if (d.name === name) {
        nameIndex = i;
      }
    });

    let newDefinitions;
    if (nameIndex < 0) {
      newDefinitions = definitions.concat({name, uris: workingSet.getUris(), active: false});
    } else {
      const active = definitions[nameIndex].active;
      newDefinitions = [].concat(
        definitions.slice(0, nameIndex),
        {name: newName, uris: workingSet.getUris(), active},
        definitions.slice(nameIndex + 1),
      );
    }

    this._saveDefinitions(newDefinitions);
  }

  _activateDefinition(name: string, active: boolean): void {
    const definitions = this.getDefinitions();

    const newDefinitions = definitions.map(d => {
      if (d.name === name) {
        d.active = active;
      }

      return d;
    });
    this._saveDefinitions(newDefinitions);
  }

  deactivateAll(): void {
    const definitions = this.getDefinitions().map(d => {return {...d, active: false};});
    this._saveDefinitions(definitions);
  }

  toggleLastSelected(): void {
    if (this.getDefinitions().some(d => d.active)) {
      this.deactivateAll();
    } else {
      const newDefinitions = this.getDefinitions().map(d => {
        return {
          ...d,
          active: this._lastSelected.indexOf(d.name) > -1,
        };
      });
      this._saveDefinitions(newDefinitions);
    }
  }

  _saveDefinitions(definitions: Array<WorkingSetDefinition>): void {
    this._emitter.emit(SAVE_DEFINITIONS_EVENT, definitions);
  }
}
