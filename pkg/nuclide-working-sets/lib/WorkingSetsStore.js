/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {Emitter} from 'atom';
import idx from 'idx';
import {groupBy} from 'lodash';
import memoizeUntilChanged from 'nuclide-commons/memoizeUntilChanged';
import shallowEqual from 'shallowequal';
import {WorkingSet} from '../../nuclide-working-sets-common';
import {arrayEqual} from 'nuclide-commons/collection';
import {track} from '../../nuclide-analytics';
import {getLogger} from 'log4js';
import nuclideUri from 'nuclide-commons/nuclideUri';
import * as ProjectUtils from 'nuclide-commons-atom/ProjectUtils';

import type {WorkingSetDefinition} from './types';

type ApplicabilitySortedDefinitions = {
  applicable: Array<WorkingSetDefinition>,
  notApplicable: Array<WorkingSetDefinition>,
};

const NEW_WORKING_SET_EVENT = 'new-working-set';
const NEW_DEFINITIONS_EVENT = 'new-definitions';
const SAVE_DEFINITIONS_EVENT = 'save-definitions';

export class WorkingSetsStore {
  _emitter: Emitter;
  _activeProjectDefinition: ?WorkingSetDefinition;
  _current: WorkingSet;
  _savedDefinitions: Array<WorkingSetDefinition>;
  _prevApplicability: {|
    applicable: Array<WorkingSetDefinition>,
    notApplicable: Array<WorkingSetDefinition>,
  |};
  _lastSelected: Array<string>;
  _groupByApplicability: typeof groupByApplicability = memoizeUntilChanged(
    groupByApplicability,
    definitions => ({
      definitions,
      // Atom just keeps modifying the same array so we need to make a copy here if we want to
      // compare to a later value.
      projectRoots: atom.project.getDirectories().slice(),
    }),
    (a, b) =>
      arrayEqual(a.definitions, b.definitions) &&
      arrayEqual(a.projectRoots, b.projectRoots),
  );

  constructor() {
    this._emitter = new Emitter();
    this._current = new WorkingSet();
    this._savedDefinitions = [];
    this._prevApplicability = {
      applicable: [],
      notApplicable: [],
    };
    this._lastSelected = [];

    // Don't recompute definitions unless one of the properties it's derived from changes.
    (this: any).getDefinitions = memoizeUntilChanged(
      this.getDefinitions,
      () => [this._savedDefinitions, this._activeProjectDefinition],
    );
  }

  getCurrent(): WorkingSet {
    return this._current;
  }

  getDefinitions(): Array<WorkingSetDefinition> {
    const definitions = this._savedDefinitions.slice();
    if (this._activeProjectDefinition != null) {
      definitions.push(this._activeProjectDefinition);
    }
    return definitions;
  }

  getApplicableDefinitions(): Array<WorkingSetDefinition> {
    return this._groupByApplicability(this.getDefinitions()).applicable;
  }

  getNotApplicableDefinitions(): Array<WorkingSetDefinition> {
    return this._groupByApplicability(this.getDefinitions()).notApplicable;
  }

  subscribeToCurrent(callback: (current: WorkingSet) => void): IDisposable {
    return this._emitter.on(NEW_WORKING_SET_EVENT, callback);
  }

  subscribeToDefinitions(
    callback: (definitions: ApplicabilitySortedDefinitions) => mixed,
  ): IDisposable {
    return this._emitter.on(NEW_DEFINITIONS_EVENT, callback);
  }

  onSaveDefinitions(
    callback: (definitions: Array<WorkingSetDefinition>) => mixed,
  ): IDisposable {
    return this._emitter.on(SAVE_DEFINITIONS_EVENT, callback);
  }

  updateSavedDefinitions(definitions: Array<WorkingSetDefinition>): void {
    if (arrayEqual(this._savedDefinitions, definitions)) {
      return;
    }
    const nextDefinitions = this.getDefinitions()
      .filter(d => d.isActiveProject)
      .concat(...definitions);
    this._updateDefinitions(nextDefinitions);
  }

  updateActiveProject(spec: ?atom$ProjectSpecification): void {
    const definition = getProjectWorkingSetDefinition(spec);
    if (shallowEqual(definition, this._activeProjectDefinition)) {
      return;
    }
    const nextDefinitions = this.getDefinitions().filter(
      d => !d.isActiveProject,
    );
    if (definition != null) {
      nextDefinitions.push(definition);
    }
    this._updateDefinitions(nextDefinitions);
  }

  updateApplicability(): void {
    const {
      applicable: prevApplicableDefinitions,
      notApplicable: prevNotApplicableDefinitions,
    } = this._prevApplicability;
    const {applicable, notApplicable} = this._groupByApplicability(
      this.getDefinitions(),
    );

    if (
      arrayEqual(prevApplicableDefinitions, applicable) &&
      arrayEqual(prevNotApplicableDefinitions, notApplicable)
    ) {
      return;
    }

    this._prevApplicability = {applicable, notApplicable};
    const activeApplicable = applicable.filter(d => d.active);
    if (activeApplicable.length > 0) {
      this._lastSelected = activeApplicable.map(d => d.name);
    }
    this._emitter.emit(NEW_DEFINITIONS_EVENT, {applicable, notApplicable});

    // Create a working set to reflect the combination of the active definitions.
    const combinedUris = [].concat(...activeApplicable.map(d => d.uris));
    const newWorkingSet = new WorkingSet(combinedUris);
    if (!this._current.equals(newWorkingSet)) {
      this._current = newWorkingSet;
      this._emitter.emit(NEW_WORKING_SET_EVENT, newWorkingSet);
    }
  }

  saveWorkingSet(name: string, workingSet: WorkingSet): void {
    this._updateDefinition(name, name, workingSet);
  }

  update(name: string, newName: string, workingSet: WorkingSet): void {
    this._updateDefinition(name, newName, workingSet);
  }

  activate(name: string): void {
    this._activateDefinition(name, /* active */ true);
  }

  deactivate(name: string): void {
    this._activateDefinition(name, /* active */ false);
  }

  deleteWorkingSet(name: string): void {
    track('working-sets-delete', {name});

    const definitions = this.getDefinitions().filter(
      d => d.name !== name || d.isActiveProject,
    );
    this._updateDefinitions(definitions);
  }

  _updateDefinition(
    name: string,
    newName: string,
    workingSet: WorkingSet,
  ): void {
    const definitions = this.getDefinitions();

    let nameIndex = -1;
    definitions.forEach((d, i) => {
      if (d.name === name) {
        nameIndex = i;
      }
    });

    const repos = atom.project.getRepositories().filter(Boolean);
    const originURLs = repos
      .map(repo => {
        const originURL = repo.getOriginURL();
        if (originURL == null) {
          return null;
        }
        const dir = repo.getProjectDirectory();
        return workingSet.containsDir(dir) ? originURL : null;
      })
      .filter(Boolean);

    let newDefinitions;
    if (nameIndex < 0) {
      track('working-sets-create', {
        name,
        uris: workingSet.getUris().join(','),
        originURLs: originURLs.join(','),
      });

      newDefinitions = definitions.concat({
        name,
        uris: workingSet.getUris(),
        active: false,
        originURLs,
      });
    } else {
      track('working-sets-update', {
        oldName: name,
        name: newName,
        uris: workingSet.getUris().join(','),
        originURLs: originURLs.join(','),
      });

      const active = definitions[nameIndex].active;
      newDefinitions = [].concat(
        definitions.slice(0, nameIndex),
        {name: newName, uris: workingSet.getUris(), active, originURLs},
        definitions.slice(nameIndex + 1),
      );
    }

    this._updateDefinitions(newDefinitions);
  }

  _activateDefinition(name: string, active: boolean): void {
    track('working-sets-activate', {name, active: active.toString()});

    const definitions = this.getDefinitions();
    const newDefinitions = definitions.map(d => ({
      ...d,
      active: d.name === name ? active : d.active,
    }));
    this._updateDefinitions(newDefinitions);
  }

  deactivateAll(): void {
    const definitions = this.getDefinitions().map(d => {
      if (!isApplicable(d)) {
        return d;
      }

      return {...d, active: false};
    });
    this._updateDefinitions(definitions);
  }

  toggleLastSelected(): void {
    track('working-sets-toggle-last-selected');

    if (this.getApplicableDefinitions().some(d => d.active)) {
      this.deactivateAll();
    } else {
      const newDefinitions = this.getDefinitions().map(d => {
        return {
          ...d,
          active: d.active || this._lastSelected.indexOf(d.name) > -1,
        };
      });
      this._updateDefinitions(newDefinitions);
    }
  }

  // Update the working set definitions. All updates should go through this method! In other words,
  // this should be the only place where `_savedDefinitions` and `_activeProjectDefinition` are
  // changed.
  _updateDefinitions(definitions: Array<WorkingSetDefinition>): void {
    const {saved, activeProject} = groupBy(
      definitions,
      d => (d.isActiveProject ? 'activeProject' : 'saved'),
    );
    this._activeProjectDefinition = idx(activeProject, _ => _[0]);
    this._savedDefinitions = saved || [];
    this._emitter.emit(SAVE_DEFINITIONS_EVENT, this.getDefinitions());
    this.updateApplicability();
  }
}

function groupByApplicability(
  definitions: Array<WorkingSetDefinition>,
): ApplicabilitySortedDefinitions {
  const applicable = [];
  const notApplicable = [];

  definitions.forEach(def => {
    if (isApplicable(def)) {
      applicable.push(def);
    } else {
      notApplicable.push(def);
    }
  });

  return {applicable, notApplicable};
}

function isApplicable(definition: WorkingSetDefinition): boolean {
  const originURLs = definition.originURLs;
  if (originURLs != null) {
    const mountedOriginURLs = atom.project
      .getRepositories()
      .filter(Boolean)
      .map(repo => repo.getOriginURL());
    originURLs.forEach(originURL => {
      if (mountedOriginURLs.some(url => url === originURL)) {
        return true;
      }
    });
  }

  const workingSet = new WorkingSet(definition.uris);
  const dirs = atom.project.getDirectories().filter(dir => {
    // Apparently sometimes Atom supplies an invalid directory, or a directory with an
    // invalid paths. See https://github.com/facebook/nuclide/issues/416
    if (dir == null) {
      const logger = getLogger('nuclide-working-sets');

      logger.warn('Received a null directory from Atom');
      return false;
    }
    try {
      nuclideUri.parse(dir.getPath());
      return true;
    } catch (e) {
      const logger = getLogger('nuclide-working-sets');

      logger.warn('Failed to parse path supplied by Atom', dir.getPath());
      return false;
    }
  });

  return dirs.some(dir => workingSet.containsDir(dir.getPath()));
}

// Given a project specification, create a corresponding working set definition.
function getProjectWorkingSetDefinition(
  spec: ?atom$ProjectSpecification,
): ?WorkingSetDefinition {
  if (spec == null) {
    return null;
  }

  // `_paths` is a special key. Normally, `paths` contains an Array of paths but, because we
  // want to mount the repository root instead and just filter to the paths using working sets,
  // we preprocess the spec, set `paths` to the vcs root and put the previous values in
  // `_paths`.
  const paths = (spec: any)._paths;

  if (!Array.isArray(paths)) {
    return null;
  }

  return {
    name: ProjectUtils.getLabelFromPath(spec.originPath),
    active: true,
    isActiveProject: true,
    uris: paths,
  };
}
