/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Essential Classes
 */
type atom$IDisposable = {
  dispose: () => void;
}

declare class atom$CommandRegistry {
  // Methods
  add(
    target: string,
    commandName: string | {[commandName: string]: (event: Event) => void},
    callback?: (event: Event) => void
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

  // Managing Settings
  get(
    keyPath: string,
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
  on(name: string, callback: (v: any) => void): atom$Disposable;
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
}

declare class atom$PackageManager {
  // Package system data
  getApmPath(): string;
  getPackageDirPaths(): Array<string>;

  // General package data
  resolvePackagePath(name: string): ?string;
  isBundledPackage(name: string): boolean;
}

declare class atom$Pane {
  // Lifecycle
  activate(): void;
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

declare class atom$TextEditor {
  // Event Subscription
  onDidDestroy(callback: () => void): atom$Disposable;
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
  decorateMarker(marker: atom$Marker, decorationParams: {
    type: string;
    class: string;
    onlyHead?: boolean;
    onlyEmpty?: boolean;
    onlyNonEmpty?: boolean;
    gutterName?: string;
  }): atom$Decoration;

  // Markers
  markBufferPosition(position: atom$Point | Array<number>): atom$Marker;
  markBufferRange(range: atom$Range | Array<Array<number>>): atom$Marker;

  // Cursors
  getCursorBufferPosition(): atom$Point;
  getLastCursor(): atom$Cursor;

  // Selections
  // Searching and Replacing
  // Tab Behavior
  // Soft Wrap Behavior
  // Indentation
  indentationForBufferRow(bufferRow: number): number;

  // Grammars
  // TODO: define Grammar class
  getGrammar(): /*atom$Grammar*/ Object;
  setGrammar(grammar: /*atom$Grammar*/ Object): void;

  // Gutter
  addGutter(options: {
    name: string;
    priority?: number;
    visible?: boolean;
  }): atom$Gutter;

  gutterWithName(name: string): ?atom$Gutter;

  // Scrolling
  scrollToBufferPosition(position: atom$Point | number[], options?: {center?: boolean}): void;
}

declare class atom$ViewRegistry {
  // Methods
  addViewProvider(providerSpec: {
    modelConstructor: any;
    viewConstructor?: any;
    createView?: (...args: any[]) => ?HTMLElement;
  }): atom$Disposable;
  getView(object: Object): HTMLElement;
}

declare class atom$Workspace {
  // Event Subscription
  observeTextEditors(callback: (editor: atom$TextEditor) => void): atom$Disposable;

  // Opening
  open(uri: string, options?: {
    initialLine?: number;
    initialColumn?: number;
    split?: string;
    activePane?: boolean;
    searchAllPanes?: boolean;
  }): Promise<atom$TextEditor>;

  // Pane Items
  getPaneItems(): Array<Object>;
  getActivePaneItem(): Object;
  getTextEditors(): Array<atom$TextEditor>;
  getActiveTextEditor(): ?atom$TextEditor;

  // Panes
  getActivePane(): atom$Pane;

  // Panels
  addBottomPanel(options: {
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

declare class atom$ContextMenuManager {
  add(itemsBySelector: Object): void;
}

declare class atom$Directory {
  symlink: boolean;

  // File Metadata
  isFile(): boolean;
  isDirectory(): boolean;

  // Managing Paths
  getPath(): string;
  getBaseName(): string;

  // Traversing
  getParent(): atom$Directory;
  contains(path: string): boolean;
}

declare class atom$File {
  symlink: boolean;

  // File Metadata
  isFile(): boolean;
  isDirectory(): boolean;

  // Managing Paths
  getPath(): string;
  getBaseName(): string;

  // Traversing
  getParent(): atom$Directory;
}

declare class atom$Project {
  getDirectories(): Array<atom$Directory>
}

declare class atom$TextBuffer {
  file: ?atom$File;

  // Search And Replace
  scanInRange(regex: RegExp, range: Range, iterator: (data: Object) => void): void;

  // Buffer Range Details
  rangeForRow(row: number, includeNewLine?: boolean): Range;
}

declare class atom$Notification {
  getType(): string;
  getMessage(): string;
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
declare module "atom" {
  declare var CompositeDisposable: typeof atom$CompositeDisposable;
  declare var Disposable: typeof atom$Disposable;
  declare var Emitter: typeof atom$Emitter;
  declare var Panel: typeof atom$Panel;
  declare var Point: typeof atom$Point;
  declare var Range: typeof atom$Range;
  declare var TextEditor: typeof atom$TextEditor;
  declare var Notification: typeof atom$Notification;
}

// Make sure that common types can be referenced without the `atom$` prefix
// in type declarations.
declare var Cursor: typeof atom$Cursor;
declare var Panel: typeof atom$Panel;
declare var TextEditor: typeof atom$TextEditor;

// The properties of this type match the properties of the `atom` global.
// This list is not complete.
type AtomGlobal = {
  commands: atom$CommandRegistry;
  config: atom$Config;
  contextMenu: atom$ContextMenuManager;
  notifications: atom$NotificationManager;
  packages: atom$PackageManager;
  views: atom$ViewRegistry;
  workspace: atom$Workspace;
  project: atom$Project;
}

declare var atom: AtomGlobal;

/**
 * ipc is used by webviews to communicate with the parent view.
 */
declare module "ipc" {
  declare function on(name: string, callback: (event: any) => void): atom$Disposable;
  declare function sendToHost(name: string, ...args: any[]): void;
}

declare class WebviewElement extends HTMLElement {
  src: string;
  nodeintegration: boolean;

  send(): void;
}
