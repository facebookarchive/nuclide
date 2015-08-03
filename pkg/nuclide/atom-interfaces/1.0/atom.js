/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*eslint-disable no-unused-vars */

/**
 * Private Classes
 */

declare class atom$Model {
  destroy(): void;
}

declare class atom$Package {
  mainModule: any;
}

/**
 * Essential Classes
 */
type atom$IDisposable = {
  dispose: () => void;
}

declare class atom$CommandRegistry {
  // Methods
  add(
    target: string | HTMLElement,
    commandNameOrCommands: string | {[commandName: string]: () => void},
    callback?: (event: Event) => mixed // The return value will be ignored.
  ): atom$Disposable;
  dispatch(target: HTMLElement, commandName: string): void;
}

declare class atom$CompositeDisposable {
  constructor(...disposables: atom$IDisposable[]): void;
  dispose(): void;

  add(disposable: atom$IDisposable): void;
  remove(disposable: atom$IDisposable): void;
  clear(): void;
}

declare class atom$Config {
  // Config Subscription
  observe(
    keyPath: string,
    optionsOrCallback?: (Object | (value: any) => void),
    callback?: (value: any) => void
  ): atom$IDisposable;

  onDidChange(
    keyPathOrCallback: (string | (event: Object) => void),
    optionsOrCallback?: (Object | (event: Object) => void),
    callback?: (event: Object) => void
  ): atom$IDisposable;

  // Managing Settings
  get(
    keyPath?: string,
    options?: {
      excludeSources?: Array<string>;
      sources?: Array<string>;
      scope?: Object;
    }
  ): mixed;
}

declare class atom$Cursor {
  // Event Subscription
  // Managing Cursor Position
  getBufferRow(): number;
  getBufferColumn(): number;

  // Cursor Position Details
  // Moving the Cursor

  // Local Positions and Ranges
  getCurrentWordBufferRange(options?: {wordRegex: RegExp}): atom$Range;

  // Visibility
  // Comparing to another cursor
  // Utilities
  wordRegExp(options?: {includeNonWordCharacters: boolean}): RegExp;
}

declare class atom$Decoration {
  destroy(): void;
}

declare class atom$Disposable {
  constructor(disposalAction: (...args: any[]) => any): void;
  dispose(): void;
}

declare class atom$Emitter {
  dispose(): void;
  on(name: string, callback: (v: any) => mixed): atom$Disposable;
  preempt(name: string, callback: (v: any) => void): atom$Disposable;
  emit(name: string, value: any): atom$Disposable;
}

declare class atom$Gutter {
  destroy(): void;
  decorateMarker(
    marker: atom$Marker,
    options?: {'class'?: string; item?: Object | HTMLElement}): void;
  show(): void;
  hide(): void;
  onDidDestroy(callback: () => void): atom$Disposable;
}

declare class atom$Marker {
  destroy(): void;
  getStartBufferPosition(): atom$Point;
  onDidChange(callback: (event: {
    oldHeadScreenPosition: atom$Point;
    newHeadScreenPosition: atom$Point;
    oldTailScreenPosition: atom$Point;
    newTailScreenPosition: atom$Point;

    oldHeadBufferPosition: atom$Point;
    newHeadBufferPosition: atom$Point;
    oldTailBufferPosition: atom$Point;
    newTailBufferPosition: atom$Point;

    isValid: boolean;
    textChanged: boolean;
  }) => void): atom$Disposable;
  onDidDestroy(callback: () => void): atom$Disposable;
}

declare class atom$PackageManager {
  // Event Subscription
  onDidLoadInitialPackages(callback: () => void): atom$Disposable;
  onDidActivateInitialPackages(callback: () => void): atom$Disposable;

  // Package system data
  getApmPath(): string;
  getPackageDirPaths(): Array<string>;

  // General package data
  resolvePackagePath(name: string): ?string;
  isBundledPackage(name: string): boolean;

  // Enabling and disabling packages
  enablePackage(name: string): ?atom$Package;
  disablePackage(name: string): ?atom$Package;
  isPackageDisabled(name: string): boolean;

  // Activating and deactivating packages
  activatePackage(name: string): Promise<atom$Package>;

  // Accessing loaded packages
  isPackageLoaded(name: string): boolean;

  // Accessing available packages
  getAvailablePackageNames(): Array<string>;
}

type atom$PaneSplitParams = {
  copyActiveItem?: boolean;
  items?: Array<Object>;
};

declare class atom$Pane {
  // Lifecycle
  activate(): void;

  // Splitting
  splitLeft(params?: atom$PaneSplitParams): atom$Pane;
  splitRight(params?: atom$PaneSplitParams): atom$Pane;
  splitUp(params?: atom$PaneSplitParams): atom$Pane;
  splitDown(params?: atom$PaneSplitParams): atom$Pane;
}

declare class atom$Panel {
  // Construction and Destruction
  destroy(): void;

  // Event Subscription
  onDidChangeVisible(callback: (visible: boolean) => any): atom$Disposable;
  onDidDestroy(callback: (panel: atom$Panel) => any): atom$Disposable;

  // Panel Details
  getItem(): Element;
  getPriority(): number;
  isVisible(): boolean;
  hide(): void;
  show(): void;
}

declare class atom$Point {
  constructor(row: number, column: number): void;
  row: number;
  column: number;
  copy(): atom$Point;
  negate(): atom$Point;

  serialize(): Array<number>;
  toArray(): Array<number>;
}

declare class atom$Range {
  constructor(pointA: atom$Point | number, pointB: atom$Point | number): void;
  start: atom$Point;
  end: atom$Point;
  containsPoint(point: atom$Point, exclusive?: boolean): boolean;
  serialize(): Array<Array<number>>;
}

type InsertTextOptions = {
  select: boolean;
  autoIndent: boolean;
  autoIndentNewline: boolean;
  autoDecreaseIndent: boolean;
  normalizeLineEndings: ?boolean;
  undo: string;
}

type DecorateMarkerParams = {
  type: 'line',
  class: string;
  onlyHead?: boolean;
  onlyEmpty?: boolean;
  onlyNonEmpty?: boolean;
} | {
  type: 'gutter',
  class: string;
  onlyHead?: boolean;
  onlyEmpty?: boolean;
  onlyNonEmpty?: boolean;
  gutterName?: string;
} | {
  type: 'highlight',
  class?: string;
  gutterName?: string;
} | {
  type: 'overlay',
  item: Object,
  position?: 'head' | 'tail', // Defaults to 'head' when unspecified.
};

declare class atom$TextEditor extends atom$Model {
  // Event Subscription
  onDidChange(callback: () => void): atom$Disposable;
  onDidDestroy(callback: () => void): atom$Disposable;
  onWillInsertText(callback: (event: {cancel: () => void; text: string;}) => void): atom$Disposable;
  getBuffer(): atom$TextBuffer;

  // File Details
  getTitle(): string;
  getLongTitle(): string;
  /**
   * If you open Atom via Spotlight such that it opens with a tab named
   * "untitled" that does not correspond to a file on disk, this will return
   * null.
   */
  getPath(): ?string;
  isModified(): boolean;
  isEmpty(): boolean;
  getEncoding(): string;
  setEncoding(encoding: string): void;

  // File Operations
  save(): void;
  saveAs(filePath: string): void;

  // Reading Text
  getText(): string;
  getTextInBufferRange(range: atom$Range | Array<number>): string;
  getLineCount(): number;

  // Mutating Text
  setText(text: string, options?: InsertTextOptions): void;
  insertText(text: string): atom$Range | boolean;

  // History
  // TextEditor Coordinates
  // Decorations
  decorateMarker(marker: atom$Marker, decorationParams: DecorateMarkerParams): atom$Decoration;

  // Markers
  markBufferPosition(position: atom$Point | Array<number>): atom$Marker;
  markBufferRange(range: atom$Range | Array<Array<number>>): atom$Marker;

  // Cursors
  setCursorBufferPosition(
    position: atom$Point | Array<number>,
    options?: {
      autoscroll?: boolean;
      wrapBeyondNewlines?: boolean;
      wrapAtSoftNewlines?: boolean;
      screenLine?: boolean;
    }): void;
  getCursorBufferPosition(): atom$Point;
  getLastCursor(): atom$Cursor;
  moveToEndOfLine(): void;

  // Selections
  selectAll(): void;

  // Searching and Replacing
  // Tab Behavior
  // Soft Wrap Behavior
  // Indentation
  indentationForBufferRow(bufferRow: number): number;

  // Grammars
  getGrammar(): atom$Grammar;
  setGrammar(grammar: atom$Grammar): void;

  // Clipboard Operations
  pasteText(options?: Object): void;

  // Gutter
  addGutter(options: {
    name: string;
    priority?: number;
    visible?: boolean;
  }): atom$Gutter;

  gutterWithName(name: string): ?atom$Gutter;

  // Scrolling the TextEditor
  scrollToBufferPosition(position: atom$Point | number[], options?: {center?: boolean}): void;
  scrollToBottom(): void;

  // TextEditor Rendering
  getPlaceholderText(): string;
  setPlaceholderText(placeholderText: string): void;
}

declare class atom$ViewRegistry {
  // Methods
  addViewProvider(
    modelConstructor: any,
    createView?: (...args: any[]) => ?HTMLElement
  ): atom$Disposable;
  getView(object: Object): HTMLElement;
}

declare class atom$Workspace {
  // Event Subscription
  observeTextEditors(callback: (editor: atom$TextEditor) => void): atom$Disposable;
  onDidChangeActivePaneItem(callback: (item: mixed) => void): atom$Disposable;

  // Opening
  open(uri: string, options?: {
    initialLine?: number;
    initialColumn?: number;
    split?: string;
    activePane?: boolean;
    searchAllPanes?: boolean;
  }): Promise<atom$TextEditor>;
  reopenItem(): Promise<?atom$TextEditor>;
  addOpener(callback: (uri: string) => any): atom$Disposable;

  // Pane Items
  getPaneItems(): Array<Object>;
  getActivePaneItem(): Object;
  getTextEditors(): Array<atom$TextEditor>;
  getActiveTextEditor(): ?atom$TextEditor;

  // Panes
  getActivePane(): atom$Pane;

  // Panels
  getBottomPanels(): Array<atom$Panel>;
  addBottomPanel(options: {
    item: Object;
    visible?: boolean;
    priority?: number;
  }): atom$Panel;
  addTopPanel(options: {
    item: Object;
    visible?: boolean;
    priority?: number;
  }): atom$Panel;

  addModalPanel(options: {
    item: HTMLElement;
    visible?: boolean;
    priority?: number;
  }): atom$Panel;
  // Searching and Replacing
}

/**
 * Extended Classes
 */

declare class atom$BufferedNodeProcess { }

declare class atom$BufferedProcess {
  // Helper Methods
  kill(): void;
}

declare class atom$Clipboard {
  // Methods
  write(text: string, metadata?: mixed): void;
  read(): string;
  readWithMetadata(): {
    metadata: ?mixed;
    text: string;
  };
}

declare class atom$ContextMenuManager {
  add(itemsBySelector: Object): void;
}

declare class atom$Directory {
  symlink: boolean;

  // Directory Metadata
  isFile(): boolean;
  isDirectory(): boolean;

  // Managing Paths
  getPath(): string;
  getBaseName(): string;
  relativize(fullPath: string): string;

  // Event Subscription
  onDidRename(callback: () => void): atom$Disposable;
  onDidDelete(callback: () => void): atom$Disposable;

  // Traversing
  getParent(): atom$Directory;
  contains(path: string): boolean;
}

declare class atom$File {
  symlink: boolean;

  // File Metadata
  isFile(): boolean;
  isDirectory(): boolean;

  // Event Subscription
  onDidRename(callback: () => void): atom$Disposable;
  onDidDelete(callback: () => void): atom$Disposable;

  // Managing Paths
  getPath(): string;
  getBaseName(): string;

  // Traversing
  getParent(): atom$Directory;

  // Reading and Writing
  read(flushCache?: boolean): Promise<string>;
}

declare class atom$GitRepository {
}

declare class atom$Grammar {
  scopeName: string;
}

declare class atom$GrammarRegistry {
  // Event Subscription
  onDidAddGrammar(callback: (grammar: atom$Grammar) => void): atom$Disposable;

  // Managing Grammars
  grammarForScopeName(scopeName: string): ?atom$Grammar;
  loadGrammarSync(grammarPath: string): atom$Grammar;
}

declare class atom$Project {
  // Event Subscription
  onDidChangePaths(callback: (projectPaths: Array<string>) => mixed): atom$Disposable;

  // Managing Paths
  getPaths(): Array<string>;
  setPaths(paths: Array<string>): void;
  removePath(projectPath: string): void;
  getDirectories(): Array<atom$Directory>;
}

declare class atom$TextBuffer {
  file: ?atom$File;

  // Events
  onDidStopChanging(callback: () => mixed): atom$Disposable;
  onDidSave(callback: () => mixed): atom$Disposable;
  onDidReload(callback: () => mixed): atom$Disposable;

  // Reading Text
  isEmpty(): boolean;
  getText(): string;
  getLines(): Array<string>;
  getLastLine(): string;
  lineForRow(row: number): string;
  lineEndingForRow(row: number): string;
  lineLengthForRow(row: number): number;
  isRowBlank(row: number): boolean;
  previousNonBlankRow(startRow: number): ?number;
  nextNonBlankRow(startRow: number): ?number;

  // Mutating Text
  setText(text: string): atom$Range;
  append(text: string, options: {
    normalizeLineEndings?: boolean;
    undo?: string;
  }): atom$Range;
  delete(range: atom$Range): atom$Range;

  // Search And Replace
  scanInRange(regex: RegExp, range: Range, iterator: (data: Object) => void): void;

  // Buffer Range Details
  rangeForRow(row: number, includeNewLine?: boolean): Range;
}

declare class atom$Notification {
  getType(): string;
  getMessage(): string;
  dismiss(): void;
}

declare class atom$NotificationManager {
  // Events
  onDidAddNotification(callback: (notification: atom$Notification) => void): atom$IDisposable;

  // Adding Notifications
  addSuccess(message: string, options?: Object): atom$Notification;
  addInfo(message: string, options?: Object): atom$Notification;
  addWarning(message: string, options?: Object): atom$Notification;
  addError(message: string, options?: Object): atom$Notification;
  addFatalError(message: string, options?: Object): atom$Notification;

  // Getting Notifications
  getNotifications(): Array<atom$Notification>;
}

// The items in this declaration are available off of `require('atom')`.
// This list is not complete.
declare module 'atom' {
  declare var BufferedNodeProcess: typeof atom$BufferedNodeProcess;
  declare var BufferedProcess: typeof atom$BufferedProcess;
  declare var CompositeDisposable: typeof atom$CompositeDisposable;
  declare var Directory: typeof atom$Directory;
  declare var Disposable: typeof atom$Disposable;
  declare var Emitter: typeof atom$Emitter;
  declare var File: typeof atom$File;
  declare var Notification: typeof atom$Notification;
  declare var Point: typeof atom$Point;
  declare var Range: typeof atom$Range;
  declare var TextBuffer: typeof atom$TextBuffer;
  declare var TextEditor: typeof atom$TextEditor;
}

// Make sure that common types can be referenced without the `atom$` prefix
// in type declarations.
declare var Cursor: typeof atom$Cursor;
declare var Panel: typeof atom$Panel;
declare var TextEditor: typeof atom$TextEditor;

// The properties of this type match the properties of the `atom` global.
// This list is not complete.
type AtomGlobal = {
  // Properties
  clipboard: atom$Clipboard;
  commands: atom$CommandRegistry;
  config: atom$Config;
  contextMenu: atom$ContextMenuManager;
  grammars: atom$GrammarRegistry;
  notifications: atom$NotificationManager;
  packages: atom$PackageManager;
  views: atom$ViewRegistry;
  workspace: atom$Workspace;
  project: atom$Project;

  // Messaging the User
  confirm(options: {
    buttons?: Array<string> | {[buttonName: string]: () => void};
    detailedMessage?: string;
    message: string;
  }): ?number;
}

declare var atom: AtomGlobal;

/**
 * ipc is used by webviews to communicate with the parent view.
 */
declare module 'ipc' {
  declare function on(name: string, callback: (event: any) => void): atom$Disposable;
  declare function sendToHost(name: string, ...args: any[]): void;
}

declare class WebviewElement extends HTMLElement {
  src: string;
  nodeintegration: boolean;

  getTitle(): string;
  send(): void;
}

type RepositoryDidChangeStatusCallback = (event: {path: string; pathStatus: number}) => mixed;
type RepositoryLineDiff = {
  oldStart: number;
  newStart: number;
  oldLines: number;
  newLines: number;
};

// Taken from the interface of GitRepository, which is also implemented
// by HgRepositoryClient.
declare class Repository {
  // Event Subscription
  onDidChangeStatus: (callback: RepositoryDidChangeStatusCallback) => atom$Disposable;
  onDidChangeStatuses: (callback: () => mixed) => atom$Disposable;

  // Repository Details
  getType: () => string;
  getPath: () => string;
  getWorkingDirectory: () => string;
  isProjectAtRoot: () => boolean;
  relativize: (aPath: string) => string;

  // Reading Status
  isPathModified: (aPath: string) => boolean;
  isPathNew: (aPath: string) => boolean;
  isPathIgnored: (aPath: string) => boolean;
  getDirectoryStatus: (aPath: string) => number;
  getPathStatus: (aPath: string) => number;
  getCachedPathStatus: (aPath: string) => ?number;
  isStatusModified: (aPath: string) => boolean;
  isStatusNew: (aPath: string) => boolean;

  // Retrieving Diffs
  getDiffStats: (filePath: string) => {added: number; deleted: number;};
  getLineDiffs: (aPath: string, text: string) => Array<RepositoryLineDiff>;

  // Checking Out
  checkoutHead: (aPath: string) => boolean;
  checkoutReference: (reference: string, create: boolean) => boolean;
}
