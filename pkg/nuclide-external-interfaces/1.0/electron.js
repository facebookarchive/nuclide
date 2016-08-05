/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

/* eslint-disable no-unused-vars */

// The properties on this module depend on whether the importer is the main
// process or a renderer process.
declare module 'electron' {
  // Main process:
  declare var app: ?electron$app;
  declare var autoUpdater: ?electron$autoUpdater;
  declare var BrowserWindow: ?typeof electron$BrowserWindow;
  declare var contentTracing: ?electron$contentTracing;
  declare var dialog: ?electron$dialog;
  declare var globalShortcut: ?electron$globalShortcut;
  declare var ipcMain: ?electron$IpcMain;
  declare var Menu: ?typeof electron$Menu;
  declare var MenuItem: ?typeof electron$MenuItem;
  declare var powerMonitor: ?electron$powerMonitor;
  declare var powerSaveBlocker: ?electron$powerSaveBlocker;
  declare var protocol: ?electron$protocol;
  declare var session: ?electron$session;
  declare var electron$Tray: ?typeof electron$Tray;
  declare var webContents: ?electron$webContents;

  // Renderer process:
  declare var desktopCapturer: ?electron$desktopCapturer;
  declare var ipcRenderer: ?electron$IpcRenderer;
  declare var remote: ?electron$remote;
  declare var webFrame: ?electron$webFrame;

  // Both:
  declare var clipboard: electron$clipboard;
  declare var crashReporter: electron$crashReporter;
  declare var nativeImage: electron$nativeImage;
  declare var screen: electron$Screen;
  declare var shell: electron$shell;
}

//------------------------------------------------------------------------------
// Custom DOM Elements
//------------------------------------------------------------------------------

/**
 * https://github.com/electron/electron/blob/master/docs/api/file-object.md
 */

// HTML5 File API but with a `path` attribute added.

/**
 * https://github.com/electron/electron/blob/master/docs/api/web-view-tag.md
 */

declare class WebviewElement extends HTMLElement {
  src: string,
  nodeintegration: boolean,
  disablewebsecurity: boolean,

  executeJavaScript(code: string, userGesture: ?boolean): void,
  getTitle(): string,
  getUrl(): string,
  insertCSS(code: string): void,
  send(): void,
  openDevTools(): void,
}

/**
 * https://github.com/electron/electron/blob/master/docs/api/window-open.md
 */

// window.open

//------------------------------------------------------------------------------
// Modules for the Main Process
//------------------------------------------------------------------------------

/**
 * https://github.com/electron/electron/blob/master/docs/api/app.md
 */

type electron$app = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/auto-updater.md
 */

type electron$autoUpdater = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/browser-window.md
 */

declare class electron$BrowserWindow {}

/**
 * https://github.com/electron/electron/blob/master/docs/api/content-tracing.md
 */

type electron$contentTracing = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/dialog.md
 */

type electron$dialog = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/global-shortcut.md
 */

type electron$globalShortcut = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/ipc-main.md
 */

declare class electron$IpcMain {}

/**
 * https://github.com/electron/electron/blob/master/docs/api/menu.md
 */

declare class electron$Menu {}

/**
 * https://github.com/electron/electron/blob/master/docs/api/menu-item.md
 */

declare class electron$MenuItem {}

/**
 * https://github.com/electron/electron/blob/master/docs/api/power-monitor.md
 */

type electron$powerMonitor = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/power-save-blocker.md
 */

type electron$powerSaveBlocker = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/protocol.md
 */

type electron$protocol = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/session.md
 */

type electron$session = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/system-preferences.md
 */

type electron$systemPreferences = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/tray.md
 */

declare class electron$Tray {}

/**
 * https://github.com/electron/electron/blob/master/docs/api/web-contents.md
 */

declare class electron$WebContents {}

type electron$webContents = {
  getAllWebContents(): Array<electron$WebContents>,
  getFocusedWebContents: ?electron$WebContents,
};

//------------------------------------------------------------------------------
// Modules for the Renderer Process (Web Page)
//------------------------------------------------------------------------------

/**
 * https://github.com/electron/electron/blob/master/docs/api/desktop-capturer.md
 */

type electron$desktopCapturer = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/ipc-renderer.md
 */

declare class electron$IpcRenderer {
  on(channel: string, callback: (...args: Array<any>) => void): electron$IpcRenderer,
  once(channel: string, callback: (...args: Array<any>) => void): electron$IpcRenderer,
  removeListener(channel: string, callback: (...args: Array<any>) => void): electron$IpcRenderer,
  removeAllListeners(channel?: string): electron$IpcRenderer,
  send(channel: string, ...args: Array<any>): void,
  sendSync(channel: string, ...args: Array<any>): void,
  sendToHost(channel: string, ...args: Array<any>): void,
}

/**
 * https://github.com/electron/electron/blob/master/docs/api/remote.md
 */

type electron$remote = {
  // main process built-in modules:
  app: electron$app,
  autoUpdater: electron$autoUpdater,
  BrowserWindow: typeof electron$BrowserWindow,
  contentTracing: electron$contentTracing,
  dialog: electron$dialog,
  globalShortcut: electron$globalShortcut,
  ipcMain: electron$IpcMain,
  Menu: typeof electron$Menu,
  MenuItem: typeof electron$MenuItem,
  powerMonitor: electron$powerMonitor,
  powerSaveBlocker: electron$powerSaveBlocker,
  protocol: electron$protocol,
  session: electron$session,
  electron$Tray: typeof electron$Tray,
  webContents: electron$webContents,
  // methods:
  require(module: string): any,
  getCurrentWindow(): electron$BrowserWindow,
  getCurrentWebContents(): electron$WebContents,
  getGlobal(name: string): ?mixed,
  process: typeof process,
};

/**
 * https://github.com/electron/electron/blob/master/docs/api/web-frame.md
 */

type electron$webFrame = {};


//------------------------------------------------------------------------------
// Modules for Both Processes
//------------------------------------------------------------------------------

/**
 * https://github.com/electron/electron/blob/master/docs/api/clipboard.md
 */

type electron$clipboard = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/crash-reporter.md
 */

type electron$crashReporter = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/native-image.md
 */

type electron$nativeImage = {};

/**
 * https://github.com/electron/electron/blob/master/docs/api/screen.md
 */

type electron$Display = {
  id: number,
  rotation: 0 | 90 | 180 | 270,
  scaleFactor: number,
  touchSupport: 'available' | 'unavailable' | 'unknown',
  bounds: electron$Rect,
  size: {height: number, width: number},
  workArea: electron$Rect,
  workAreaSize: {height: number, width: number},
};

type electron$Rect = {
  x: number,
  y: number,
  width: number,
  height: number,
};

type electron$DisplayEvents =
    'display-added'
  | 'display-removed'
  | 'display-metrics-changed';

type electron$ScreenListener = (
  event: electron$DisplayEvents,
  callback: (
    event: Object,
    display: electron$Display,
    changedMetrics?: Array<'bounds' | 'workArea' | 'scaleFactor' | 'rotation'>,
  ) => void,
) => electron$Screen;

declare class electron$Screen {
  on: electron$ScreenListener,
  once: electron$ScreenListener,
  removeAllListeners(event?: electron$DisplayEvents): electron$Screen,
  removeListener(event?: electron$DisplayEvents, callback: Function): electron$Screen,
  getCursorScreenPoint(): {x: number, y: number},
  getPrimaryDisplay(): electron$Display,
  getAllDisplays(): Array<electron$Display>,
  getDisplayNearestPoint(point: {x: number, y: number}): electron$Display,
  getDisplayMatching(rect: electron$Rect): electron$Display,
}

/**
 * https://github.com/electron/electron/blob/master/docs/api/shell.md
 */

type electron$shell = {
  showItemInFolder(fullPath: string): void,
  openItem(fullPath: string): void,
  openExternal(url: string, options?: {activate: boolean}): void,
  moveItemToTrash(fullPath: string): boolean,
  beep(): void,
  // Windows-only
  writeShortcutLink(
    shortcutPath: string,
    operation?: 'create' | 'update' | 'replace',
    options?: {
      target: string,
      cwd?: string,
      args?: string,
      description?: string,
      icon?: string,
      iconIndex?: number,
      appUserModelId?: string,
    }
  ): void,
  // Windows-only
  readShortcutLink(shortcutPath: string): void,
};
