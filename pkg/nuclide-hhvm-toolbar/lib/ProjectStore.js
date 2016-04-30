'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {getHackEnvironmentDetails} from '../../nuclide-hack/lib/utils';
import {CompositeDisposable, Disposable} from 'atom';
import {EventEmitter} from 'events';
import {buckProjectRootForPath} from '../../nuclide-buck-commons';
import {trackTiming} from '../../nuclide-analytics';
import remoteUri from '../../nuclide-remote-uri';

import type {NuclideUri} from '../../nuclide-remote-uri';

type ProjectType = 'Buck' | 'Hhvm' | 'Other';

class ProjectStore {
  _disposables: CompositeDisposable;
  _eventEmitter: EventEmitter;
  _currentFilePath: string;
  _projectType: ProjectType;

  constructor() {
    this._disposables = new CompositeDisposable();
    this._eventEmitter = new EventEmitter();
    this._currentFilePath = '';
    this._projectType = 'Other';
    this._monitorActiveEditorChange();
  }

  _monitorActiveEditorChange() {
    // For the current active editor, and any update to the active editor,
    // decide whether the toolbar should be displayed.
    const {onWorkspaceDidStopChangingActivePaneItem} =
        require('../../nuclide-atom-helpers').atomEventDebounce;
    const callback = this._onDidChangeActivePaneItem.bind(this);
    this._disposables.add(onWorkspaceDidStopChangingActivePaneItem(callback));
    callback();
  }

  async _onDidChangeActivePaneItem(): Promise {
    const activeTextEditor = atom.workspace.getActiveTextEditor();
    if (!activeTextEditor) {
      return;
    }

    const fileName = activeTextEditor.getPath();
    if (!fileName) {
      return;
    }
    this._currentFilePath = fileName;

    this._projectType = 'Other';
    const isBuckProject = await this._isFileBuckProject(fileName);
    if (isBuckProject) {
      this._projectType = 'Buck';
    } else if (await this._isFileHHVMProject(fileName)) {
      this._projectType = 'Hhvm';
    }
    this._eventEmitter.emit('change');
  }

  @trackTiming('toolbar.isFileHHVMProject')
  async _isFileHHVMProject(fileUri: NuclideUri): Promise<boolean> {
    const {hackService} = await getHackEnvironmentDetails(fileUri);
    return remoteUri.isRemote(fileUri)
      && hackService != null
      && await hackService.isFileInHackProject(fileUri);
  }

  @trackTiming('toolbar.isFileBuckProject')
  async _isFileBuckProject(fileName: string): Promise<boolean> {
    const buckProject = await buckProjectRootForPath(fileName);
    return !!buckProject;
  }

  onChange(callback: () => void): Disposable {
    const emitter = this._eventEmitter;
    this._eventEmitter.on('change', callback);
    return (new Disposable(() => emitter.removeListener('change', callback)));
  }

  getCurrentFilePath(): string {
    return this._currentFilePath;
  }

  getProjectType(): ProjectType {
    return this._projectType;
  }

  dispose() {
    this._disposables.dispose();
  }
}

module.exports = ProjectStore;
