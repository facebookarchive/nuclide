"use strict";

let Observable, trackOperationTiming;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getDiagnostics = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "file",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 165
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "currentContents",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 166
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 166
          },
          kind: "string"
        }
      }
    }]).then(args => _client.callRemoteFunction("HackService/getDiagnostics", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 167
      },
      kind: "nullable",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 167
        },
        kind: "named",
        name: "HackDiagnosticsResult"
      }
    }));
  }

  remoteModule.getCompletions = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "file",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 202
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "markedContents",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 203
        },
        kind: "string"
      }
    }]).then(args => _client.callRemoteFunction("HackService/getCompletions", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 204
      },
      kind: "nullable",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 204
        },
        kind: "named",
        name: "HackCompletionsResult"
      }
    }));
  }

  remoteModule.getIdentifierDefinition = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "file",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 224
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 225
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 226
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 227
        },
        kind: "number"
      }
    }]).then(args => _client.callRemoteFunction("HackService/getIdentifierDefinition", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 228
      },
      kind: "nullable",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 228
        },
        kind: "named",
        name: "HackDefinitionResult"
      }
    }));
  }

  remoteModule.getDefinition = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "file",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 250
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 251
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 252
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 253
        },
        kind: "number"
      }
    }]).then(args => _client.callRemoteFunction("HackService/getDefinition", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 254
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 254
        },
        kind: "named",
        name: "HackDefinition"
      }
    }));
  }

  remoteModule.getReferences = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 290
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "symbolName",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 291
        },
        kind: "string"
      }
    }, {
      name: "symbolType",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 292
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 292
          },
          kind: "named",
          name: "SymbolTypeValue"
        }
      }
    }]).then(args => _client.callRemoteFunction("HackService/getReferences", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 293
      },
      kind: "nullable",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 293
        },
        kind: "named",
        name: "HackReferencesResult"
      }
    }));
  }

  remoteModule.getHackEnvironmentDetails = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "localFile",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 317
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "hackCommand",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 318
        },
        kind: "string"
      }
    }, {
      name: "useIdeConnection",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 319
        },
        kind: "boolean"
      }
    }, {
      name: "logLevel",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 320
        },
        kind: "named",
        name: "LogLevel"
      }
    }]).then(args => _client.callRemoteFunction("HackService/getHackEnvironmentDetails", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 321
      },
      kind: "nullable",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 321
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 321
          },
          name: "hackRoot",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 321
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 321
          },
          name: "hackCommand",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 321
            },
            kind: "string"
          },
          optional: false
        }]
      }
    }));
  }

  remoteModule.queryHack = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootDirectory",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 355
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "queryString",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 356
        },
        kind: "string"
      }
    }]).then(args => _client.callRemoteFunction("HackService/queryHack", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 357
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 357
        },
        kind: "named",
        name: "HackSearchPosition"
      }
    }));
  }

  remoteModule.getTypedRegions = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 385
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => _client.callRemoteFunction("HackService/getTypedRegions", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 386
      },
      kind: "nullable",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 386
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 386
          },
          kind: "named",
          name: "HackTypedRegion"
        }
      }
    }));
  }

  remoteModule.getIdeOutline = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 402
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 403
        },
        kind: "string"
      }
    }]).then(args => _client.callRemoteFunction("HackService/getIdeOutline", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 404
      },
      kind: "nullable",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 404
        },
        kind: "named",
        name: "HackIdeOutline"
      }
    }));
  }

  remoteModule.getTypeAtPos = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 419
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 420
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 421
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 422
        },
        kind: "number"
      }
    }]).then(args => _client.callRemoteFunction("HackService/getTypeAtPos", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 423
      },
      kind: "nullable",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 423
        },
        kind: "named",
        name: "HackTypeAtPosResult"
      }
    }));
  }

  remoteModule.getSourceHighlights = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 439
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 440
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 441
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 442
        },
        kind: "number"
      }
    }]).then(args => _client.callRemoteFunction("HackService/getSourceHighlights", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 443
      },
      kind: "nullable",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 443
        },
        kind: "named",
        name: "HackFindLvarRefsResult"
      }
    }));
  }

  remoteModule.formatSource = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 459
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 460
        },
        kind: "string"
      }
    }, {
      name: "startOffset",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 461
        },
        kind: "number"
      }
    }, {
      name: "endOffset",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 462
        },
        kind: "number"
      }
    }]).then(args => _client.callRemoteFunction("HackService/formatSource", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 463
      },
      kind: "nullable",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 463
        },
        kind: "named",
        name: "HackFormatSourceResult"
      }
    }));
  }

  remoteModule.getMethodName = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 480
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 481
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 482
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 483
        },
        kind: "number"
      }
    }]).then(args => _client.callRemoteFunction("HackService/getMethodName", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 484
      },
      kind: "nullable",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 484
        },
        kind: "named",
        name: "HackGetMethodNameResult"
      }
    }));
  }

  remoteModule.isAvailableForDirectoryHack = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootDirectory",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 508
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => _client.callRemoteFunction("HackService/isAvailableForDirectoryHack", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 508
      },
      kind: "boolean"
    }));
  }

  remoteModule.isFileInHackProject = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileUri",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 517
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => _client.callRemoteFunction("HackService/isFileInHackProject", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 517
      },
      kind: "boolean"
    }));
  }

  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
    trackOperationTiming = arguments[1];
  }
});
Object.defineProperty(module.exports, "defs", {
  value: new Map([["Object", {
    kind: "alias",
    name: "Object",
    location: {
      type: "builtin"
    }
  }], ["Date", {
    kind: "alias",
    name: "Date",
    location: {
      type: "builtin"
    }
  }], ["RegExp", {
    kind: "alias",
    name: "RegExp",
    location: {
      type: "builtin"
    }
  }], ["Buffer", {
    kind: "alias",
    name: "Buffer",
    location: {
      type: "builtin"
    }
  }], ["fs.Stats", {
    kind: "alias",
    name: "fs.Stats",
    location: {
      type: "builtin"
    }
  }], ["NuclideUri", {
    kind: "alias",
    name: "NuclideUri",
    location: {
      type: "builtin"
    }
  }], ["SymbolTypeValue", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 27
    },
    name: "SymbolTypeValue",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 27
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 27
        },
        kind: "number-literal",
        value: 0
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 27
        },
        kind: "number-literal",
        value: 1
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 27
        },
        kind: "number-literal",
        value: 2
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 27
        },
        kind: "number-literal",
        value: 3
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 27
        },
        kind: "number-literal",
        value: 4
      }]
    }
  }], ["HackDiagnosticsResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 29
    },
    name: "HackDiagnosticsResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 29
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 31
        },
        name: "hackRoot",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 31
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 32
        },
        name: "messages",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 32
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 32
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 33
              },
              name: "message",
              type: {
                location: {
                  type: "source",
                  fileName: "HackService.js",
                  line: 33
                },
                kind: "named",
                name: "HackDiagnostic"
              },
              optional: false
            }]
          }
        },
        optional: false
      }]
    }
  }], ["HackDiagnostic", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 42
    },
    name: "HackDiagnostic",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 42
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 42
        },
        kind: "named",
        name: "SingleHackMessage"
      }
    }
  }], ["SingleHackMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 44
    },
    name: "SingleHackMessage",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 44
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 45
        },
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 45
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 45
            },
            kind: "named",
            name: "NuclideUri"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 46
        },
        name: "descr",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 46
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 47
        },
        name: "code",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 47
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 48
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 48
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 49
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 49
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 50
        },
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 50
          },
          kind: "number"
        },
        optional: false
      }]
    }
  }], ["HackFunctionDetails", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 53
    },
    name: "HackFunctionDetails",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 53
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 54
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 54
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 54
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 54
              },
              name: "name",
              type: {
                location: {
                  type: "source",
                  fileName: "HackService.js",
                  line: 54
                },
                kind: "string"
              },
              optional: false
            }]
          }
        },
        optional: false
      }]
    }
  }], ["HackRange", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 58
    },
    name: "HackRange",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 58
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 59
        },
        name: "filename",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 59
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 60
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 60
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 61
        },
        name: "char_start",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 61
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 62
        },
        name: "char_end",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 62
          },
          kind: "number"
        },
        optional: false
      }]
    }
  }], ["HackSpan", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 66
    },
    name: "HackSpan",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 66
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 67
        },
        name: "filename",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 67
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 68
        },
        name: "line_start",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 68
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 69
        },
        name: "char_start",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 69
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 70
        },
        name: "line_end",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 70
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 71
        },
        name: "char_end",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 71
          },
          kind: "number"
        },
        optional: false
      }]
    }
  }], ["HackCompletion", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 74
    },
    name: "HackCompletion",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 74
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 75
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 75
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 76
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 76
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 77
        },
        name: "pos",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 77
          },
          kind: "named",
          name: "HackRange"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 78
        },
        name: "func_details",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 78
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 78
            },
            kind: "named",
            name: "HackFunctionDetails"
          }
        },
        optional: false
      }]
    }
  }], ["HackCompletionsResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 81
    },
    name: "HackCompletionsResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 81
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 82
        },
        name: "hackRoot",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 82
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 83
        },
        name: "completions",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 83
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 83
            },
            kind: "named",
            name: "HackCompletion"
          }
        },
        optional: false
      }]
    }
  }], ["HackDefinitionResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 86
    },
    name: "HackDefinitionResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 86
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 87
        },
        name: "hackRoot",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 87
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 88
        },
        name: "definitions",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 88
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 88
            },
            kind: "named",
            name: "HackSearchPosition"
          }
        },
        optional: false
      }]
    }
  }], ["HackReferencesResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 91
    },
    name: "HackReferencesResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 91
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 92
        },
        name: "hackRoot",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 92
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 93
        },
        name: "references",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 93
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 93
            },
            kind: "named",
            name: "HackReference"
          }
        },
        optional: false
      }]
    }
  }], ["HackSearchPosition", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 96
    },
    name: "HackSearchPosition",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 96
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 97
        },
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 97
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 98
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 98
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 99
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 99
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 100
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 100
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 101
        },
        name: "length",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 101
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 102
        },
        name: "scope",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 102
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 103
        },
        name: "additionalInfo",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 103
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["HackReference", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 106
    },
    name: "HackReference",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 106
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 107
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 107
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 108
        },
        name: "filename",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 108
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 109
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 109
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 110
        },
        name: "char_start",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 110
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 111
        },
        name: "char_end",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 111
          },
          kind: "number"
        },
        optional: false
      }]
    }
  }], ["HackTypedRegion", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 114
    },
    name: "HackTypedRegion",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 114
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 115
        },
        name: "color",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 115
          },
          kind: "union",
          types: [{
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 115
            },
            kind: "string-literal",
            value: "default"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 115
            },
            kind: "string-literal",
            value: "checked"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 115
            },
            kind: "string-literal",
            value: "partial"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 115
            },
            kind: "string-literal",
            value: "unchecked"
          }]
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 116
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 116
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["HackIdeOutlineItem", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 119
    },
    name: "HackIdeOutlineItem",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 119
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 120
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 120
          },
          kind: "union",
          types: [{
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 120
            },
            kind: "string-literal",
            value: "function"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 120
            },
            kind: "string-literal",
            value: "class"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 120
            },
            kind: "string-literal",
            value: "property"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 120
            },
            kind: "string-literal",
            value: "method"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 120
            },
            kind: "string-literal",
            value: "const"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 121
            },
            kind: "string-literal",
            value: "enum"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 121
            },
            kind: "string-literal",
            value: "typeconst"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 121
            },
            kind: "string-literal",
            value: "param"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 121
            },
            kind: "string-literal",
            value: "trait"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 121
            },
            kind: "string-literal",
            value: "interface"
          }]
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 122
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 122
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 123
        },
        name: "position",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 123
          },
          kind: "named",
          name: "HackRange"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 124
        },
        name: "span",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 124
          },
          kind: "named",
          name: "HackSpan"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 125
        },
        name: "modifiers",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 125
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 125
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 125
              },
              kind: "string"
            }
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 126
        },
        name: "children",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 126
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 126
            },
            kind: "named",
            name: "HackIdeOutlineItem"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 127
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 127
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 127
            },
            kind: "named",
            name: "HackIdeOutlineItem"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 128
        },
        name: "docblock",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 128
          },
          kind: "string"
        },
        optional: true
      }]
    }
  }], ["HackIdeOutline", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 131
    },
    name: "HackIdeOutline",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 131
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 131
        },
        kind: "named",
        name: "HackIdeOutlineItem"
      }
    }
  }], ["HackTypeAtPosResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 133
    },
    name: "HackTypeAtPosResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 133
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 134
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 134
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 134
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 135
        },
        name: "pos",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 135
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 135
            },
            kind: "named",
            name: "HackRange"
          }
        },
        optional: false
      }]
    }
  }], ["HackFindLvarRefsResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 138
    },
    name: "HackFindLvarRefsResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 138
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 139
        },
        name: "positions",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 139
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 139
            },
            kind: "named",
            name: "HackRange"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 140
        },
        name: "internal_error",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 140
          },
          kind: "boolean"
        },
        optional: false
      }]
    }
  }], ["HackFormatSourceResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 143
    },
    name: "HackFormatSourceResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 143
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 144
        },
        name: "error_message",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 144
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 145
        },
        name: "result",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 145
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 146
        },
        name: "internal_error",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 146
          },
          kind: "boolean"
        },
        optional: false
      }]
    }
  }], ["HackGetMethodNameResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 149
    },
    name: "HackGetMethodNameResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 149
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 150
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 150
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 151
        },
        name: "result_type",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 151
          },
          kind: "union",
          types: [{
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 151
            },
            kind: "string-literal",
            value: "class"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 151
            },
            kind: "string-literal",
            value: "method"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 151
            },
            kind: "string-literal",
            value: "function"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 151
            },
            kind: "string-literal",
            value: "local"
          }]
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 152
        },
        name: "pos",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 152
          },
          kind: "named",
          name: "HackRange"
        },
        optional: false
      }]
    }
  }], ["HackDefinition", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 155
    },
    name: "HackDefinition",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 155
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 156
        },
        name: "definition_pos",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 156
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 156
            },
            kind: "named",
            name: "HackRange"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 157
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 157
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 158
        },
        name: "pos",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 158
          },
          kind: "named",
          name: "HackRange"
        },
        optional: false
      }]
    }
  }], ["getDiagnostics", {
    kind: "function",
    name: "getDiagnostics",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 164
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 164
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 165
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "currentContents",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 166
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 166
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 167
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 167
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 167
            },
            kind: "named",
            name: "HackDiagnosticsResult"
          }
        }
      }
    }
  }], ["getCompletions", {
    kind: "function",
    name: "getCompletions",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 201
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 201
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 202
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "markedContents",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 203
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 204
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 204
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 204
            },
            kind: "named",
            name: "HackCompletionsResult"
          }
        }
      }
    }
  }], ["getIdentifierDefinition", {
    kind: "function",
    name: "getIdentifierDefinition",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 223
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 223
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 224
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 225
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 226
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 227
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 228
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 228
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 228
            },
            kind: "named",
            name: "HackDefinitionResult"
          }
        }
      }
    }
  }], ["getDefinition", {
    kind: "function",
    name: "getDefinition",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 249
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 249
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 250
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 251
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 252
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 253
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 254
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 254
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 254
            },
            kind: "named",
            name: "HackDefinition"
          }
        }
      }
    }
  }], ["getReferences", {
    kind: "function",
    name: "getReferences",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 289
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 289
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 290
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "symbolName",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 291
          },
          kind: "string"
        }
      }, {
        name: "symbolType",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 292
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 292
            },
            kind: "named",
            name: "SymbolTypeValue"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 293
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 293
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 293
            },
            kind: "named",
            name: "HackReferencesResult"
          }
        }
      }
    }
  }], ["getHackEnvironmentDetails", {
    kind: "function",
    name: "getHackEnvironmentDetails",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 316
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 316
      },
      kind: "function",
      argumentTypes: [{
        name: "localFile",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 317
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "hackCommand",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 318
          },
          kind: "string"
        }
      }, {
        name: "useIdeConnection",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 319
          },
          kind: "boolean"
        }
      }, {
        name: "logLevel",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 320
          },
          kind: "named",
          name: "LogLevel"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 321
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 321
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 321
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 321
              },
              name: "hackRoot",
              type: {
                location: {
                  type: "source",
                  fileName: "HackService.js",
                  line: 321
                },
                kind: "named",
                name: "NuclideUri"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 321
              },
              name: "hackCommand",
              type: {
                location: {
                  type: "source",
                  fileName: "HackService.js",
                  line: 321
                },
                kind: "string"
              },
              optional: false
            }]
          }
        }
      }
    }
  }], ["queryHack", {
    kind: "function",
    name: "queryHack",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 354
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 354
      },
      kind: "function",
      argumentTypes: [{
        name: "rootDirectory",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 355
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "queryString",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 356
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 357
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 357
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 357
            },
            kind: "named",
            name: "HackSearchPosition"
          }
        }
      }
    }
  }], ["getTypedRegions", {
    kind: "function",
    name: "getTypedRegions",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 385
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 385
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 385
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 386
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 386
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 386
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 386
              },
              kind: "named",
              name: "HackTypedRegion"
            }
          }
        }
      }
    }
  }], ["getIdeOutline", {
    kind: "function",
    name: "getIdeOutline",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 401
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 401
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 402
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 403
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 404
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 404
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 404
            },
            kind: "named",
            name: "HackIdeOutline"
          }
        }
      }
    }
  }], ["getTypeAtPos", {
    kind: "function",
    name: "getTypeAtPos",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 418
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 418
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 419
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 420
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 421
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 422
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 423
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 423
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 423
            },
            kind: "named",
            name: "HackTypeAtPosResult"
          }
        }
      }
    }
  }], ["getSourceHighlights", {
    kind: "function",
    name: "getSourceHighlights",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 438
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 438
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 439
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 440
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 441
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 442
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 443
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 443
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 443
            },
            kind: "named",
            name: "HackFindLvarRefsResult"
          }
        }
      }
    }
  }], ["formatSource", {
    kind: "function",
    name: "formatSource",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 458
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 458
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 459
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 460
          },
          kind: "string"
        }
      }, {
        name: "startOffset",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 461
          },
          kind: "number"
        }
      }, {
        name: "endOffset",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 462
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 463
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 463
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 463
            },
            kind: "named",
            name: "HackFormatSourceResult"
          }
        }
      }
    }
  }], ["getMethodName", {
    kind: "function",
    name: "getMethodName",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 479
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 479
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 480
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 481
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 482
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 483
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 484
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 484
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 484
            },
            kind: "named",
            name: "HackGetMethodNameResult"
          }
        }
      }
    }
  }], ["isAvailableForDirectoryHack", {
    kind: "function",
    name: "isAvailableForDirectoryHack",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 508
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 508
      },
      kind: "function",
      argumentTypes: [{
        name: "rootDirectory",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 508
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 508
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 508
          },
          kind: "boolean"
        }
      }
    }
  }], ["isFileInHackProject", {
    kind: "function",
    name: "isFileInHackProject",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 517
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 517
      },
      kind: "function",
      argumentTypes: [{
        name: "fileUri",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 517
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 517
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 517
          },
          kind: "boolean"
        }
      }
    }
  }], ["LogLevel", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 11
    },
    name: "LogLevel",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 12
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 12
        },
        kind: "string-literal",
        value: "ALL"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 13
        },
        kind: "string-literal",
        value: "TRACE"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 14
        },
        kind: "string-literal",
        value: "DEBUG"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 15
        },
        kind: "string-literal",
        value: "INFO"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 16
        },
        kind: "string-literal",
        value: "WARN"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 17
        },
        kind: "string-literal",
        value: "ERROR"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 18
        },
        kind: "string-literal",
        value: "FATAL"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 19
        },
        kind: "string-literal",
        value: "OFF"
      }]
    }
  }]])
});