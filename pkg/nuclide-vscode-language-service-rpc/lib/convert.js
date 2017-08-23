'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.localPath_lspUri = localPath_lspUri;
exports.lspUri_localPath = lspUri_localPath;
exports.lspTextEdits_atomTextEdits = lspTextEdits_atomTextEdits;
exports.lspLocation_atomFoundReference = lspLocation_atomFoundReference;
exports.lspLocation_atomDefinition = lspLocation_atomDefinition;
exports.localPath_lspTextDocumentIdentifier = localPath_lspTextDocumentIdentifier;
exports.atomPoint_lspPosition = atomPoint_lspPosition;
exports.lspPosition_atomPoint = lspPosition_atomPoint;
exports.lspRange_atomRange = lspRange_atomRange;
exports.atomRange_lspRange = atomRange_lspRange;
exports.atom_lspPositionParams = atom_lspPositionParams;
exports.lspCompletionItem_atomCompletion = lspCompletionItem_atomCompletion;
exports.lspMessageType_atomShowNotificationLevel = lspMessageType_atomShowNotificationLevel;
exports.lspSymbolKind_atomIcon = lspSymbolKind_atomIcon;
exports.lspSymbolInformation_atomTokenizedText = lspSymbolInformation_atomTokenizedText;
exports.lspSymbolInformation_atomSymbolResult = lspSymbolInformation_atomSymbolResult;
exports.lspCommand_atomCodeAction = lspCommand_atomCodeAction;
exports.atomDiagnostic_lspDiagnostic = atomDiagnostic_lspDiagnostic;
exports.lspDiagnostics_atomDiagnostics = lspDiagnostics_atomDiagnostics;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

var _protocol;

function _load_protocol() {
  return _protocol = require('./protocol');
}

var _tokenizedText;

function _load_tokenizedText() {
  return _tokenizedText = require('nuclide-commons/tokenized-text');
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function localPath_lspUri(filepath) {
  // NuclideUris are either a local file path, or nuclide://<host><path>.
  // LSP URIs are always file://
  if (!(_nuclideUri || _load_nuclideUri()).default.isLocal(filepath)) {
    throw new Error(`Expected a local filepath, not ${filepath}`);
  } else {
    return (_nuclideUri || _load_nuclideUri()).default.nuclideUriToUri(filepath);
  }
}

function lspUri_localPath(uri) {
  // We accept LSP file:// URIs, and also plain paths for back-compat
  // We return a local path.
  const path = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(uri);
  if (path == null || !(_nuclideUri || _load_nuclideUri()).default.isLocal(path)) {
    throw new Error(`LSP returned an invalid URI ${uri}`);
  } else {
    return path;
  }
}

function lspTextEdits_atomTextEdits(edits) {
  return edits.map(lspTextEdit => {
    const oldRange = lspRange_atomRange(lspTextEdit.range);
    return {
      oldRange,
      newText: lspTextEdit.newText
    };
  });
}

function lspLocation_atomFoundReference(location) {
  return {
    uri: lspUri_localPath(location.uri),
    // although called a "uri" its really a string used for grouping.
    name: null,
    range: lspRange_atomRange(location.range)
  };
}

function lspLocation_atomDefinition(location, projectRoot) {
  return {
    path: lspUri_localPath(location.uri),
    position: lspPosition_atomPoint(location.range.start),
    language: 'lsp', // pointless; only ever used to judge equality of two defs
    projectRoot };
}

function localPath_lspTextDocumentIdentifier(filePath) {
  return {
    uri: localPath_lspUri(filePath)
  };
}

function atomPoint_lspPosition(position) {
  return {
    line: position.row,
    character: position.column
  };
}

function lspPosition_atomPoint(position) {
  return new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(position.line, position.character);
}

function lspRange_atomRange(range) {
  return new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(lspPosition_atomPoint(range.start), lspPosition_atomPoint(range.end));
}

function atomRange_lspRange(range) {
  return {
    start: atomPoint_lspPosition(range.start),
    end: atomPoint_lspPosition(range.end)
  };
}

function atom_lspPositionParams(filePath, point) {
  return {
    textDocument: localPath_lspTextDocumentIdentifier(filePath),
    position: atomPoint_lspPosition(point)
  };
}

function lspCompletionItemKind_atomCompletionType(kind) {
  switch (kind) {
    case (_protocol || _load_protocol()).CompletionItemKind.Text:
      return '';
    case (_protocol || _load_protocol()).CompletionItemKind.Method:
      return 'method';
    case (_protocol || _load_protocol()).CompletionItemKind.Function:
      return 'function';
    case (_protocol || _load_protocol()).CompletionItemKind.Constructor:
      return 'function'; // Not an exact match, but the best we can do
    case (_protocol || _load_protocol()).CompletionItemKind.Field:
      return 'property';
    case (_protocol || _load_protocol()).CompletionItemKind.Variable:
      return 'variable';
    case (_protocol || _load_protocol()).CompletionItemKind.Class:
      return 'class';
    case (_protocol || _load_protocol()).CompletionItemKind.Interface:
      return 'type';
    case (_protocol || _load_protocol()).CompletionItemKind.Module:
      // see .Module, .File, .Unit, .Reference
      return 'import';
    case (_protocol || _load_protocol()).CompletionItemKind.Property:
      return 'property';
    case (_protocol || _load_protocol()).CompletionItemKind.Unit:
      return 'require';
    case (_protocol || _load_protocol()).CompletionItemKind.Value:
      return 'value';
    case (_protocol || _load_protocol()).CompletionItemKind.Enum:
      return 'constant'; // closest we can do. Alternative is 'tag'
    case (_protocol || _load_protocol()).CompletionItemKind.Keyword:
      return 'keyword';
    case (_protocol || _load_protocol()).CompletionItemKind.Snippet:
      return 'snippet';
    case (_protocol || _load_protocol()).CompletionItemKind.Color:
      return 'constant'; // closest we can do.
    case (_protocol || _load_protocol()).CompletionItemKind.File:
      return 'require';
    case (_protocol || _load_protocol()).CompletionItemKind.Reference:
      return 'require';
    default:
      return null;
  }
}

function lspCompletionItem_atomCompletion(item) {
  const useSnippet = item.insertTextFormat === (_protocol || _load_protocol()).InsertTextFormat.Snippet;
  return {
    // LSP: label is what should be displayed in the autocomplete list
    // Atom: displayText is what's displayed
    displayText: item.label,
    // LSP: if insertText is present, insert that, else fall back to label
    // LSP: insertTextFormat says whether we're inserting text or snippet
    // Atom: text/snippet: one of them has to be defined
    // flowlint-next-line sketchy-null-string:off
    snippet: useSnippet ? item.insertText || item.label : undefined,
    // flowlint-next-line sketchy-null-string:off
    text: useSnippet ? undefined : item.insertText || item.label,
    // LSP: [nuclide-specific] itemType is return type of function
    // Atom: it's convention to display return types in the left column
    leftLabel: item.itemType,
    // LSP: [nuclide-specific] inlineDetail is to be displayed next to label
    // Atom: it's convention to display details like parameters to the right
    rightLabel: item.inlineDetail,
    // LSP: kind indicates what icon should be used
    // ATOM: type is to indicate icon and its background color
    type: lspCompletionItemKind_atomCompletionType(item.kind),
    // LSP detail is the thing's signature
    // Atom: description is displayed in the footer of the autocomplete tab
    description: item.detail
  };
}

function lspMessageType_atomShowNotificationLevel(type) {
  switch (type) {
    case (_protocol || _load_protocol()).MessageType.Info:
      return 'info';
    case (_protocol || _load_protocol()).MessageType.Warning:
      return 'warning';
    case (_protocol || _load_protocol()).MessageType.Log:
      return 'log';
    case (_protocol || _load_protocol()).MessageType.Error:
      return 'error';
    default:
      return 'error';
  }
}

function lspSymbolKind_atomIcon(kind) {
  // Atom icons: https://github.com/atom/atom/blob/master/static/octicons.less
  // You can see the pictures at https://octicons.github.com/
  // for reference, vscode: https://github.com/Microsoft/vscode/blob/be08f9f3a1010354ae2d8b84af017ed1043570e7/src/vs/editor/contrib/suggest/browser/media/suggest.css#L135
  // for reference, hack: https://github.com/facebook/nuclide/blob/20cf17dca439e02a64f4365f3a52b0f26cf53726/pkg/nuclide-hack-rpc/lib/SymbolSearch.js#L120
  switch (kind) {
    case (_protocol || _load_protocol()).SymbolKind.File:
      return 'file';
    case (_protocol || _load_protocol()).SymbolKind.Module:
      return 'file-submodule';
    case (_protocol || _load_protocol()).SymbolKind.Namespace:
      return 'file-submodule';
    case (_protocol || _load_protocol()).SymbolKind.Package:
      return 'package';
    case (_protocol || _load_protocol()).SymbolKind.Class:
      return 'code';
    case (_protocol || _load_protocol()).SymbolKind.Method:
      return 'zap';
    case (_protocol || _load_protocol()).SymbolKind.Property:
      return 'key';
    case (_protocol || _load_protocol()).SymbolKind.Field:
      return 'key';
    case (_protocol || _load_protocol()).SymbolKind.Constructor:
      return 'zap';
    case (_protocol || _load_protocol()).SymbolKind.Enum:
      return 'file-binary';
    case (_protocol || _load_protocol()).SymbolKind.Interface:
      return 'puzzle';
    case (_protocol || _load_protocol()).SymbolKind.Function:
      return 'zap';
    case (_protocol || _load_protocol()).SymbolKind.Variable:
      return 'pencil';
    case (_protocol || _load_protocol()).SymbolKind.Constant:
      return 'quote';
    case (_protocol || _load_protocol()).SymbolKind.String:
      return 'quote';
    case (_protocol || _load_protocol()).SymbolKind.Number:
      return 'quote';
    case (_protocol || _load_protocol()).SymbolKind.Boolean:
      return 'quote';
    case (_protocol || _load_protocol()).SymbolKind.Array:
      return 'list-ordered';
    default:
      return 'question';
  }
}

// Converts an LSP SymbolInformation into TokenizedText
function lspSymbolInformation_atomTokenizedText(symbol) {
  const tokens = [];

  // The TokenizedText ontology is deliberately small, much smaller than
  // SymbolInformation.kind, because it's used for colorization and you don't
  // want your colorized text looking like a fruit salad.
  switch (symbol.kind) {
    case (_protocol || _load_protocol()).SymbolKind.File:
    case (_protocol || _load_protocol()).SymbolKind.Module:
    case (_protocol || _load_protocol()).SymbolKind.Package:
    case (_protocol || _load_protocol()).SymbolKind.Namespace:
      tokens.push((0, (_tokenizedText || _load_tokenizedText()).plain)(symbol.name));
      break;
    case (_protocol || _load_protocol()).SymbolKind.Class:
    case (_protocol || _load_protocol()).SymbolKind.Interface:
      tokens.push((0, (_tokenizedText || _load_tokenizedText()).className)(symbol.name));
      break;
    case (_protocol || _load_protocol()).SymbolKind.Constructor:
      tokens.push((0, (_tokenizedText || _load_tokenizedText()).constructor)(symbol.name));
      break;
    case (_protocol || _load_protocol()).SymbolKind.Method:
    case (_protocol || _load_protocol()).SymbolKind.Property:
    case (_protocol || _load_protocol()).SymbolKind.Field:
    case (_protocol || _load_protocol()).SymbolKind.Enum:
    case (_protocol || _load_protocol()).SymbolKind.Function:
    case (_protocol || _load_protocol()).SymbolKind.Constant:
    case (_protocol || _load_protocol()).SymbolKind.Variable:
    case (_protocol || _load_protocol()).SymbolKind.Array:
      tokens.push((0, (_tokenizedText || _load_tokenizedText()).method)(symbol.name));
      break;
    case (_protocol || _load_protocol()).SymbolKind.String:
    case (_protocol || _load_protocol()).SymbolKind.Number:
    case (_protocol || _load_protocol()).SymbolKind.Boolean:
      tokens.push((0, (_tokenizedText || _load_tokenizedText()).string)(symbol.name));
      break;
    default:
      tokens.push((0, (_tokenizedText || _load_tokenizedText()).plain)(symbol.name));
  }

  return tokens;
}

function lspSymbolInformation_atomSymbolResult(info) {
  let hoverText = 'unknown';
  for (const key in (_protocol || _load_protocol()).SymbolKind) {
    if (info.kind === (_protocol || _load_protocol()).SymbolKind[key]) {
      hoverText = key;
    }
  }
  return {
    path: lspUri_localPath(info.location.uri),
    line: info.location.range.start.line,
    column: info.location.range.start.character,
    name: info.name,
    containerName: info.containerName,
    icon: lspSymbolKind_atomIcon(info.kind),
    hoverText
  };
}

function lspSeverity_atomDiagnosticMessageType(severity) {
  switch (severity) {
    case null:
    case undefined:
    case (_protocol || _load_protocol()).DiagnosticSeverity.Error:
    default:
      return 'Error';
    case (_protocol || _load_protocol()).DiagnosticSeverity.Warning:
      return 'Warning';
    case (_protocol || _load_protocol()).DiagnosticSeverity.Information:
    case (_protocol || _load_protocol()).DiagnosticSeverity.Hint:
      return 'Info';
  }
}

function atomDiagnosticMessageType_lspSeverity(diagnosticType) {
  switch (diagnosticType) {
    case 'Error':
      return (_protocol || _load_protocol()).DiagnosticSeverity.Error;
    case 'Warning':
      return (_protocol || _load_protocol()).DiagnosticSeverity.Warning;
    case 'Info':
      // The inverse function maps both DiagnosticServerity.Hint and
      // DiagnosticServerity.Information to 'Info', but in the reverse direction
      // we'll pick to map 'Info' to DiagnosticSeverity.Information.
      return (_protocol || _load_protocol()).DiagnosticSeverity.Information;
    default:
      diagnosticType; // Will cause a Flow error if a new DiagnosticSeverity value is added.
      throw new Error('Unsupported DiagnosticMessageType');
  }
}

function lspRelatedLocation_atomTrace(related) {
  return {
    type: 'Trace',
    text: related.message,
    filePath: lspUri_localPath(related.location.uri),
    range: lspRange_atomRange(related.location.range)
  };
}

/**
* Converts an Atom Trace to an Lsp RelatedLocation. A RelatedLocation requires a
* range. Therefore, this will return null when called with an Atom Trace that
* does not have a range.
*/
function atomTrace_lspRelatedLocation(trace) {
  const { range, text, filePath } = trace;
  if (range != null) {
    return {
      message: text || '',
      location: {
        uri: localPath_lspUri(filePath || ''),
        range: atomRange_lspRange(range)
      }
    };
  }
  return null;
}

function lspDiagnostic_atomDiagnostic(diagnostic, filePath) {
  // TODO: pass the LSP diagnostic.code to Atom somehow
  return {
    scope: 'file',
    // flowlint-next-line sketchy-null-string:off
    providerName: diagnostic.source || 'LSP', // TODO
    type: lspSeverity_atomDiagnosticMessageType(diagnostic.severity),
    filePath,
    text: diagnostic.message,
    range: lspRange_atomRange(diagnostic.range),
    trace: (diagnostic.relatedLocations || []).map(lspRelatedLocation_atomTrace)
  };
}

function lspCommand_atomCodeAction(command, applyFunc) {
  return {
    getTitle: () => {
      return Promise.resolve(command.title);
    },
    apply: applyFunc,
    dispose: () => {}
  };
}

/**
* Converts an Atom FileMessageDiagnostic to an LSP Diagnostic. LSP diagnostics
* require a range, while they are currently optional for Atom Diangostics. Therefore,
* this will return null when called with an Atom Diagnostic without a range.
*/
function atomDiagnostic_lspDiagnostic(diagnostic) {
  if (diagnostic.range != null) {
    return {
      range: atomRange_lspRange(diagnostic.range),
      severity: atomDiagnosticMessageType_lspSeverity(diagnostic.type),
      source: diagnostic.providerName,
      message: diagnostic.text || '',
      relatedLocations: (0, (_collection || _load_collection()).arrayCompact)((diagnostic.trace || []).map(atomTrace_lspRelatedLocation))
    };
  }
  return null;
}

function lspDiagnostics_atomDiagnostics(params) {
  const filePath = lspUri_localPath(params.uri);
  return [{
    filePath,
    messages: params.diagnostics.map(d => lspDiagnostic_atomDiagnostic(d, filePath))
  }];
}