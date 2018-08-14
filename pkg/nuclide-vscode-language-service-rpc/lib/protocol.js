"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WatchKind = exports.FileChangeType = exports.TextDocumentSaveReason = exports.MessageType = exports.SymbolKind = exports.DocumentHighlightKind = exports.CompletionItemKind = exports.InsertTextFormat = exports.TextDocumentSyncKind = exports.ErrorCodes = exports.DiagnosticSeverity = void 0;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
// Flow definitions for Microsoft's Language Server Protocol
// https://github.com/Microsoft/language-server-protocol/blob/master/protocol.md
// https://github.com/Microsoft/language-server-protocol/blob/master/versions/protocol-2-x.md
// Structures
// Nuclide-only.
const DiagnosticSeverity = {
  // Reports an error.
  Error: 1,
  // Reports a warning.
  Warning: 2,
  // Reports an information.
  Information: 3,
  // Reports a hint.
  Hint: 4
};
exports.DiagnosticSeverity = DiagnosticSeverity;
// General
const ErrorCodes = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
  serverErrorStart: -32099,
  serverErrorEnd: -32000,
  ServerNotInitialized: -32002,
  UnknownErrorCode: -32001,
  // eslint-disable-next-line nuclide-internal/api-spelling
  RequestCancelled: -32800
};
exports.ErrorCodes = ErrorCodes;
// Defines how the host (editor) should sync document changes to the language server.
const TextDocumentSyncKind = {
  //  Documents should not be synced at all.
  None: 0,
  //  Documents are synced by always sending the full content of the document.
  Full: 1,
  //  Documents are synced by sending the full content on open. After that only incremental
  //  updates to the document are sent.
  Incremental: 2
}; // Completion options.

exports.TextDocumentSyncKind = TextDocumentSyncKind;
// Defines whether the insert text in a completion item should be interpreted as plain text or a snippet.
const InsertTextFormat = {
  PlainText: 1,
  Snippet: 2
};
exports.InsertTextFormat = InsertTextFormat;
// The kind of a completion entry.
const CompletionItemKind = {
  Text: 1,
  Method: 2,
  Function: 3,
  Constructor: 4,
  Field: 5,
  Variable: 6,
  Class: 7,
  Interface: 8,
  Module: 9,
  Property: 10,
  Unit: 11,
  Value: 12,
  Enum: 13,
  Keyword: 14,
  Snippet: 15,
  Color: 16,
  File: 17,
  Reference: 18
};
exports.CompletionItemKind = CompletionItemKind;
const DocumentHighlightKind = {
  // A textual occurrence.
  Text: 1,
  // Read-access of a symbol, like reading a variable.
  Read: 2,
  // Write-access of a symbol, like writing to a variable.
  Write: 3
};
exports.DocumentHighlightKind = DocumentHighlightKind;
const SymbolKind = {
  File: 1,
  Module: 2,
  Namespace: 3,
  Package: 4,
  Class: 5,
  Method: 6,
  Property: 7,
  Field: 8,
  Constructor: 9,
  Enum: 10,
  Interface: 11,
  Function: 12,
  Variable: 13,
  Constant: 14,
  String: 15,
  Number: 16,
  Boolean: 17,
  Array: 18
}; // The parameters of a Workspace Symbol Request.

exports.SymbolKind = SymbolKind;
const MessageType = {
  // An error message.
  Error: 1,
  // A warning message.
  Warning: 2,
  // An information message.
  Info: 3,
  // A log message.
  Log: 4
};
exports.MessageType = MessageType;
const TextDocumentSaveReason = {
  // Manually triggered, e.g. by the user pressing save, by starting debugging,
  // or by an API call.
  Manual: 1,
  // Automatic after a delay.
  AfterDelay: 2,
  // When the editor lost focus.
  FocusOut: 3
}; // An event describing a change to a text document. If range and rangeLength are omitted
// the new text is considered to be the full content of the document.

exports.TextDocumentSaveReason = TextDocumentSaveReason;
// The file event type.
const FileChangeType = {
  // The file got created.
  Created: 1,
  // The file got changed.
  Changed: 2,
  // The file got deleted.
  Deleted: 3
}; // An event describing a file change.

exports.FileChangeType = FileChangeType;
const WatchKind = {
  // Interested in create events
  Create: 1,
  // Interested in change events
  Change: 2,
  // Interested in delete events
  Delete: 4
};
exports.WatchKind = WatchKind;