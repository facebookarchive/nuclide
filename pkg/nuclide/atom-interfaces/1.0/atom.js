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
  add(
    target: string,
    commandName: string | {[commandName: string]: (event: Event) => void},
    callback?: (event: Event) => void
  ): atom$Disposable;
}

declare class atom$CompositeDisposable {
  constructor(...disposables: atom$IDisposable[]): void;
  dispose(): void;

  add(disposable: atom$IDisposable): void;
  remove(disposable: atom$IDisposable): void;
  clear(): void;
}

declare class atom$Config {
  observe(
    keyPath: string,
    optionsOrCallback?: (Object | (value: any) => void),
    callback?: (value: any) => void
  ): atom$IDisposable;
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
  resolvePackagePath(name: string): ?string;
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
  markBufferRange(range: atom$Range | number[][]): atom$Marker;

  // Cursors
  getCursorBufferPosition(): atom$Point;
  getLastCursor(): atom$Cursor;

  // Selections
  // Searching and Replacing
  // Tab Behavior
  // Soft Wrap Behavior
  // Indentation
  indentationForBufferRow(bufferRow: number): number;

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
  addViewProvider(providerSpec: {
    modelConstructor: any;
    viewConstructor?: any;
    createView?: (...args: any[]) => ?HTMLElement;
  }): atom$Disposable;
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
  // Panels
  addBottomPanel(options: {
    item: Object;
    visible?: boolean;
    priority?: number;
  }): atom$Panel;

  addModalPanel(options: {
    item: Node | Disposable;
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
  // Search And Replace
  scanInRange(regex: RegExp, range: Range, iterator: (data: Object) => void): void;

  // Buffer Range Details
  rangeForRow(row: number, includeNewLine?: boolean): Range;
}

// The items in this declaration are available off of `require('atom')`.
// This list is not complete.
declare module "atom" {
  declare class CompositeDisposable extends atom$CompositeDisposable {}
  declare class Disposable extends atom$Disposable {}
  declare class Emitter extends atom$Emitter {}
  declare class Panel extends atom$Panel {}
  declare class Point extends atom$Point {}
  declare class Range extends atom$Range {}
  declare class TextEditor extends atom$TextEditor {}
}

// Make sure that common types can be referenced without the `atom$` prefix
// in type declarations.
import * as Atom from "atom"
declare class Cursor extends atom$Cursor {}
declare class Panel extends atom$Panel {}
declare class TextEditor extends atom$TextEditor {}

// The properties of this type match the properties of the `atom` global.
// This list is not complete.
type AtomGlobal = {
  commands: atom$CommandRegistry;
  config: atom$Config;
  contextMenu: atom$ContextMenuManager;
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
