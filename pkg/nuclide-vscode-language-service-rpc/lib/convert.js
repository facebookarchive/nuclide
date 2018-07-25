"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.localPath_lspUri = localPath_lspUri;
exports.lspUri_localPath = lspUri_localPath;
exports.lspTextEdits_atomTextEdits = lspTextEdits_atomTextEdits;
exports.lspWorkspaceEdit_atomWorkspaceEdit = lspWorkspaceEdit_atomWorkspaceEdit;
exports.lspLocation_atomFoundReference = lspLocation_atomFoundReference;
exports.lspLocationWithTitle_atomDefinition = lspLocationWithTitle_atomDefinition;
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
exports.codeLensData_lspCodeLens = codeLensData_lspCodeLens;
exports.lspCodeLens_codeLensData = lspCodeLens_codeLensData;
exports.lspSignatureHelp_atomSignatureHelp = lspSignatureHelp_atomSignatureHelp;
exports.watchmanFileChange_lspFileEvent = watchmanFileChange_lspFileEvent;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _simpleTextBuffer() {
  const data = require("simple-text-buffer");

  _simpleTextBuffer = function () {
    return data;
  };

  return data;
}

function _protocol() {
  const data = require("./protocol");

  _protocol = function () {
    return data;
  };

  return data;
}

function _tokenizedText() {
  const data = require("../../../modules/nuclide-commons/tokenized-text");

  _tokenizedText = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
function localPath_lspUri(filepath) {
  // NuclideUris are either a local file path, or nuclide://<host><path>.
  // LSP URIs are always file://
  if (!_nuclideUri().default.isLocal(filepath)) {
    throw new Error(`Expected a local filepath, not ${filepath}`);
  } else {
    return _nuclideUri().default.nuclideUriToUri(filepath);
  }
}

function lspUri_localPath(uri) {
  // We accept LSP file:// URIs, and also plain paths for back-compat
  // We return a local path.
  const path = _nuclideUri().default.uriToNuclideUri(uri);

  if (path == null || !_nuclideUri().default.isLocal(path)) {
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
} //    WorkspaceEdits can either provide `changes` (a mapping of document URIs to their TextEdits)
//        or `documentChanges` (an array of TextDocumentEdits where
//        each text document edit addresses a specific version of a text document).
//
//    TODO: Compare the versions of the documents being edited with
//            the version numbers contained within `documentChanges`.
//          Right now, we use `documentChanges` while ignoring version numbers.


function lspWorkspaceEdit_atomWorkspaceEdit(lspWorkspaceEdit) {
  const workspaceEdit = new Map();
  const lspChanges = lspWorkspaceEdit.changes;
  const lspDocChanges = lspWorkspaceEdit.documentChanges;

  if (lspChanges != null) {
    Object.keys(lspChanges).forEach(lspUri => {
      const path = lspUri_localPath(lspUri);
      const textEdits = lspTextEdits_atomTextEdits(lspChanges[lspUri]);
      workspaceEdit.set(path, textEdits);
    });
  } else if (lspDocChanges != null) {
    lspDocChanges.forEach(textDocumentEdit => {
      const lspUri = textDocumentEdit.textDocument.uri;
      const lspTextEdits = textDocumentEdit.edits;
      const path = lspUri_localPath(lspUri);
      const textEdits = lspTextEdits_atomTextEdits(lspTextEdits);
      workspaceEdit.set(path, textEdits);
    });
  }

  return workspaceEdit;
}

function lspLocation_atomFoundReference(location) {
  return {
    uri: lspUri_localPath(location.uri),
    // although called a "uri" its really a string used for grouping.
    name: null,
    range: lspRange_atomRange(location.range)
  };
}

function lspLocationWithTitle_atomDefinition(location, projectRoot) {
  return {
    path: lspUri_localPath(location.uri),
    position: lspPosition_atomPoint(location.range.start),
    language: 'lsp',
    // pointless; only ever used to judge equality of two defs
    projectRoot,
    // used to relativize paths when showing multiple targets
    name: location.title == null ? undefined : location.title // nuclide-only

  };
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
  return new (_simpleTextBuffer().Point)(position.line, position.character);
}

function lspRange_atomRange(range) {
  return new (_simpleTextBuffer().Range)(lspPosition_atomPoint(range.start), lspPosition_atomPoint(range.end));
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
    case _protocol().CompletionItemKind.Text:
      return '';

    case _protocol().CompletionItemKind.Method:
      return 'method';

    case _protocol().CompletionItemKind.Function:
      return 'function';

    case _protocol().CompletionItemKind.Constructor:
      return 'function';
    // Not an exact match, but the best we can do

    case _protocol().CompletionItemKind.Field:
      return 'property';

    case _protocol().CompletionItemKind.Variable:
      return 'variable';

    case _protocol().CompletionItemKind.Class:
      return 'class';

    case _protocol().CompletionItemKind.Interface:
      return 'type';

    case _protocol().CompletionItemKind.Module:
      // see .Module, .File, .Unit, .Reference
      return 'import';

    case _protocol().CompletionItemKind.Property:
      return 'property';

    case _protocol().CompletionItemKind.Unit:
      return 'require';

    case _protocol().CompletionItemKind.Value:
      return 'value';

    case _protocol().CompletionItemKind.Enum:
      return 'constant';
    // closest we can do. Alternative is 'tag'

    case _protocol().CompletionItemKind.Keyword:
      return 'keyword';

    case _protocol().CompletionItemKind.Snippet:
      return 'snippet';

    case _protocol().CompletionItemKind.Color:
      return 'constant';
    // closest we can do.

    case _protocol().CompletionItemKind.File:
      return 'require';

    case _protocol().CompletionItemKind.Reference:
      return 'require';

    default:
      return null;
  }
}

function lspCompletionItemKind_atomIcon(kind) {
  // returns null if there should be no icon
  // returns 'DEFAULT' for the default icon provided by AutocompletePlus
  // returns anything else for an Atom icon
  // Unfortunately, LSP doesn't yet have CompletionItemKinds for all the
  // possible SymbolKinds (e.g. CompletionItemKind is missing namespace).
  // So LSP servers will presumably be returning an alternative, e.g. maybe
  // CompletionItemKind.Module for their namespaces.
  // https://github.com/Microsoft/language-server-protocol/issues/155
  // Unfortunately, Atom only provides a thematically unified 'type-*' icon set
  // for SymbolKind icons (e.g. it has no icon for Value or Keyword).
  // In such cases we try to fall back to the icons provided by AutocompletePlus
  switch (kind) {
    case null:
      return null;

    case _protocol().CompletionItemKind.Text:
      return null;
    // no Atom icon, and no good AutocompletePlus fallback

    case _protocol().CompletionItemKind.Method:
      return 'type-method';

    case _protocol().CompletionItemKind.Function:
      return 'type-function';

    case _protocol().CompletionItemKind.Constructor:
      return 'type-constructor';

    case _protocol().CompletionItemKind.Field:
      return 'type-field';

    case _protocol().CompletionItemKind.Variable:
      return 'type-variable';

    case _protocol().CompletionItemKind.Class:
      return 'type-class';

    case _protocol().CompletionItemKind.Interface:
      return 'type-interface';

    case _protocol().CompletionItemKind.Module:
      return 'type-module';

    case _protocol().CompletionItemKind.Property:
      return 'type-property';

    case _protocol().CompletionItemKind.Unit:
      return null;
    // not even sure what this is supposed to be

    case _protocol().CompletionItemKind.Value:
      return 'DEFAULT';
    // this has a good fallback in AutocompletePlus

    case _protocol().CompletionItemKind.Enum:
      return 'type-enum';

    case _protocol().CompletionItemKind.Keyword:
      return 'DEFAULT';
    // this has a good fallback in AutocompletePlus

    case _protocol().CompletionItemKind.Snippet:
      return 'DEFAULT';
    // this has a good fallback in AutocompletePlus

    case _protocol().CompletionItemKind.Color:
      return null;
    // no Atom icon, and no suitable fallback in AutocompletePlus

    case _protocol().CompletionItemKind.File:
      return 'type-file';

    case _protocol().CompletionItemKind.Reference:
      return null;
    // not even sure what this is supposed to be

    default:
      return null;
  }
}

function lspCompletionItem_atomCompletion(item, supportsResolve) {
  const useSnippet = item.insertTextFormat === _protocol().InsertTextFormat.Snippet;

  const lspTextEdits = getCompletionTextEdits(item);
  const icon = lspCompletionItemKind_atomIcon(item.kind);
  let iconHTML;

  if (icon == null) {
    iconHTML = ''; // no icon at all
  } else if (icon === 'DEFAULT') {
    iconHTML = undefined; // fall through to the default AutocompletePlus icon
  } else {
    iconHTML = `<span class="icon-${icon}"></span>`;
  }

  const descriptionItems = [];

  if (item.detail != null && item.detail !== '') {
    descriptionItems.push(item.detail);
  }

  let descriptionMarkdown;
  const documentation = item.documentation;

  if (typeof documentation === 'string') {
    descriptionItems.push(documentation);
  } else if (documentation != null) {
    // documentation is a MarkupContent.
    descriptionMarkdown = documentation.value;
  }

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
    // ATOM: iconHTML can be used to override the icon
    type: lspCompletionItemKind_atomCompletionType(item.kind),
    iconHTML,
    // LSP: create from detail (signature) and documentation (doc block)
    // Atom: description is displayed in the footer of the autocomplete tab
    description: descriptionItems.join('\n\n'),
    descriptionMarkdown,
    textEdits: lspTextEdits != null ? lspTextEdits_atomTextEdits(lspTextEdits) : undefined,
    // Resolving a completion item in the LSP requires passing in the original
    // completion item, and since completion items are sent over the wire we
    // already know they're serializable to JSON.
    extraData: supportsResolve ? JSON.stringify(item) : undefined,
    // LSP and Nuclide extension: string used to filter a set of completion items
    filterText: item.filterText,
    // LSP and Nuclide extension: string used to compare a completion item to another
    sortText: item.sortText
  };
}

function getCompletionTextEdits(item) {
  if (item.textEdit != null) {
    if (item.additionalTextEdits != null) {
      return [item.textEdit, ...item.additionalTextEdits];
    } else {
      return [item.textEdit];
    }
  }

  return null;
}

function lspMessageType_atomShowNotificationLevel(type) {
  switch (type) {
    case _protocol().MessageType.Info:
      return 'info';

    case _protocol().MessageType.Warning:
      return 'warning';

    case _protocol().MessageType.Log:
      return 'log';

    case _protocol().MessageType.Error:
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
    case _protocol().SymbolKind.File:
      return 'type-file';

    case _protocol().SymbolKind.Module:
      return 'type-module';

    case _protocol().SymbolKind.Namespace:
      return 'type-namespace';

    case _protocol().SymbolKind.Package:
      return 'type-package';

    case _protocol().SymbolKind.Class:
      return 'type-class';

    case _protocol().SymbolKind.Method:
      return 'type-method';

    case _protocol().SymbolKind.Property:
      return 'type-property';

    case _protocol().SymbolKind.Field:
      return 'type-field';

    case _protocol().SymbolKind.Constructor:
      return 'type-constructor';

    case _protocol().SymbolKind.Enum:
      return 'type-enum';

    case _protocol().SymbolKind.Interface:
      return 'type-interface';

    case _protocol().SymbolKind.Function:
      return 'type-function';

    case _protocol().SymbolKind.Variable:
      return 'type-variable';

    case _protocol().SymbolKind.Constant:
      return 'type-constant';

    case _protocol().SymbolKind.String:
      return 'type-string';

    case _protocol().SymbolKind.Number:
      return 'type-number';

    case _protocol().SymbolKind.Boolean:
      return 'type-boolean';

    case _protocol().SymbolKind.Array:
      return 'type-array';

    default:
      return 'question';
  }
} // Converts an LSP SymbolInformation into TokenizedText


function lspSymbolInformation_atomTokenizedText(symbol) {
  const tokens = []; // The TokenizedText ontology is deliberately small, much smaller than
  // SymbolInformation.kind, because it's used for colorization and you don't
  // want your colorized text looking like a fruit salad.

  switch (symbol.kind) {
    case _protocol().SymbolKind.File:
    case _protocol().SymbolKind.Module:
    case _protocol().SymbolKind.Package:
    case _protocol().SymbolKind.Namespace:
      tokens.push((0, _tokenizedText().plain)(symbol.name));
      break;

    case _protocol().SymbolKind.Class:
    case _protocol().SymbolKind.Interface:
      tokens.push((0, _tokenizedText().className)(symbol.name));
      break;

    case _protocol().SymbolKind.Constructor:
      tokens.push((0, _tokenizedText().constructor)(symbol.name));
      break;

    case _protocol().SymbolKind.Method:
    case _protocol().SymbolKind.Property:
    case _protocol().SymbolKind.Field:
    case _protocol().SymbolKind.Enum:
    case _protocol().SymbolKind.Function:
    case _protocol().SymbolKind.Constant:
    case _protocol().SymbolKind.Variable:
    case _protocol().SymbolKind.Array:
      tokens.push((0, _tokenizedText().method)(symbol.name));
      break;

    case _protocol().SymbolKind.String:
    case _protocol().SymbolKind.Number:
    case _protocol().SymbolKind.Boolean:
      tokens.push((0, _tokenizedText().string)(symbol.name));
      break;

    default:
      tokens.push((0, _tokenizedText().plain)(symbol.name));
  }

  return tokens;
}

function lspSymbolInformation_atomSymbolResult(info) {
  let hoverText = 'unknown';

  for (const key in _protocol().SymbolKind) {
    if (info.kind === _protocol().SymbolKind[key]) {
      hoverText = key;
    }
  }

  return {
    resultType: 'SYMBOL',
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
    case _protocol().DiagnosticSeverity.Error:
    default:
      return 'Error';

    case _protocol().DiagnosticSeverity.Warning:
      return 'Warning';

    case _protocol().DiagnosticSeverity.Information:
      return 'Info';

    case _protocol().DiagnosticSeverity.Hint:
      return 'Hint';
  }
}

function atomDiagnosticMessageType_lspSeverity(diagnosticType) {
  switch (diagnosticType) {
    case 'Error':
      return _protocol().DiagnosticSeverity.Error;

    case 'Warning':
      return _protocol().DiagnosticSeverity.Warning;

    case 'Info':
      return _protocol().DiagnosticSeverity.Information;

    case 'Hint':
      return _protocol().DiagnosticSeverity.Hint;

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
  const {
    range,
    text,
    filePath
  } = trace;

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

function lspDiagnostic_atomDiagnostic(diagnostic, filePath, // has already been converted for us
defaultSource) {
  const atomDiagnostic = {
    providerName: diagnostic.source != null ? diagnostic.source : defaultSource,
    type: lspSeverity_atomDiagnosticMessageType(diagnostic.severity),
    filePath,
    text: diagnostic.message,
    range: lspRange_atomRange(diagnostic.range),
    trace: (diagnostic.relatedLocations || []).map(lspRelatedLocation_atomTrace)
  };

  if (diagnostic.code != null) {
    atomDiagnostic.providerName += ': ' + String(diagnostic.code);
    atomDiagnostic.code = parseInt(String(diagnostic.code), 10);
  }

  return atomDiagnostic;
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
    const lspDiagnostic = {
      range: atomRange_lspRange(diagnostic.range),
      severity: atomDiagnosticMessageType_lspSeverity(diagnostic.type),
      source: diagnostic.providerName,
      message: diagnostic.text || '',
      relatedLocations: (0, _collection().arrayCompact)((diagnostic.trace || []).map(atomTrace_lspRelatedLocation))
    };

    if (diagnostic.code != null) {
      lspDiagnostic.code = diagnostic.code;
    }

    return lspDiagnostic;
  }

  return null;
}

function lspDiagnostics_atomDiagnostics(params, defaultSource) {
  const filePath = lspUri_localPath(params.uri);
  return new Map([[filePath, params.diagnostics.map(d => lspDiagnostic_atomDiagnostic(d, filePath, defaultSource))]]);
}

function codeLensData_lspCodeLens(codeLensData) {
  return {
    range: {
      start: {
        line: codeLensData.range.start.row,
        character: codeLensData.range.start.column
      },
      end: {
        line: codeLensData.range.end.row,
        character: codeLensData.range.end.column
      }
    },
    command: codeLensData.command,
    data: codeLensData.data
  };
}

function lspCodeLens_codeLensData(codeLens) {
  return {
    range: new (_simpleTextBuffer().Range)(new (_simpleTextBuffer().Point)(codeLens.range.start.line, codeLens.range.start.character), new (_simpleTextBuffer().Point)(codeLens.range.end.line, codeLens.range.end.character)),
    command: codeLens.command,
    data: codeLens.data
  };
}

function lspSignatureHelp_atomSignatureHelp(signatureHelp) {
  // Mostly compatible, except for the MarkupContent strings.
  // Currently, atom-ide-ui's signature help implementation always renders markdown anyway.
  return {
    signatures: signatureHelp.signatures.map(sig => ({
      label: sig.label,
      documentation: sig.documentation != null && typeof sig.documentation === 'object' ? sig.documentation.value : sig.documentation,
      parameters: sig.parameters && sig.parameters.map(param => ({
        label: param.label,
        documentation: param.documentation != null && typeof param.documentation === 'object' ? param.documentation.value : param.documentation
      }))
    })),
    activeSignature: signatureHelp.activeSignature,
    activeParameter: signatureHelp.activeParameter
  };
}

function watchmanFileChange_lspFileEvent(fileChange, watchmanRoot) {
  return {
    uri: localPath_lspUri(_nuclideUri().default.resolve(watchmanRoot, fileChange.name)),
    type: fileChange.new ? _protocol().FileChangeType.Created : !fileChange.exists ? _protocol().FileChangeType.Deleted : _protocol().FileChangeType.Changed
  };
}