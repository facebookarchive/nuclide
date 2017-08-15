'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const DiagnosticSeverity = exports.DiagnosticSeverity = {
  // Reports an error.
  Error: 1,
  // Reports a warning.
  Warning: 2,
  // Reports an information.
  Information: 3,
  // Reports a hint.
  Hint: 4
}; /**
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

// General

const ErrorCodes = exports.ErrorCodes = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
  serverErrorStart: -32099,
  serverErrorEnd: -32000,
  ServerNotInitialized: -32002,
  UnknownErrorCode: -32001,
  RequestCancelled: -32800
};

//  Workspace specific client capabilities.


//  Text document specific client capabilities.


// Defines how the host (editor) should sync document changes to the language server.
const TextDocumentSyncKind = exports.TextDocumentSyncKind = {
  //  Documents should not be synced at all.
  None: 0,
  //  Documents are synced by always sending the full content of the document.
  Full: 1,
  //  Documents are synced by sending the full content on open. After that only incremental
  //  updates to the document are sent.
  Incremental: 2
};

// Completion options.


// Signature help options.


// Code Lens options.


// Format document on type options


// Save options.


// Document

// Represents a collection of [completion items](#CompletionItem) to be presented in the editor.


// Defines whether the insert text in a completion item should be interpreted as plain text or a snippet.
const InsertTextFormat = exports.InsertTextFormat = {
  PlainText: 1,
  Snippet: 2
};

// The kind of a completion entry.
const CompletionItemKind = exports.CompletionItemKind = {
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

// The result of a hover request.


/**
 * The marked string is rendered:
 * - as markdown if it is represented as a string
 * - as code block of the given langauge if it is represented as a pair of a language and a value
 *
 * The pair of a language and a value is an equivalent to markdown:
 * ```${language};
 * ${value};
 * ```
 */


/**
 * Signature help represents the signature of something
 * callable. There can be multiple signature but only one
 * active and only one active parameter.
 */


/**
 * Represents the signature of something callable. A signature
 * can have a label, like a function-name, a doc-comment, and
 * a set of parameters.
 */


/**
 * Represents a parameter of a callable-signature. A parameter can
 * have a label and a doc-comment.
 */


/**
 * A document highlight is a range inside a text document which deserves
 * special attention. Usually a document highlight is visualized by changing
 * the background color of its range.
 *
 */
const DocumentHighlightKind = exports.DocumentHighlightKind = {
  // A textual occurrance.
  Text: 1,
  // Read-access of a symbol, like reading a variable.
  Read: 2,
  // Write-access of a symbol, like writing to a variable.
  Write: 3
};

/**
 * Represents information about programming constructs like variables, classes,
 * interfaces etc.
 */
const SymbolKind = exports.SymbolKind = {
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
};

// The parameters of a Workspace Symbol Request.


// Params for the CodeActionRequest


// Contains additional diagnostic information about the context in which a code action is run.


/**
 * A code lens represents a command that should be shown along with
 * source text, like the number of references, a way to run tests, etc.
 *
 * A code lens is _unresolved_ when no command is associated to it. For performance
 * reasons the creation of a code lens and resolving should be done in two stages.
 */


/**
 * A document link is a range in a text document that links to an internal or
* external resource, like another
 * text document or a web site.
 */


// Value-object describing what options formatting should use.


// TypeCoverageParams: a nuclide-specific way to show type coverage for a file


// Window

const MessageType = exports.MessageType = {
  // An error message.
  Error: 1,
  // A warning message.
  Warning: 2,
  // An information message.
  Info: 3,
  // A log message.
  Log: 4
};

// Workspace

// An event describing a change to a text document. If range and rangeLength are omitted
// the new text is considered to be the full content of the document.


// The file event type.
const FileChangeType = exports.FileChangeType = {
  // The file got created.
  Created: 1,
  // The file got changed.
  Changed: 2,
  // The file got deleted.
  Deleted: 3
};

// An event describing a file change.