'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DebugMode} from './types';

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {isFileInHackProject} from '../../nuclide-hack/lib/HackLanguage';
import {CompositeDisposable, Emitter} from 'atom';
import {trackTiming} from '../../nuclide-analytics';
import nuclideUri from '../../commons-node/nuclideUri';

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {ProjectType} from './types';

class ProjectStore {
  _disposables: CompositeDisposable;
  _emitter: Emitter;
  _currentFilePath: string;
  _projectType: ProjectType;
  _debugMode: DebugMode;
  _filePathsToScriptCommand: Map<string, string>;

  constructor() {
    this._disposables = new CompositeDisposable();
    this._emitter = new Emitter();
    this._currentFilePath = '';
    this._projectType = 'Other';
    this._debugMode = 'webserver';
    this._filePathsToScriptCommand = new Map();
    this._monitorActiveEditorChange();
  }

  _monitorActiveEditorChange() {
    // For the current active editor, and any update to the active editor,
    // decide whether the toolbar should be displayed.
    const callback = this._onDidChangeActivePaneItem.bind(this);
    this._disposables.add(atom.workspace.onDidStopChangingActivePaneItem(callback));
    callback();
  }

  async _onDidChangeActivePaneItem(): Promise<any> {
    const activeTextEditor = atom.workspace.getActiveTextEditor();
    if (!activeTextEditor) {
      return;
    }

    const fileName = activeTextEditor.getPath();
    if (!fileName) {
      return;
    }
    this._currentFilePath = fileName;
    this._emitter.emit('change');

    const newProjectType = await this._isFileHHVMProject(fileName) ? 'Hhvm' : 'Other';
    this._projectType = newProjectType;
    this._emitter.emit('change');
  }

  @trackTiming('toolbar.isFileHHVMProject')
  async _isFileHHVMProject(fileUri: NuclideUri): Promise<boolean> {
    return nuclideUri.isRemote(fileUri) && (await isFileInHackProject(fileUri));
  }

  getLastScriptCommand(filePath: string): string {
    const command = this._filePathsToScriptCommand.get(filePath);
    if (command != null) {
      return command;
    }
    return '';
  }

  updateLastScriptCommand(command: string): void {
    this._filePathsToScriptCommand.set(nuclideUri.getPath(this._currentFilePath), command);
  }

  onChange(callback: () => void): IDisposable {
    return this._emitter.on('change', callback);
  }

  getCurrentFilePath(): string {
    return this._currentFilePath;
  }

  getProjectType(): ProjectType {
    return this._projectType;
  }

  getDebugMode(): DebugMode {
    return this._debugMode;
  }

  setDebugMode(debugMode: DebugMode): void {
    this._debugMode = debugMode;
    this._emitter.emit('change');
  }

  dispose() {
    this._disposables.dispose();
  }
}

module.exports = ProjectStore;
