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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {ClangRequestSettings} from '../../nuclide-clang-rpc/lib/rpc-types';
import type {HostServices} from '../../nuclide-language-service-rpc/lib/rpc-types';

import fs from 'nuclide-commons/fsPromise';
import os from 'os';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {
  MultiProjectLanguageService,
  forkHostServices,
} from '../../nuclide-language-service-rpc';
import {FileCache} from '../../nuclide-open-files-rpc';
import {Cache} from 'nuclide-commons/cache';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {LspLanguageService} from '../../nuclide-vscode-language-service-rpc/lib/LspLanguageService';

type ManagedRoot = {
  files: Set<string>,
  watchFile: string, // TODO: pelmers use this field, reset server when build file changes
  rootDir: string,
  tempCommandsDir: ?string,
};

export default class ClangdLanguageServer extends MultiProjectLanguageService<
  LspLanguageService,
> {
  // Maps clang settings => settings metadata
  // Remark: I don't key the map on ClangRequestSettings
  // because === operator does not work as an equality check.
  _managedRoots: Map<string, ManagedRoot>;
  constructor(
    languageId: string,
    command: string,
    logger: log4js$Logger,
    fileCache: FileCache,
    host: HostServices,
  ) {
    super();

    this._resources = new UniversalDisposable();

    this._logger = logger;
    const server = this; // Access class scope within closure.
    async function clangdServiceFactory(
      compileCommandsPath: string,
    ): Promise<?LspLanguageService> {
      const managedRoot = server._managedRoots.get(compileCommandsPath);
      // Only proceed if we added the compile commands via addClangRequest
      if (!managedRoot) {
        return null;
      }
      const {rootDir, tempCommandsDir} = managedRoot;
      const args = [
        '-enable-snippets',
        // TODO pelmers For debugging:
        // '-debug',
        // '-input-mirror-file',
        // '/Users/pelmers/clangd.log',
        // '-run-synchronously',
      ];
      if (tempCommandsDir != null) {
        args.push('-compile-commands-dir', tempCommandsDir);
      }
      await server.hasObservedDiagnostics();
      const lsp = new LspLanguageService(
        logger,
        fileCache,
        await forkHostServices(host, logger),
        languageId,
        command,
        args,
        {}, // spawnOptions
        rootDir,
        ['.cpp', '.h', '.hpp'],
        {},
        5 * 60 * 1000, // 5 minutes
      );

      lsp.start(); // Kick off 'Initializing'...
      return lsp;
    }

    this._processes = new Cache(clangdServiceFactory, value => {
      value.then(service => {
        if (service != null) {
          service.dispose();
        }
      });
    });

    this._managedRoots = new Map();

    this._resources.add(host, this._processes);

    this._resources.add(
      () => {
        this._closeProcesses();
      },
      () => {
        // Delete temporary directories.
        for (const managedRoot of this._managedRoots.values()) {
          const {tempCommandsDir} = managedRoot;
          if (tempCommandsDir != null) {
            fs.rmdir(tempCommandsDir);
          }
        }
      },
    );
    // Remove fileCache when the remote connection shuts down
    this._resources.add(
      fileCache
        .observeFileEvents()
        .ignoreElements()
        .subscribe(
          undefined, // TODO pelmers: watch saves on targets files
          undefined, // error
          () => {
            this._logger.info('fileCache shutting down.');
            this._closeProcesses();
          },
        ),
    );
  }

  async addClangRequest(clangRequest: ClangRequestSettings): Promise<boolean> {
    // Start new server for compile commands path and add to managed list.
    // Return whether successful.
    const database = clangRequest.compilationDatabase;
    if (!database) {
      return false;
    }
    // file = compile commands, flags file = build target
    const {file, flagsFile} = database;
    if (file == null || flagsFile == null) {
      return false;
    }
    if (this._managedRoots.has(file)) {
      return true;
    }
    const rootDir = nuclideUri.dirname(flagsFile);
    // See https://clang.llvm.org/docs/JSONCompilationDatabase.html for spec
    // Add the files of this database to the managed map.
    const contents = await fs.readFile(file);
    // Create a temporary directory with only compile_commands.json because
    // clangd requires the name of a directory containing a
    // compile_commands.json, which is not always what we are provided here.
    const tmpDir = nuclideUri.join(
      os.tmpdir(),
      'nuclide-clangd-lsp-' + Math.random().toString(),
    );
    if (!await fs.mkdirp(tmpDir)) {
      return false;
    }
    const tmpCommandsPath = nuclideUri.join(tmpDir, 'compile_commands.json');
    await fs.writeFile(tmpCommandsPath, contents);
    this._managedRoots.set(file, {
      rootDir,
      watchFile: flagsFile,
      files: new Set(JSON.parse(contents.toString()).map(entry => entry.file)),
      tempCommandsDir: tmpDir,
    });
    this._logger.info(
      'Copied commands from ' + file + ' to ' + tmpCommandsPath,
    );
    // Trigger the factory to construct the server.
    this._processes.get(file);
    return true;
  }

  async isFileKnown(filePath: NuclideUri): Promise<boolean> {
    return this.getClangRequestSettingsForFile(filePath) != null;
  }

  getClangRequestSettingsForFile(filePath: NuclideUri): ?string {
    const absPath = nuclideUri.getPath(filePath);
    this._logger.info('checking for ' + absPath);
    for (const [commandsPath, managedRoot] of this._managedRoots) {
      if (managedRoot.files.has(absPath)) {
        return commandsPath;
      }
    }
    return null;
  }

  async getLanguageServiceForFile(
    filePath: NuclideUri,
  ): Promise<?LspLanguageService> {
    const commandsPath = this.getClangRequestSettingsForFile(filePath);
    if (commandsPath != null) {
      this._logger.info('Found existing service for ' + filePath);
      this._logger.info('Key: ' + commandsPath);
      const result = this._processes.get(commandsPath);
      if (result == null) {
        // Delete so we retry next time.
        this._processes.delete(commandsPath);
      }
      return result;
    }
    this._logger.info(
      ' if path is reasonable then i should have created server for it already?',
    );
    return null;
  }
}
