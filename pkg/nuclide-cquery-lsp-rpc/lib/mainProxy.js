"use strict";

module.exports = _client => {
  const remoteModule = {};
  remoteModule.FileNotifier = class {
    constructor() {
      throw Error("constructors are not supported for remote objects");
    }

    onFileEvent(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 62
        },
        name: "FileNotifier"
      }), "onFileEvent", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "event",
        type: {
          kind: "named",
          name: "FileEvent"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    onDirectoriesChanged(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 62
        },
        name: "FileNotifier"
      }), "onDirectoriesChanged", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "openDirectories",
        type: {
          kind: "set",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  remoteModule.CodeAction = class {
    constructor() {
      throw Error("constructors are not supported for remote objects");
    }

    apply() {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "types.js",
          line: 15
        },
        name: "CodeAction"
      }), "apply", "promise", _client.marshalArguments(Array.from(arguments), [])).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    getTitle() {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "types.js",
          line: 15
        },
        name: "CodeAction"
      }), "getTitle", "promise", _client.marshalArguments(Array.from(arguments), [])).then(value => {
        return _client.unmarshal(value, {
          kind: "string"
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  remoteModule.CqueryLanguageService = class {
    constructor() {
      throw Error("constructors are not supported for remote objects");
    }

    restartProcessForFile(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "restartProcessForFile", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "file",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    getDiagnostics(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "getDiagnostics", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "FileDiagnosticMap"
          }
        });
      });
    }

    observeDiagnostics() {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "observeDiagnostics", "observable", _client.marshalArguments(Array.from(arguments), [])).map(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "FileDiagnosticMap"
        });
      }).publish();
    }

    observeStatus(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "observeStatus", "observable", _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }])).map(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "StatusData"
        });
      }).publish();
    }

    clickStatus(arg0, arg1, arg2) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "clickStatus", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "id",
        type: {
          kind: "string"
        }
      }, {
        name: "button",
        type: {
          kind: "string"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    getAutocompleteSuggestions(arg0, arg1, arg2) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "getAutocompleteSuggestions", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          kind: "named",
          name: "atom$Point"
        }
      }, {
        name: "request",
        type: {
          kind: "named",
          name: "AutocompleteRequest"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "AutocompleteResult"
          }
        });
      });
    }

    getDefinition(arg0, arg1) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "getDefinition", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          kind: "named",
          name: "atom$Point"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "DefinitionQueryResult"
          }
        });
      });
    }

    findReferences(arg0, arg1) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "findReferences", "observable", _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          kind: "named",
          name: "atom$Point"
        }
      }])).map(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "FindReferencesReturn"
          }
        });
      }).publish();
    }

    rename(arg0, arg1, arg2) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "rename", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          kind: "named",
          name: "atom$Point"
        }
      }, {
        name: "newName",
        type: {
          kind: "string"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "map",
            keyType: {
              kind: "named",
              name: "NuclideUri"
            },
            valueType: {
              kind: "array",
              type: {
                kind: "named",
                name: "TextEdit"
              }
            }
          }
        });
      });
    }

    getCoverage(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "getCoverage", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "filePath",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "CoverageResult"
          }
        });
      });
    }

    onToggleCoverage(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "onToggleCoverage", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "set",
        type: {
          kind: "boolean"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    getOutline(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "getOutline", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "Outline"
          }
        });
      });
    }

    getCodeActions(arg0, arg1, arg2) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "getCodeActions", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "range",
        type: {
          kind: "named",
          name: "atom$Range"
        }
      }, {
        name: "diagnostics",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "FileDiagnosticMessage"
          }
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "array",
          type: {
            kind: "named",
            name: "CodeAction"
          }
        });
      });
    }

    typeHint(arg0, arg1) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "typeHint", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          kind: "named",
          name: "atom$Point"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "TypeHint"
          }
        });
      });
    }

    signatureHelp(arg0, arg1) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "signatureHelp", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          kind: "named",
          name: "atom$Point"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "SignatureHelp"
          }
        });
      });
    }

    highlight(arg0, arg1) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "highlight", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          kind: "named",
          name: "atom$Point"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "atom$Range"
            }
          }
        });
      });
    }

    formatSource(arg0, arg1, arg2) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "formatSource", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "range",
        type: {
          kind: "named",
          name: "atom$Range"
        }
      }, {
        name: "options",
        type: {
          kind: "named",
          name: "FormatOptions"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "TextEdit"
            }
          }
        });
      });
    }

    formatEntireFile(arg0, arg1, arg2) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "formatEntireFile", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "range",
        type: {
          kind: "named",
          name: "atom$Range"
        }
      }, {
        name: "options",
        type: {
          kind: "named",
          name: "FormatOptions"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "object",
            fields: [{
              name: "newCursor",
              type: {
                kind: "number"
              },
              optional: true
            }, {
              name: "formatted",
              type: {
                kind: "string"
              },
              optional: false
            }]
          }
        });
      });
    }

    formatAtPosition(arg0, arg1, arg2, arg3) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "formatAtPosition", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          kind: "named",
          name: "atom$Point"
        }
      }, {
        name: "triggerCharacter",
        type: {
          kind: "string"
        }
      }, {
        name: "options",
        type: {
          kind: "named",
          name: "FormatOptions"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "TextEdit"
            }
          }
        });
      });
    }

    getAdditionalLogFiles(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "getAdditionalLogFiles", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "deadline",
        type: {
          kind: "named",
          name: "DeadlineRequest"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "array",
          type: {
            kind: "named",
            name: "AdditionalLogFile"
          }
        });
      });
    }

    supportsSymbolSearch(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "supportsSymbolSearch", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "directories",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "boolean"
        });
      });
    }

    symbolSearch(arg0, arg1) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "symbolSearch", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "query",
        type: {
          kind: "string"
        }
      }, {
        name: "directories",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "SymbolResult"
            }
          }
        });
      });
    }

    getProjectRoot(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "getProjectRoot", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "fileUri",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        });
      });
    }

    isFileInProject(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "isFileInProject", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "fileUri",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "boolean"
        });
      });
    }

    getExpandedSelectionRange(arg0, arg1) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "getExpandedSelectionRange", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "currentSelection",
        type: {
          kind: "named",
          name: "atom$Range"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "atom$Range"
          }
        });
      });
    }

    getCollapsedSelectionRange(arg0, arg1, arg2) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "getCollapsedSelectionRange", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "fileVersion",
        type: {
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "currentSelection",
        type: {
          kind: "named",
          name: "atom$Range"
        }
      }, {
        name: "originalCursorPosition",
        type: {
          kind: "named",
          name: "atom$Point"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "atom$Range"
          }
        });
      });
    }

    sendLspRequest(arg0, arg1, arg2) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "sendLspRequest", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "filePath",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "method",
        type: {
          kind: "string"
        }
      }, {
        name: "params",
        type: {
          kind: "mixed"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "mixed"
        });
      });
    }

    sendLspNotification(arg0, arg1, arg2) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "sendLspNotification", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "filePath",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "method",
        type: {
          kind: "string"
        }
      }, {
        name: "params",
        type: {
          kind: "mixed"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    observeLspNotifications(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "main.js",
          line: 57
        },
        name: "CqueryLanguageService"
      }), "observeLspNotifications", "observable", _client.marshalArguments(Array.from(arguments), [{
        name: "notificationMethod",
        type: {
          kind: "string"
        }
      }])).map(value => {
        return _client.unmarshal(value, {
          kind: "mixed"
        });
      }).publish();
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  remoteModule.Progress = class {
    constructor() {
      throw Error("constructors are not supported for remote objects");
    }

    setTitle(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 71
        },
        name: "Progress"
      }), "setTitle", "void", _client.marshalArguments(Array.from(arguments), [{
        name: "title",
        type: {
          kind: "string"
        }
      }]));
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  remoteModule.HostServices = class {
    constructor() {
      throw Error("constructors are not supported for remote objects");
    }

    consoleNotification(arg0, arg1, arg2) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 20
        },
        name: "HostServices"
      }), "consoleNotification", "void", _client.marshalArguments(Array.from(arguments), [{
        name: "source",
        type: {
          kind: "string"
        }
      }, {
        name: "level",
        type: {
          kind: "named",
          name: "ShowNotificationLevel"
        }
      }, {
        name: "text",
        type: {
          kind: "string"
        }
      }]));
    }

    dialogNotification(arg0, arg1) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 20
        },
        name: "HostServices"
      }), "dialogNotification", "observable", _client.marshalArguments(Array.from(arguments), [{
        name: "level",
        type: {
          kind: "named",
          name: "ShowNotificationLevel"
        }
      }, {
        name: "text",
        type: {
          kind: "string"
        }
      }])).map(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      }).publish();
    }

    dialogRequest(arg0, arg1, arg2, arg3) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 20
        },
        name: "HostServices"
      }), "dialogRequest", "observable", _client.marshalArguments(Array.from(arguments), [{
        name: "level",
        type: {
          kind: "named",
          name: "ShowNotificationLevel"
        }
      }, {
        name: "text",
        type: {
          kind: "string"
        }
      }, {
        name: "buttonLabels",
        type: {
          kind: "array",
          type: {
            kind: "string"
          }
        }
      }, {
        name: "closeLabel",
        type: {
          kind: "string"
        }
      }])).map(value => {
        return _client.unmarshal(value, {
          kind: "string"
        });
      }).publish();
    }

    showProgress(arg0, arg1) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 20
        },
        name: "HostServices"
      }), "showProgress", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "title",
        type: {
          kind: "string"
        }
      }, {
        name: "options",
        type: {
          kind: "nullable",
          type: {
            kind: "object",
            fields: [{
              name: "debounce",
              type: {
                kind: "boolean"
              },
              optional: true
            }]
          }
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "Progress"
        });
      });
    }

    showActionRequired(arg0, arg1) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 20
        },
        name: "HostServices"
      }), "showActionRequired", "observable", _client.marshalArguments(Array.from(arguments), [{
        name: "title",
        type: {
          kind: "string"
        }
      }, {
        name: "options",
        type: {
          kind: "nullable",
          type: {
            kind: "object",
            fields: [{
              name: "clickable",
              type: {
                kind: "boolean"
              },
              optional: true
            }]
          }
        }
      }])).map(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      }).publish();
    }

    childRegister(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 20
        },
        name: "HostServices"
      }), "childRegister", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "child",
        type: {
          kind: "named",
          name: "HostServices"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "HostServices"
        });
      });
    }

    applyTextEditsForMultipleFiles(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 20
        },
        name: "HostServices"
      }), "applyTextEditsForMultipleFiles", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "changes",
        type: {
          kind: "map",
          keyType: {
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            kind: "array",
            type: {
              kind: "named",
              name: "TextEdit"
            }
          }
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "boolean"
        });
      });
    }

    dispatchCommand(arg0, arg1) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 20
        },
        name: "HostServices"
      }), "dispatchCommand", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "command",
        type: {
          kind: "string"
        }
      }, {
        name: "params",
        type: {
          kind: "object",
          fields: [{
            name: "args",
            type: {
              kind: "any"
            },
            optional: false
          }, {
            name: "projectRoot",
            type: {
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }]
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "boolean"
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };

  remoteModule.createCqueryService = function (arg0) {
    return _client.callRemoteFunction("CqueryLSPService/createCqueryService", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "params",
      type: {
        kind: "object",
        fields: [{
          name: "fileNotifier",
          type: {
            kind: "named",
            name: "FileNotifier"
          },
          optional: false
        }, {
          name: "host",
          type: {
            kind: "named",
            name: "HostServices"
          },
          optional: false
        }, {
          name: "logCategory",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "logLevel",
          type: {
            kind: "named",
            name: "LogLevel"
          },
          optional: false
        }, {
          name: "enableLibclangLogs",
          type: {
            kind: "boolean"
          },
          optional: false
        }, {
          name: "indexerThreads",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "memoryLimitPercent",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "defaultFlags",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }]
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "named",
          name: "CqueryLanguageService"
        }
      });
    });
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "defs", {
  value: {
    Object: {
      kind: "alias",
      name: "Object",
      location: {
        type: "builtin"
      }
    },
    Date: {
      kind: "alias",
      name: "Date",
      location: {
        type: "builtin"
      }
    },
    RegExp: {
      kind: "alias",
      name: "RegExp",
      location: {
        type: "builtin"
      }
    },
    Buffer: {
      kind: "alias",
      name: "Buffer",
      location: {
        type: "builtin"
      }
    },
    "fs.Stats": {
      kind: "alias",
      name: "fs.Stats",
      location: {
        type: "builtin"
      }
    },
    NuclideUri: {
      kind: "alias",
      name: "NuclideUri",
      location: {
        type: "builtin"
      }
    },
    atom$Point: {
      kind: "alias",
      name: "atom$Point",
      location: {
        type: "builtin"
      }
    },
    atom$Range: {
      kind: "alias",
      name: "atom$Range",
      location: {
        type: "builtin"
      }
    },
    DiagnosticMessageKind: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 66
      },
      name: "DiagnosticMessageKind",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "lint"
        }, {
          kind: "string-literal",
          value: "review"
        }, {
          kind: "string-literal",
          value: "action"
        }]
      }
    },
    DiagnosticMessageType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 67
      },
      name: "DiagnosticMessageType",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "Error"
        }, {
          kind: "string-literal",
          value: "Warning"
        }, {
          kind: "string-literal",
          value: "Info"
        }, {
          kind: "string-literal",
          value: "Hint"
        }]
      }
    },
    DiagnosticTrace: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 69
      },
      name: "DiagnosticTrace",
      definition: {
        kind: "object",
        fields: [{
          name: "type",
          type: {
            kind: "string-literal",
            value: "Trace"
          },
          optional: false
        }, {
          name: "text",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "html",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "filePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: true
        }, {
          name: "range",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: true
        }]
      }
    },
    TextEdit: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "text-edit.js",
        line: 21
      },
      name: "TextEdit",
      definition: {
        kind: "object",
        fields: [{
          name: "oldRange",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          name: "newText",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "oldText",
          type: {
            kind: "string"
          },
          optional: true
        }]
      }
    },
    DiagnosticFix: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 78
      },
      name: "DiagnosticFix",
      definition: {
        kind: "intersection",
        types: [{
          kind: "named",
          name: "TextEdit"
        }, {
          kind: "object",
          fields: [{
            name: "speculative",
            type: {
              kind: "boolean"
            },
            optional: true
          }, {
            name: "title",
            type: {
              kind: "string"
            },
            optional: true
          }]
        }],
        flattened: {
          kind: "object",
          fields: [{
            name: "oldRange",
            type: {
              kind: "named",
              name: "atom$Range"
            },
            optional: false
          }, {
            name: "newText",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "oldText",
            type: {
              kind: "string"
            },
            optional: true
          }, {
            name: "speculative",
            type: {
              kind: "boolean"
            },
            optional: true
          }, {
            name: "title",
            type: {
              kind: "string"
            },
            optional: true
          }]
        }
      }
    },
    FileDiagnosticMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "LanguageService.js",
        line: 100
      },
      name: "FileDiagnosticMessage",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "named",
            name: "DiagnosticMessageKind"
          },
          optional: true
        }, {
          name: "providerName",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "type",
          type: {
            kind: "named",
            name: "DiagnosticMessageType"
          },
          optional: false
        }, {
          name: "filePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "text",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "html",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "range",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: true
        }, {
          name: "trace",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "DiagnosticTrace"
            }
          },
          optional: true
        }, {
          name: "fix",
          type: {
            kind: "named",
            name: "DiagnosticFix"
          },
          optional: true
        }, {
          name: "actions",
          type: {
            kind: "void"
          },
          optional: true
        }, {
          name: "stale",
          type: {
            kind: "boolean"
          },
          optional: true
        }, {
          name: "code",
          type: {
            kind: "number"
          },
          optional: true
        }]
      }
    },
    FileDiagnosticMap: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "LanguageService.js",
        line: 124
      },
      name: "FileDiagnosticMap",
      definition: {
        kind: "map",
        keyType: {
          kind: "named",
          name: "NuclideUri"
        },
        valueType: {
          kind: "array",
          type: {
            kind: "named",
            name: "FileDiagnosticMessage"
          }
        }
      }
    },
    FileOpenEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 14
      },
      name: "FileOpenEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "open"
          },
          optional: false
        }, {
          name: "fileVersion",
          type: {
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          name: "contents",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "languageId",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    FileCloseEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 29
      },
      name: "FileCloseEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "close"
          },
          optional: false
        }, {
          name: "fileVersion",
          type: {
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }]
      }
    },
    FileEditEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 34
      },
      name: "FileEditEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "edit"
          },
          optional: false
        }, {
          name: "fileVersion",
          type: {
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          name: "oldRange",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          name: "newRange",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          name: "oldText",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "newText",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    FileSaveEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 43
      },
      name: "FileSaveEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "save"
          },
          optional: false
        }, {
          name: "fileVersion",
          type: {
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }]
      }
    },
    FileSyncEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 22
      },
      name: "FileSyncEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "sync"
          },
          optional: false
        }, {
          name: "fileVersion",
          type: {
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          name: "contents",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "languageId",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    FileEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 49
      },
      name: "FileEvent",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "open"
            },
            optional: false
          }, {
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }, {
            name: "contents",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "languageId",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "close"
            },
            optional: false
          }, {
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "edit"
            },
            optional: false
          }, {
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }, {
            name: "oldRange",
            type: {
              kind: "named",
              name: "atom$Range"
            },
            optional: false
          }, {
            name: "newRange",
            type: {
              kind: "named",
              name: "atom$Range"
            },
            optional: false
          }, {
            name: "oldText",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "newText",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "save"
            },
            optional: false
          }, {
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "sync"
            },
            optional: false
          }, {
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }, {
            name: "contents",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "languageId",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    FileNotifier: {
      kind: "interface",
      name: "FileNotifier",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 62
      },
      staticMethods: {},
      instanceMethods: {
        onFileEvent: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 63
          },
          kind: "function",
          argumentTypes: [{
            name: "event",
            type: {
              kind: "named",
              name: "FileEvent"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        onDirectoriesChanged: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 64
          },
          kind: "function",
          argumentTypes: [{
            name: "openDirectories",
            type: {
              kind: "set",
              type: {
                kind: "named",
                name: "NuclideUri"
              }
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 65
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
      }
    },
    FileVersion: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 68
      },
      name: "FileVersion",
      definition: {
        kind: "object",
        fields: [{
          name: "notifier",
          type: {
            kind: "named",
            name: "FileNotifier"
          },
          optional: false
        }, {
          name: "filePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "version",
          type: {
            kind: "number"
          },
          optional: false
        }]
      }
    },
    StatusData: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "LanguageService.js",
        line: 136
      },
      name: "StatusData",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "null"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "green"
            },
            optional: false
          }, {
            name: "message",
            type: {
              kind: "string"
            },
            optional: true
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "yellow"
            },
            optional: false
          }, {
            name: "message",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "shortMessage",
            type: {
              kind: "string"
            },
            optional: true
          }, {
            name: "progress",
            type: {
              kind: "object",
              fields: [{
                name: "numerator",
                type: {
                  kind: "number"
                },
                optional: false
              }, {
                name: "denominator",
                type: {
                  kind: "number"
                },
                optional: true
              }]
            },
            optional: true
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "red"
            },
            optional: false
          }, {
            name: "id",
            type: {
              kind: "string"
            },
            optional: true
          }, {
            name: "message",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "buttons",
            type: {
              kind: "array",
              type: {
                kind: "string"
              }
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    Completion: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "LanguageService.js",
        line: 37
      },
      name: "Completion",
      definition: {
        kind: "object",
        fields: [{
          name: "text",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "snippet",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "displayText",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "replacementPrefix",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "type",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "leftLabel",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "leftLabelHTML",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "rightLabel",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "rightLabelHTML",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "className",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "iconHTML",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "description",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "descriptionMarkdown",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "descriptionMoreURL",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "filterText",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "sortText",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "extraData",
          type: {
            kind: "mixed"
          },
          optional: true
        }, {
          name: "textEdits",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "TextEdit"
            }
          },
          optional: true
        }, {
          name: "remoteUri",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: true
        }]
      }
    },
    AutocompleteResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "LanguageService.js",
        line: 73
      },
      name: "AutocompleteResult",
      definition: {
        kind: "object",
        fields: [{
          name: "isIncomplete",
          type: {
            kind: "boolean"
          },
          optional: false
        }, {
          name: "items",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "Completion"
            }
          },
          optional: false
        }]
      }
    },
    AutocompleteRequest: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "LanguageService.js",
        line: 85
      },
      name: "AutocompleteRequest",
      definition: {
        kind: "object",
        fields: [{
          name: "activatedManually",
          type: {
            kind: "boolean"
          },
          optional: false
        }, {
          name: "triggerCharacter",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "prefix",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    Definition: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 15
      },
      name: "Definition",
      definition: {
        kind: "object",
        fields: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "position",
          type: {
            kind: "named",
            name: "atom$Point"
          },
          optional: false
        }, {
          name: "range",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: true
        }, {
          name: "name",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "projectRoot",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: true
        }, {
          name: "language",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    DefinitionQueryResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 37
      },
      name: "DefinitionQueryResult",
      definition: {
        kind: "object",
        fields: [{
          name: "queryRange",
          type: {
            kind: "nullable",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "atom$Range"
              }
            }
          },
          optional: false
        }, {
          name: "definitions",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "Definition"
            }
          },
          optional: false
        }]
      }
    },
    Reference: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 27
      },
      name: "Reference",
      definition: {
        kind: "object",
        fields: [{
          name: "uri",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "name",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "range",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }]
      }
    },
    FindReferencesData: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 33
      },
      name: "FindReferencesData",
      definition: {
        kind: "object",
        fields: [{
          name: "type",
          type: {
            kind: "string-literal",
            value: "data"
          },
          optional: false
        }, {
          name: "baseUri",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "referencedSymbolName",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "references",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "Reference"
            }
          },
          optional: false
        }, {
          name: "title",
          type: {
            kind: "string"
          },
          optional: true
        }]
      }
    },
    FindReferencesError: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 41
      },
      name: "FindReferencesError",
      definition: {
        kind: "object",
        fields: [{
          name: "type",
          type: {
            kind: "string-literal",
            value: "error"
          },
          optional: false
        }, {
          name: "message",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    FindReferencesReturn: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 46
      },
      name: "FindReferencesReturn",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "data"
            },
            optional: false
          }, {
            name: "baseUri",
            type: {
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }, {
            name: "referencedSymbolName",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "references",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "Reference"
              }
            },
            optional: false
          }, {
            name: "title",
            type: {
              kind: "string"
            },
            optional: true
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            name: "message",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }],
        discriminantField: "type"
      }
    },
    UncoveredRegion: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 12
      },
      name: "UncoveredRegion",
      definition: {
        kind: "object",
        fields: [{
          name: "range",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          name: "message",
          type: {
            kind: "string"
          },
          optional: true
        }]
      }
    },
    CoverageResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 17
      },
      name: "CoverageResult",
      definition: {
        kind: "object",
        fields: [{
          name: "percentage",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "uncoveredRegions",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "UncoveredRegion"
            }
          },
          optional: false
        }]
      }
    },
    OutlineTreeKind: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 49
      },
      name: "OutlineTreeKind",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "file"
        }, {
          kind: "string-literal",
          value: "module"
        }, {
          kind: "string-literal",
          value: "namespace"
        }, {
          kind: "string-literal",
          value: "package"
        }, {
          kind: "string-literal",
          value: "class"
        }, {
          kind: "string-literal",
          value: "method"
        }, {
          kind: "string-literal",
          value: "property"
        }, {
          kind: "string-literal",
          value: "field"
        }, {
          kind: "string-literal",
          value: "constructor"
        }, {
          kind: "string-literal",
          value: "enum"
        }, {
          kind: "string-literal",
          value: "interface"
        }, {
          kind: "string-literal",
          value: "function"
        }, {
          kind: "string-literal",
          value: "variable"
        }, {
          kind: "string-literal",
          value: "constant"
        }, {
          kind: "string-literal",
          value: "string"
        }, {
          kind: "string-literal",
          value: "number"
        }, {
          kind: "string-literal",
          value: "boolean"
        }, {
          kind: "string-literal",
          value: "array"
        }]
      }
    },
    TokenKind: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "tokenized-text.js",
        line: 13
      },
      name: "TokenKind",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "keyword"
        }, {
          kind: "string-literal",
          value: "class-name"
        }, {
          kind: "string-literal",
          value: "constructor"
        }, {
          kind: "string-literal",
          value: "method"
        }, {
          kind: "string-literal",
          value: "param"
        }, {
          kind: "string-literal",
          value: "string"
        }, {
          kind: "string-literal",
          value: "whitespace"
        }, {
          kind: "string-literal",
          value: "plain"
        }, {
          kind: "string-literal",
          value: "type"
        }]
      }
    },
    TextToken: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "tokenized-text.js",
        line: 24
      },
      name: "TextToken",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "named",
            name: "TokenKind"
          },
          optional: false
        }, {
          name: "value",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    TokenizedText: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "tokenized-text.js",
        line: 29
      },
      name: "TokenizedText",
      definition: {
        kind: "array",
        type: {
          kind: "named",
          name: "TextToken"
        }
      }
    },
    OutlineTree: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 27
      },
      name: "OutlineTree",
      definition: {
        kind: "object",
        fields: [{
          name: "icon",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "kind",
          type: {
            kind: "named",
            name: "OutlineTreeKind"
          },
          optional: true
        }, {
          name: "plainText",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "tokenizedText",
          type: {
            kind: "named",
            name: "TokenizedText"
          },
          optional: true
        }, {
          name: "representativeName",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "startPosition",
          type: {
            kind: "named",
            name: "atom$Point"
          },
          optional: false
        }, {
          name: "endPosition",
          type: {
            kind: "named",
            name: "atom$Point"
          },
          optional: true
        }, {
          name: "landingPosition",
          type: {
            kind: "named",
            name: "atom$Point"
          },
          optional: true
        }, {
          name: "children",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "OutlineTree"
            }
          },
          optional: false
        }]
      }
    },
    Outline: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 44
      },
      name: "Outline",
      definition: {
        kind: "object",
        fields: [{
          name: "outlineTrees",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "OutlineTree"
            }
          },
          optional: false
        }]
      }
    },
    CodeAction: {
      kind: "interface",
      name: "CodeAction",
      location: {
        type: "source",
        fileName: "types.js",
        line: 15
      },
      staticMethods: {},
      instanceMethods: {
        apply: {
          location: {
            type: "source",
            fileName: "types.js",
            line: 16
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        getTitle: {
          location: {
            type: "source",
            fileName: "types.js",
            line: 17
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "string"
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "types.js",
            line: 18
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
      }
    },
    TypeHint: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 12
      },
      name: "TypeHint",
      definition: {
        kind: "object",
        fields: [{
          name: "hint",
          type: {
            kind: "array",
            type: {
              kind: "object",
              fields: [{
                name: "type",
                type: {
                  kind: "union",
                  types: [{
                    kind: "string-literal",
                    value: "snippet"
                  }, {
                    kind: "string-literal",
                    value: "markdown"
                  }]
                },
                optional: false
              }, {
                name: "value",
                type: {
                  kind: "string"
                },
                optional: false
              }]
            }
          },
          optional: false
        }, {
          name: "range",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }]
      }
    },
    SignatureParameter: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 56
      },
      name: "SignatureParameter",
      definition: {
        kind: "object",
        fields: [{
          name: "label",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "documentation",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }]
      }
    },
    Signature: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 50
      },
      name: "Signature",
      definition: {
        kind: "object",
        fields: [{
          name: "label",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "documentation",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "parameters",
          type: {
            kind: "nullable",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "SignatureParameter"
              }
            }
          },
          optional: true
        }]
      }
    },
    SignatureHelp: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 44
      },
      name: "SignatureHelp",
      definition: {
        kind: "object",
        fields: [{
          name: "signatures",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "Signature"
            }
          },
          optional: false
        }, {
          name: "activeSignature",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          },
          optional: true
        }, {
          name: "activeParameter",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          },
          optional: true
        }]
      }
    },
    FormatOptions: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "LanguageService.js",
        line: 78
      },
      name: "FormatOptions",
      definition: {
        kind: "object",
        fields: [{
          name: "tabSize",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "insertSpaces",
          type: {
            kind: "boolean"
          },
          optional: false
        }]
      }
    },
    AdditionalLogFile: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 31
      },
      name: "AdditionalLogFile",
      definition: {
        kind: "object",
        fields: [{
          name: "title",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "data",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    DeadlineRequest: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "promise.js",
        line: 210
      },
      name: "DeadlineRequest",
      definition: {
        kind: "number"
      }
    },
    SymbolResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 21
      },
      name: "SymbolResult",
      definition: {
        kind: "object",
        fields: [{
          name: "resultType",
          type: {
            kind: "string-literal",
            value: "SYMBOL"
          },
          optional: false
        }, {
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "line",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "column",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "name",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "containerName",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "icon",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "hoverText",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    CqueryLanguageService: {
      kind: "interface",
      name: "CqueryLanguageService",
      location: {
        type: "source",
        fileName: "main.js",
        line: 57
      },
      staticMethods: {},
      instanceMethods: {
        restartProcessForFile: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 58
          },
          kind: "function",
          argumentTypes: [{
            name: "file",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        getDiagnostics: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 61
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "FileDiagnosticMap"
              }
            }
          }
        },
        observeDiagnostics: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 63
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "FileDiagnosticMap"
            }
          }
        },
        observeStatus: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 65
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "StatusData"
            }
          }
        },
        clickStatus: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 67
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "id",
            type: {
              kind: "string"
            }
          }, {
            name: "button",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        getAutocompleteSuggestions: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 73
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              kind: "named",
              name: "atom$Point"
            }
          }, {
            name: "request",
            type: {
              kind: "named",
              name: "AutocompleteRequest"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "AutocompleteResult"
              }
            }
          }
        },
        getDefinition: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 79
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              kind: "named",
              name: "atom$Point"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "DefinitionQueryResult"
              }
            }
          }
        },
        findReferences: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 84
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              kind: "named",
              name: "atom$Point"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "FindReferencesReturn"
              }
            }
          }
        },
        rename: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 89
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              kind: "named",
              name: "atom$Point"
            }
          }, {
            name: "newName",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "map",
                keyType: {
                  kind: "named",
                  name: "NuclideUri"
                },
                valueType: {
                  kind: "array",
                  type: {
                    kind: "named",
                    name: "TextEdit"
                  }
                }
              }
            }
          }
        },
        getCoverage: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 95
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "CoverageResult"
              }
            }
          }
        },
        onToggleCoverage: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 97
          },
          kind: "function",
          argumentTypes: [{
            name: "set",
            type: {
              kind: "boolean"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        getOutline: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 99
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "Outline"
              }
            }
          }
        },
        getCodeActions: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 101
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "range",
            type: {
              kind: "named",
              name: "atom$Range"
            }
          }, {
            name: "diagnostics",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "FileDiagnosticMessage"
              }
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "CodeAction"
              }
            }
          }
        },
        typeHint: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 107
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              kind: "named",
              name: "atom$Point"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "TypeHint"
              }
            }
          }
        },
        signatureHelp: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 109
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              kind: "named",
              name: "atom$Point"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "SignatureHelp"
              }
            }
          }
        },
        highlight: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 114
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              kind: "named",
              name: "atom$Point"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "array",
                type: {
                  kind: "named",
                  name: "atom$Range"
                }
              }
            }
          }
        },
        formatSource: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 119
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "range",
            type: {
              kind: "named",
              name: "atom$Range"
            }
          }, {
            name: "options",
            type: {
              kind: "named",
              name: "FormatOptions"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "array",
                type: {
                  kind: "named",
                  name: "TextEdit"
                }
              }
            }
          }
        },
        formatEntireFile: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 125
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "range",
            type: {
              kind: "named",
              name: "atom$Range"
            }
          }, {
            name: "options",
            type: {
              kind: "named",
              name: "FormatOptions"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "object",
                fields: [{
                  name: "newCursor",
                  type: {
                    kind: "number"
                  },
                  optional: true
                }, {
                  name: "formatted",
                  type: {
                    kind: "string"
                  },
                  optional: false
                }]
              }
            }
          }
        },
        formatAtPosition: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 134
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "position",
            type: {
              kind: "named",
              name: "atom$Point"
            }
          }, {
            name: "triggerCharacter",
            type: {
              kind: "string"
            }
          }, {
            name: "options",
            type: {
              kind: "named",
              name: "FormatOptions"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "array",
                type: {
                  kind: "named",
                  name: "TextEdit"
                }
              }
            }
          }
        },
        getAdditionalLogFiles: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 141
          },
          kind: "function",
          argumentTypes: [{
            name: "deadline",
            type: {
              kind: "named",
              name: "DeadlineRequest"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "AdditionalLogFile"
              }
            }
          }
        },
        supportsSymbolSearch: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 145
          },
          kind: "function",
          argumentTypes: [{
            name: "directories",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "NuclideUri"
              }
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "boolean"
            }
          }
        },
        symbolSearch: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 147
          },
          kind: "function",
          argumentTypes: [{
            name: "query",
            type: {
              kind: "string"
            }
          }, {
            name: "directories",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "NuclideUri"
              }
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "array",
                type: {
                  kind: "named",
                  name: "SymbolResult"
                }
              }
            }
          }
        },
        getProjectRoot: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 152
          },
          kind: "function",
          argumentTypes: [{
            name: "fileUri",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "NuclideUri"
              }
            }
          }
        },
        isFileInProject: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 154
          },
          kind: "function",
          argumentTypes: [{
            name: "fileUri",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "boolean"
            }
          }
        },
        getExpandedSelectionRange: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 156
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "currentSelection",
            type: {
              kind: "named",
              name: "atom$Range"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "atom$Range"
              }
            }
          }
        },
        getCollapsedSelectionRange: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 161
          },
          kind: "function",
          argumentTypes: [{
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            }
          }, {
            name: "currentSelection",
            type: {
              kind: "named",
              name: "atom$Range"
            }
          }, {
            name: "originalCursorPosition",
            type: {
              kind: "named",
              name: "atom$Point"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "atom$Range"
              }
            }
          }
        },
        sendLspRequest: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 167
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }, {
            name: "method",
            type: {
              kind: "string"
            }
          }, {
            name: "params",
            type: {
              kind: "mixed"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "mixed"
            }
          }
        },
        sendLspNotification: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 173
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }, {
            name: "method",
            type: {
              kind: "string"
            }
          }, {
            name: "params",
            type: {
              kind: "mixed"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        observeLspNotifications: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 179
          },
          kind: "function",
          argumentTypes: [{
            name: "notificationMethod",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "mixed"
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "main.js",
            line: 183
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
      }
    },
    ShowNotificationLevel: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 17
      },
      name: "ShowNotificationLevel",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "info"
        }, {
          kind: "string-literal",
          value: "log"
        }, {
          kind: "string-literal",
          value: "warning"
        }, {
          kind: "string-literal",
          value: "error"
        }]
      }
    },
    Progress: {
      kind: "interface",
      name: "Progress",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 71
      },
      staticMethods: {},
      instanceMethods: {
        setTitle: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 72
          },
          kind: "function",
          argumentTypes: [{
            name: "title",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "void"
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 73
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
      }
    },
    HostServices: {
      kind: "interface",
      name: "HostServices",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 20
      },
      staticMethods: {},
      instanceMethods: {
        consoleNotification: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 21
          },
          kind: "function",
          argumentTypes: [{
            name: "source",
            type: {
              kind: "string"
            }
          }, {
            name: "level",
            type: {
              kind: "named",
              name: "ShowNotificationLevel"
            }
          }, {
            name: "text",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "void"
          }
        },
        dialogNotification: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 27
          },
          kind: "function",
          argumentTypes: [{
            name: "level",
            type: {
              kind: "named",
              name: "ShowNotificationLevel"
            }
          }, {
            name: "text",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "void"
            }
          }
        },
        dialogRequest: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 32
          },
          kind: "function",
          argumentTypes: [{
            name: "level",
            type: {
              kind: "named",
              name: "ShowNotificationLevel"
            }
          }, {
            name: "text",
            type: {
              kind: "string"
            }
          }, {
            name: "buttonLabels",
            type: {
              kind: "array",
              type: {
                kind: "string"
              }
            }
          }, {
            name: "closeLabel",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "string"
            }
          }
        },
        showProgress: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 42
          },
          kind: "function",
          argumentTypes: [{
            name: "title",
            type: {
              kind: "string"
            }
          }, {
            name: "options",
            type: {
              kind: "nullable",
              type: {
                kind: "object",
                fields: [{
                  name: "debounce",
                  type: {
                    kind: "boolean"
                  },
                  optional: true
                }]
              }
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "named",
              name: "Progress"
            }
          }
        },
        showActionRequired: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 50
          },
          kind: "function",
          argumentTypes: [{
            name: "title",
            type: {
              kind: "string"
            }
          }, {
            name: "options",
            type: {
              kind: "nullable",
              type: {
                kind: "object",
                fields: [{
                  name: "clickable",
                  type: {
                    kind: "boolean"
                  },
                  optional: true
                }]
              }
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "void"
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 55
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        },
        childRegister: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 59
          },
          kind: "function",
          argumentTypes: [{
            name: "child",
            type: {
              kind: "named",
              name: "HostServices"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "named",
              name: "HostServices"
            }
          }
        },
        applyTextEditsForMultipleFiles: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 61
          },
          kind: "function",
          argumentTypes: [{
            name: "changes",
            type: {
              kind: "map",
              keyType: {
                kind: "named",
                name: "NuclideUri"
              },
              valueType: {
                kind: "array",
                type: {
                  kind: "named",
                  name: "TextEdit"
                }
              }
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "boolean"
            }
          }
        },
        dispatchCommand: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 65
          },
          kind: "function",
          argumentTypes: [{
            name: "command",
            type: {
              kind: "string"
            }
          }, {
            name: "params",
            type: {
              kind: "object",
              fields: [{
                name: "args",
                type: {
                  kind: "any"
                },
                optional: false
              }, {
                name: "projectRoot",
                type: {
                  kind: "named",
                  name: "NuclideUri"
                },
                optional: false
              }]
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "boolean"
            }
          }
        }
      }
    },
    LogLevel: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 14
      },
      name: "LogLevel",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "ALL"
        }, {
          kind: "string-literal",
          value: "TRACE"
        }, {
          kind: "string-literal",
          value: "DEBUG"
        }, {
          kind: "string-literal",
          value: "INFO"
        }, {
          kind: "string-literal",
          value: "WARN"
        }, {
          kind: "string-literal",
          value: "ERROR"
        }, {
          kind: "string-literal",
          value: "FATAL"
        }, {
          kind: "string-literal",
          value: "OFF"
        }]
      }
    },
    createCqueryService: {
      kind: "function",
      name: "createCqueryService",
      location: {
        type: "source",
        fileName: "main.js",
        line: 211
      },
      type: {
        location: {
          type: "source",
          fileName: "main.js",
          line: 211
        },
        kind: "function",
        argumentTypes: [{
          name: "params",
          type: {
            kind: "object",
            fields: [{
              name: "fileNotifier",
              type: {
                kind: "named",
                name: "FileNotifier"
              },
              optional: false
            }, {
              name: "host",
              type: {
                kind: "named",
                name: "HostServices"
              },
              optional: false
            }, {
              name: "logCategory",
              type: {
                kind: "string"
              },
              optional: false
            }, {
              name: "logLevel",
              type: {
                kind: "named",
                name: "LogLevel"
              },
              optional: false
            }, {
              name: "enableLibclangLogs",
              type: {
                kind: "boolean"
              },
              optional: false
            }, {
              name: "indexerThreads",
              type: {
                kind: "number"
              },
              optional: false
            }, {
              name: "memoryLimitPercent",
              type: {
                kind: "number"
              },
              optional: false
            }, {
              name: "defaultFlags",
              type: {
                kind: "array",
                type: {
                  kind: "string"
                }
              },
              optional: false
            }]
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "CqueryLanguageService"
            }
          }
        }
      }
    }
  }
});