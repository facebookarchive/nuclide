'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable, Disposable} = require('atom');
var {EventEmitter} = require('events');
var {buckProjectRootForPath} = require('nuclide-buck-commons');

var PANE_SWITCH_BUFFER_MILLISECONDS = 0;
var ARC_PROJECT_WWW = 'facebook-www';

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
    var {onWorkspaceDidStopChangingActivePaneItem} =
        require('nuclide-atom-helpers').atomEventDebounce;
    var callback = this._onDidChangeActivePaneItem.bind(this);
    this._disposables.add(onWorkspaceDidStopChangingActivePaneItem(
      callback,
      PANE_SWITCH_BUFFER_MILLISECONDS
    ));
    callback();
  }

  async _onDidChangeActivePaneItem(): Promise {
    var activeTextEditor = atom.workspace.getActiveTextEditor();
    if (!activeTextEditor) {
      return;
    }

    var fileName = activeTextEditor.getPath();
    if (!fileName) {
      return;
    }
    this._currentFilePath = fileName;

    this._projectType = 'Other';
    var isBuckProject = await this._isFileBuckProject(fileName);
    if (isBuckProject) {
      this._projectType = 'Buck';
    } else if (await this._isFileHHVMProject(fileName)) {
      this._projectType = 'Hhvm';
    }
    this._eventEmitter.emit('change');
  }

  async _isFileHHVMProject(fileName: string): Promise<boolean> {
    var remoteUri = require('nuclide-remote-uri');
    var arcanist = require('nuclide-arcanist-client');
    var arcProjectId = await arcanist.findArcProjectIdOfPath(fileName);

    return remoteUri.isRemote(fileName) &&
      arcProjectId === ARC_PROJECT_WWW &&
      (fileName.endsWith('.php') || fileName.endsWith('.hh'));
  }

  async _isFileBuckProject(fileName: string): Promise<boolean> {
    var buckProject = await buckProjectRootForPath(fileName);
    return !!buckProject;
  }

  onChange(callback: () => void): Disposable {
    var emitter = this._eventEmitter;
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
