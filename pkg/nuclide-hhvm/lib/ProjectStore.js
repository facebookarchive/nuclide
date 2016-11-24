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

import {Emitter} from 'atom';
import {BehaviorSubject} from 'rxjs';

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {isFileInHackProject} from '../../nuclide-hack/lib/HackLanguage';
import {trackOperationTiming} from '../../nuclide-analytics';
import nuclideUri from '../../commons-node/nuclideUri';
import UniversalDisposable from '../../commons-node/UniversalDisposable';

import type {ProjectType} from './types';

class ProjectStore {
  _disposables: UniversalDisposable;
  _emitter: Emitter;
  _currentFilePath: string;
  _projectRoot: BehaviorSubject<?string>;
  _projectType: ProjectType;
  _debugMode: DebugMode;
  _filePathsToScriptCommand: Map<string, string>;

  constructor() {
    this._emitter = new Emitter();
    this._currentFilePath = '';
    this._projectRoot = new BehaviorSubject();
    this._projectType = 'Other';
    this._debugMode = 'webserver';
    this._filePathsToScriptCommand = new Map();

    const onDidChange = this._onDidChangeActivePaneItem.bind(this);
    this._disposables = new UniversalDisposable(
      this._projectRoot
        .switchMap(root => this._isFileHHVMProject(root))
        .subscribe(isHHVM => {
          this._projectType = isHHVM ? 'Hhvm' : 'Other';
          this._emitter.emit('change');
        }),
      atom.workspace.onDidStopChangingActivePaneItem(onDidChange),
    );
    onDidChange();
  }

  _onDidChangeActivePaneItem(): void {
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
  }

  _isFileHHVMProject(fileUri: ?string): Promise<boolean> {
    return trackOperationTiming('toolbar.isFileHHVMProject', async () => {
      return (
        fileUri != null &&
        nuclideUri.isRemote(fileUri) &&
        await isFileInHackProject(fileUri)
      );
    });
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

  setProjectRoot(root: ?string): void {
    this._projectRoot.next(root);
  }

  getProjectRoot(): ?string {
    return this._projectRoot.getValue();
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

  getDebugTarget(): string {
    const filePath = this._currentFilePath;
    if (this._debugMode === 'script') {
      const localPath = nuclideUri.getPath(filePath);
      const lastScriptCommand = this.getLastScriptCommand(localPath);
      return lastScriptCommand === '' ? localPath : lastScriptCommand;
    }
    // getHostname throws for non-remote paths.
    // Technically this shouldn't be visible for non-remote paths, but the UI
    // can sometimes display the toolbar anyway.
    const rootPath = this._projectRoot.getValue();
    if (rootPath != null && nuclideUri.isRemote(rootPath)) {
      return nuclideUri.getHostname(rootPath);
    }
    return '';
  }

  dispose() {
    this._disposables.dispose();
  }
}

module.exports = ProjectStore;
