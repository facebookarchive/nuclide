"use strict";

let Observable, trackOperationTiming;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.initialize = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "hackCommand",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 97
        },
        kind: "string"
      }
    }, {
      name: "useIdeConnection",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 98
        },
        kind: "boolean"
      }
    }, {
      name: "logLevel",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 99
        },
        kind: "named",
        name: "LogLevel"
      }
    }, {
      name: "fileNotifier",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 100
        },
        kind: "named",
        name: "FileNotifier"
      }
    }]).then(args => {
      return _client.callRemoteFunction("HackService/initialize", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 101
        },
        kind: "named",
        name: "HackLanguageService"
      });
    });
  };

  remoteModule.HackLanguageService = class {
    constructor(arg0) {
      _client.createRemoteObject("HackLanguageService", this, [arg0], [{
        name: "fileNotifier",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 112
          },
          kind: "named",
          name: "FileNotifier"
        }
      }])
    }
    getDiagnostics(arg0) {
      return trackOperationTiming("HackLanguageService.getDiagnostics", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 117
            },
            kind: "named",
            name: "FileVersion"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 109
            },
            name: "HackLanguageService"
          }).then(id => {
            return _client.callRemoteMethod(id, "getDiagnostics", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 118
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 118
              },
              kind: "named",
              name: "DiagnosticProviderUpdate"
            }
          });
        });
      });
    }
    getAutocompleteSuggestions(arg0, arg1, arg2) {
      return trackOperationTiming("HackLanguageService.getAutocompleteSuggestions", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 140
            },
            kind: "named",
            name: "FileVersion"
          }
        }, {
          name: "position",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 141
            },
            kind: "named",
            name: "atom$Point"
          }
        }, {
          name: "activatedManually",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 142
            },
            kind: "boolean"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 109
            },
            name: "HackLanguageService"
          }).then(id => {
            return _client.callRemoteMethod(id, "getAutocompleteSuggestions", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 143
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 143
              },
              kind: "named",
              name: "Completion"
            }
          });
        });
      });
    }
    getDefinition(arg0, arg1) {
      return trackOperationTiming("HackLanguageService.getDefinition", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 192
            },
            kind: "named",
            name: "FileVersion"
          }
        }, {
          name: "position",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 193
            },
            kind: "named",
            name: "atom$Point"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 109
            },
            name: "HackLanguageService"
          }).then(id => {
            return _client.callRemoteMethod(id, "getDefinition", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 194
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 194
              },
              kind: "named",
              name: "DefinitionQueryResult"
            }
          });
        });
      });
    }
    getDefinitionById(arg0, arg1) {
      return trackOperationTiming("HackLanguageService.getDefinitionById", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 216
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "id",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 217
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 109
            },
            name: "HackLanguageService"
          }).then(id => {
            return _client.callRemoteMethod(id, "getDefinitionById", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 218
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 218
              },
              kind: "named",
              name: "Definition"
            }
          });
        });
      });
    }
    findReferences(arg0, arg1) {
      return trackOperationTiming("HackLanguageService.findReferences", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 248
            },
            kind: "named",
            name: "FileVersion"
          }
        }, {
          name: "position",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 249
            },
            kind: "named",
            name: "atom$Point"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 109
            },
            name: "HackLanguageService"
          }).then(id => {
            return _client.callRemoteMethod(id, "findReferences", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 250
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 250
              },
              kind: "named",
              name: "FindReferencesReturn"
            }
          });
        });
      });
    }
    executeQuery(arg0, arg1) {
      return trackOperationTiming("HackLanguageService.executeQuery", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "rootDirectory",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 274
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
              line: 275
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 109
            },
            name: "HackLanguageService"
          }).then(id => {
            return _client.callRemoteMethod(id, "executeQuery", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 276
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 276
              },
              kind: "named",
              name: "HackSearchPosition"
            }
          });
        });
      });
    }
    getCoverage(arg0) {
      return trackOperationTiming("HackLanguageService.getCoverage", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 281
            },
            kind: "named",
            name: "NuclideUri"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 109
            },
            name: "HackLanguageService"
          }).then(id => {
            return _client.callRemoteMethod(id, "getCoverage", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 282
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 282
              },
              kind: "named",
              name: "CoverageResult"
            }
          });
        });
      });
    }
    getOutline(arg0) {
      return trackOperationTiming("HackLanguageService.getOutline", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 294
            },
            kind: "named",
            name: "FileVersion"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 109
            },
            name: "HackLanguageService"
          }).then(id => {
            return _client.callRemoteMethod(id, "getOutline", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 295
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 295
              },
              kind: "named",
              name: "Outline"
            }
          });
        });
      });
    }
    typeHint(arg0, arg1) {
      return trackOperationTiming("HackLanguageService.typeHint", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 313
            },
            kind: "named",
            name: "FileVersion"
          }
        }, {
          name: "position",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 313
            },
            kind: "named",
            name: "atom$Point"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 109
            },
            name: "HackLanguageService"
          }).then(id => {
            return _client.callRemoteMethod(id, "typeHint", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 313
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 313
              },
              kind: "named",
              name: "TypeHint"
            }
          });
        });
      });
    }
    highlight(arg0, arg1) {
      return trackOperationTiming("HackLanguageService.highlight", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 342
            },
            kind: "named",
            name: "FileVersion"
          }
        }, {
          name: "position",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 343
            },
            kind: "named",
            name: "atom$Point"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 109
            },
            name: "HackLanguageService"
          }).then(id => {
            return _client.callRemoteMethod(id, "highlight", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 344
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 344
              },
              kind: "named",
              name: "atom$Range"
            }
          });
        });
      });
    }
    formatSource(arg0, arg1) {
      return trackOperationTiming("HackLanguageService.formatSource", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 366
            },
            kind: "named",
            name: "FileVersion"
          }
        }, {
          name: "range",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 367
            },
            kind: "named",
            name: "atom$Range"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 109
            },
            name: "HackLanguageService"
          }).then(id => {
            return _client.callRemoteMethod(id, "formatSource", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 368
            },
            kind: "string"
          });
        });
      });
    }
    getProjectRoot(arg0) {
      return trackOperationTiming("HackLanguageService.getProjectRoot", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "fileUri",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 390
            },
            kind: "named",
            name: "NuclideUri"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 109
            },
            name: "HackLanguageService"
          }).then(id => {
            return _client.callRemoteMethod(id, "getProjectRoot", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 390
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 390
              },
              kind: "named",
              name: "NuclideUri"
            }
          });
        });
      });
    }
    isFileInHackProject(arg0) {
      return trackOperationTiming("HackLanguageService.isFileInHackProject", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "fileUri",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 398
            },
            kind: "named",
            name: "NuclideUri"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 109
            },
            name: "HackLanguageService"
          }).then(id => {
            return _client.callRemoteMethod(id, "isFileInHackProject", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 398
            },
            kind: "boolean"
          });
        });
      });
    }
    dispose() {
      return _client.disposeRemoteObject(this);
    }
  };
  remoteModule.FileNotifier = class {
    onEvent(arg0) {
      return trackOperationTiming("FileNotifier.onEvent", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "event",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 44
            },
            kind: "named",
            name: "FileEvent"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 43
            },
            name: "FileNotifier"
          }).then(id => {
            return _client.callRemoteMethod(id, "onEvent", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 44
            },
            kind: "void"
          });
        });
      });
    }
    dispose() {
      return _client.disposeRemoteObject(this);
    }
  };
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
  }], ["atom$Point", {
    kind: "alias",
    name: "atom$Point",
    location: {
      type: "builtin"
    }
  }], ["atom$Range", {
    kind: "alias",
    name: "atom$Range",
    location: {
      type: "builtin"
    }
  }], ["SymbolTypeValue", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 66
    },
    name: "SymbolTypeValue",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 66
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 66
        },
        kind: "number-literal",
        value: 0
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 66
        },
        kind: "number-literal",
        value: 1
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 66
        },
        kind: "number-literal",
        value: 2
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 66
        },
        kind: "number-literal",
        value: 3
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 66
        },
        kind: "number-literal",
        value: 4
      }]
    }
  }], ["HackCompletionsResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 68
    },
    name: "HackCompletionsResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 68
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 68
        },
        kind: "named",
        name: "HackCompletion"
      }
    }
  }], ["HackSearchPosition", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 70
    },
    name: "HackSearchPosition",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 70
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 71
        },
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 71
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 72
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 72
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 73
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 73
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 74
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 74
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 75
        },
        name: "length",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 75
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 76
        },
        name: "scope",
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
        name: "additionalInfo",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 77
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["HackTypeAtPosResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 80
    },
    name: "HackTypeAtPosResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 80
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 81
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 81
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 81
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 82
        },
        name: "pos",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 82
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 82
            },
            kind: "named",
            name: "HackRange"
          }
        },
        optional: false
      }]
    }
  }], ["HackHighlightRefsResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 85
    },
    name: "HackHighlightRefsResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 85
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 85
        },
        kind: "named",
        name: "HackRange"
      }
    }
  }], ["HackFormatSourceResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 87
    },
    name: "HackFormatSourceResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 87
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 88
        },
        name: "error_message",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 88
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 89
        },
        name: "result",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 89
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 90
        },
        name: "internal_error",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 90
          },
          kind: "boolean"
        },
        optional: false
      }]
    }
  }], ["initialize", {
    kind: "function",
    name: "initialize",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 96
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 96
      },
      kind: "function",
      argumentTypes: [{
        name: "hackCommand",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 97
          },
          kind: "string"
        }
      }, {
        name: "useIdeConnection",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 98
          },
          kind: "boolean"
        }
      }, {
        name: "logLevel",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 99
          },
          kind: "named",
          name: "LogLevel"
        }
      }, {
        name: "fileNotifier",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 100
          },
          kind: "named",
          name: "FileNotifier"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 101
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 101
          },
          kind: "named",
          name: "HackLanguageService"
        }
      }
    }
  }], ["HackLanguageService", {
    kind: "interface",
    name: "HackLanguageService",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 109
    },
    constructorArgs: [{
      name: "fileNotifier",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 112
        },
        kind: "named",
        name: "FileNotifier"
      }
    }],
    staticMethods: new Map(),
    instanceMethods: new Map([["getDiagnostics", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 116
      },
      kind: "function",
      argumentTypes: [{
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 117
          },
          kind: "named",
          name: "FileVersion"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 118
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 118
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 118
            },
            kind: "named",
            name: "DiagnosticProviderUpdate"
          }
        }
      }
    }], ["getAutocompleteSuggestions", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 139
      },
      kind: "function",
      argumentTypes: [{
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 140
          },
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 141
          },
          kind: "named",
          name: "atom$Point"
        }
      }, {
        name: "activatedManually",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 142
          },
          kind: "boolean"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 143
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 143
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 143
            },
            kind: "named",
            name: "Completion"
          }
        }
      }
    }], ["getDefinition", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 191
      },
      kind: "function",
      argumentTypes: [{
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 192
          },
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 193
          },
          kind: "named",
          name: "atom$Point"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 194
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 194
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 194
            },
            kind: "named",
            name: "DefinitionQueryResult"
          }
        }
      }
    }], ["getDefinitionById", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 215
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 216
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "id",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 217
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 218
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 218
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 218
            },
            kind: "named",
            name: "Definition"
          }
        }
      }
    }], ["findReferences", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 247
      },
      kind: "function",
      argumentTypes: [{
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 248
          },
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 249
          },
          kind: "named",
          name: "atom$Point"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 250
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 250
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 250
            },
            kind: "named",
            name: "FindReferencesReturn"
          }
        }
      }
    }], ["executeQuery", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 273
      },
      kind: "function",
      argumentTypes: [{
        name: "rootDirectory",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 274
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
            line: 275
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 276
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 276
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 276
            },
            kind: "named",
            name: "HackSearchPosition"
          }
        }
      }
    }], ["getCoverage", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 280
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 281
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 282
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 282
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 282
            },
            kind: "named",
            name: "CoverageResult"
          }
        }
      }
    }], ["getOutline", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 293
      },
      kind: "function",
      argumentTypes: [{
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 294
          },
          kind: "named",
          name: "FileVersion"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 295
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 295
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 295
            },
            kind: "named",
            name: "Outline"
          }
        }
      }
    }], ["typeHint", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 313
      },
      kind: "function",
      argumentTypes: [{
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 313
          },
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 313
          },
          kind: "named",
          name: "atom$Point"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 313
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 313
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 313
            },
            kind: "named",
            name: "TypeHint"
          }
        }
      }
    }], ["highlight", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 341
      },
      kind: "function",
      argumentTypes: [{
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 342
          },
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "position",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 343
          },
          kind: "named",
          name: "atom$Point"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 344
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 344
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 344
            },
            kind: "named",
            name: "atom$Range"
          }
        }
      }
    }], ["formatSource", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 365
      },
      kind: "function",
      argumentTypes: [{
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 366
          },
          kind: "named",
          name: "FileVersion"
        }
      }, {
        name: "range",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 367
          },
          kind: "named",
          name: "atom$Range"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 368
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 368
          },
          kind: "string"
        }
      }
    }], ["getProjectRoot", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 390
      },
      kind: "function",
      argumentTypes: [{
        name: "fileUri",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 390
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 390
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 390
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 390
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }
    }], ["isFileInHackProject", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 398
      },
      kind: "function",
      argumentTypes: [{
        name: "fileUri",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 398
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 398
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 398
          },
          kind: "boolean"
        }
      }
    }], ["dispose", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 403
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 403
        },
        kind: "void"
      }
    }]])
  }], ["HintTree", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 12
    },
    name: "HintTree",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 12
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 13
        },
        name: "value",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 13
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 14
        },
        name: "children",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 14
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 14
            },
            kind: "named",
            name: "HintTree"
          }
        },
        optional: true
      }]
    }
  }], ["TypeHint", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 17
    },
    name: "TypeHint",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 17
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 21
        },
        name: "hint",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 21
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 26
        },
        name: "hintTree",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 26
          },
          kind: "named",
          name: "HintTree"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 27
        },
        name: "range",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 27
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: false
      }]
    }
  }], ["OutlineTree", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 14
    },
    name: "OutlineTree",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 14
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 16
        },
        name: "plainText",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 16
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 17
        },
        name: "tokenizedText",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          kind: "named",
          name: "TokenizedText"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 18
        },
        name: "representativeName",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 18
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 20
        },
        name: "startPosition",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 20
          },
          kind: "named",
          name: "atom$Point"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 21
        },
        name: "endPosition",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 21
          },
          kind: "named",
          name: "atom$Point"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 22
        },
        name: "children",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 22
            },
            kind: "named",
            name: "OutlineTree"
          }
        },
        optional: false
      }]
    }
  }], ["Outline", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 25
    },
    name: "Outline",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 25
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 26
        },
        name: "outlineTrees",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 26
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 26
            },
            kind: "named",
            name: "OutlineTree"
          }
        },
        optional: false
      }]
    }
  }], ["TokenKind", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "tokenizedText-rpc-types.js",
      line: 13
    },
    name: "TokenKind",
    definition: {
      location: {
        type: "source",
        fileName: "tokenizedText-rpc-types.js",
        line: 13
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 13
        },
        kind: "string-literal",
        value: "keyword"
      }, {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 14
        },
        kind: "string-literal",
        value: "class-name"
      }, {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 15
        },
        kind: "string-literal",
        value: "constructor"
      }, {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 16
        },
        kind: "string-literal",
        value: "method"
      }, {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 17
        },
        kind: "string-literal",
        value: "param"
      }, {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 18
        },
        kind: "string-literal",
        value: "string"
      }, {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 19
        },
        kind: "string-literal",
        value: "whitespace"
      }, {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 20
        },
        kind: "string-literal",
        value: "plain"
      }, {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 21
        },
        kind: "string-literal",
        value: "type"
      }]
    }
  }], ["TextToken", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "tokenizedText-rpc-types.js",
      line: 24
    },
    name: "TextToken",
    definition: {
      location: {
        type: "source",
        fileName: "tokenizedText-rpc-types.js",
        line: 24
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 25
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 25
          },
          kind: "named",
          name: "TokenKind"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 26
        },
        name: "value",
        type: {
          location: {
            type: "source",
            fileName: "tokenizedText-rpc-types.js",
            line: 26
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["TokenizedText", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "tokenizedText-rpc-types.js",
      line: 29
    },
    name: "TokenizedText",
    definition: {
      location: {
        type: "source",
        fileName: "tokenizedText-rpc-types.js",
        line: 29
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "tokenizedText-rpc-types.js",
          line: 29
        },
        kind: "named",
        name: "TextToken"
      }
    }
  }], ["UncoveredRegion", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 11
    },
    name: "UncoveredRegion",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 11
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 12
        },
        name: "range",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 12
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 13
        },
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 13
          },
          kind: "string"
        },
        optional: true
      }]
    }
  }], ["CoverageResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 16
    },
    name: "CoverageResult",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 16
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 17
        },
        name: "percentage",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 18
        },
        name: "uncoveredRegions",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 18
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 18
            },
            kind: "named",
            name: "UncoveredRegion"
          }
        },
        optional: false
      }]
    }
  }], ["Reference", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 14
    },
    name: "Reference",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 14
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 15
        },
        name: "uri",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 15
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 16
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 16
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 16
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 17
        },
        name: "range",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: false
      }]
    }
  }], ["FindReferencesData", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 20
    },
    name: "FindReferencesData",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 20
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 21
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 21
          },
          kind: "string-literal",
          value: "data"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 22
        },
        name: "baseUri",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 23
        },
        name: "referencedSymbolName",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 23
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 24
        },
        name: "references",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 24
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 24
            },
            kind: "named",
            name: "Reference"
          }
        },
        optional: false
      }]
    }
  }], ["FindReferencesError", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 27
    },
    name: "FindReferencesError",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 27
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 28
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          kind: "string-literal",
          value: "error"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 29
        },
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 29
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["FindReferencesReturn", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 32
    },
    name: "FindReferencesReturn",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 32
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 20
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 21
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 21
            },
            kind: "string-literal",
            value: "data"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          name: "baseUri",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 22
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 23
          },
          name: "referencedSymbolName",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 23
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 24
          },
          name: "references",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 24
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 24
              },
              kind: "named",
              name: "Reference"
            }
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 27
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 28
            },
            kind: "string-literal",
            value: "error"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 29
          },
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 29
            },
            kind: "string"
          },
          optional: false
        }]
      }],
      discriminantField: "type"
    }
  }], ["Definition", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 24
    },
    name: "Definition",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 24
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 25
        },
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 25
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 26
        },
        name: "position",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 26
          },
          kind: "named",
          name: "atom$Point"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 27
        },
        name: "range",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 27
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 28
        },
        name: "id",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 29
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 29
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 30
        },
        name: "language",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 30
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 31
        },
        name: "projectRoot",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 31
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: true
      }]
    }
  }], ["DefinitionQueryResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 37
    },
    name: "DefinitionQueryResult",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 37
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 38
        },
        name: "queryRange",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 38
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 39
        },
        name: "definitions",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 39
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 39
            },
            kind: "named",
            name: "Definition"
          }
        },
        optional: false
      }]
    }
  }], ["InvalidationMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 16
    },
    name: "InvalidationMessage",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 16
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 16
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          name: "scope",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 17
            },
            kind: "string-literal",
            value: "file"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 18
          },
          name: "filePaths",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 18
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 18
              },
              kind: "named",
              name: "NuclideUri"
            }
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 19
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 20
          },
          name: "scope",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 20
            },
            kind: "string-literal",
            value: "project"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 21
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          name: "scope",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 22
            },
            kind: "string-literal",
            value: "all"
          },
          optional: false
        }]
      }],
      discriminantField: "scope"
    }
  }], ["DiagnosticProviderUpdate", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 32
    },
    name: "DiagnosticProviderUpdate",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 32
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 33
        },
        name: "filePathToMessages",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 33
          },
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 33
            },
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 33
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 33
              },
              kind: "named",
              name: "FileDiagnosticMessage"
            }
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 34
        },
        name: "projectMessages",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 34
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 34
            },
            kind: "named",
            name: "ProjectDiagnosticMessage"
          }
        },
        optional: true
      }]
    }
  }], ["MessageType", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 37
    },
    name: "MessageType",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 37
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 37
        },
        kind: "string-literal",
        value: "Error"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 37
        },
        kind: "string-literal",
        value: "Warning"
      }]
    }
  }], ["Trace", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 39
    },
    name: "Trace",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 39
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 40
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 40
          },
          kind: "string-literal",
          value: "Trace"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 41
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 41
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 42
        },
        name: "html",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 42
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 43
        },
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 43
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 44
        },
        name: "range",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 44
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: true
      }]
    }
  }], ["Fix", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 47
    },
    name: "Fix",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 47
      },
      kind: "named",
      name: "TextEdit"
    }
  }], ["FileDiagnosticMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 49
    },
    name: "FileDiagnosticMessage",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 49
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 50
        },
        name: "scope",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 50
          },
          kind: "string-literal",
          value: "file"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 51
        },
        name: "providerName",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 51
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 52
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 52
          },
          kind: "named",
          name: "MessageType"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 53
        },
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 53
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 54
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 54
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 55
        },
        name: "html",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 55
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 56
        },
        name: "range",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 56
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 57
        },
        name: "trace",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 57
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 57
            },
            kind: "named",
            name: "Trace"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 58
        },
        name: "fix",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 58
          },
          kind: "named",
          name: "Fix"
        },
        optional: true
      }]
    }
  }], ["ProjectDiagnosticMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 61
    },
    name: "ProjectDiagnosticMessage",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 61
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 62
        },
        name: "scope",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 62
          },
          kind: "string-literal",
          value: "project"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 63
        },
        name: "providerName",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 63
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 64
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 64
          },
          kind: "named",
          name: "MessageType"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 65
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 65
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 66
        },
        name: "html",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 66
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 67
        },
        name: "range",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 67
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 68
        },
        name: "trace",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 68
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 68
            },
            kind: "named",
            name: "Trace"
          }
        },
        optional: true
      }]
    }
  }], ["TextEdit", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 12
    },
    name: "TextEdit",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 12
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 13
        },
        name: "oldRange",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 13
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 14
        },
        name: "newText",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 14
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 16
        },
        name: "oldText",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 16
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 17
        },
        name: "speculative",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          kind: "boolean"
        },
        optional: true
      }]
    }
  }], ["FileOpenEvent", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 13
    },
    name: "FileOpenEvent",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 13
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 14
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 14
          },
          kind: "string-literal",
          value: "open"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 15
        },
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 15
          },
          kind: "named",
          name: "FileVersion"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 16
        },
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 16
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["FileSyncEvent", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 20
    },
    name: "FileSyncEvent",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 20
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 21
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 21
          },
          kind: "string-literal",
          value: "sync"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 22
        },
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          kind: "named",
          name: "FileVersion"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 23
        },
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 23
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["FileCloseEvent", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 26
    },
    name: "FileCloseEvent",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 26
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 27
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 27
          },
          kind: "string-literal",
          value: "close"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 28
        },
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          kind: "named",
          name: "FileVersion"
        },
        optional: false
      }]
    }
  }], ["FileEditEvent", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 31
    },
    name: "FileEditEvent",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 31
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 32
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 32
          },
          kind: "string-literal",
          value: "edit"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 33
        },
        name: "fileVersion",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 33
          },
          kind: "named",
          name: "FileVersion"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 34
        },
        name: "oldRange",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 34
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 35
        },
        name: "newRange",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 35
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 36
        },
        name: "oldText",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 36
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 37
        },
        name: "newText",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 37
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["FileEvent", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 41
    },
    name: "FileEvent",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 41
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 13
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 14
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 14
            },
            kind: "string-literal",
            value: "open"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 15
          },
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 15
            },
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 16
          },
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 16
            },
            kind: "string"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 26
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 27
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 27
            },
            kind: "string-literal",
            value: "close"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 28
            },
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 31
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 32
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 32
            },
            kind: "string-literal",
            value: "edit"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 33
          },
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 33
            },
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 34
          },
          name: "oldRange",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 34
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 35
          },
          name: "newRange",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 35
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 36
          },
          name: "oldText",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 36
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 37
          },
          name: "newText",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 37
            },
            kind: "string"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 20
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 21
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 21
            },
            kind: "string-literal",
            value: "sync"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          name: "fileVersion",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 22
            },
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 23
          },
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 23
            },
            kind: "string"
          },
          optional: false
        }]
      }],
      discriminantField: "kind"
    }
  }], ["FileNotifier", {
    kind: "interface",
    name: "FileNotifier",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 43
    },
    constructorArgs: null,
    staticMethods: new Map(),
    instanceMethods: new Map([["onEvent", {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 44
      },
      kind: "function",
      argumentTypes: [{
        name: "event",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 44
          },
          kind: "named",
          name: "FileEvent"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 44
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 44
          },
          kind: "void"
        }
      }
    }], ["dispose", {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 45
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 45
        },
        kind: "void"
      }
    }]])
  }], ["FileVersion", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 48
    },
    name: "FileVersion",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 48
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 49
        },
        name: "notifier",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 49
          },
          kind: "named",
          name: "FileNotifier"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 50
        },
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 50
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 51
        },
        name: "version",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 51
          },
          kind: "number"
        },
        optional: false
      }]
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
  }], ["HackParameterDetails", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 14
    },
    name: "HackParameterDetails",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 14
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 15
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 15
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 16
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 16
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 17
        },
        name: "variadic",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          kind: "boolean"
        },
        optional: false
      }]
    }
  }], ["HackFunctionDetails", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 20
    },
    name: "HackFunctionDetails",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 20
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 21
        },
        name: "min_arity",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 21
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 22
        },
        name: "return_type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 23
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 23
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 23
            },
            kind: "named",
            name: "HackParameterDetails"
          }
        },
        optional: false
      }]
    }
  }], ["HackRange", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 27
    },
    name: "HackRange",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 27
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 28
        },
        name: "filename",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 29
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 29
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 30
        },
        name: "char_start",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 30
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 31
        },
        name: "char_end",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 31
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
      fileName: "rpc-types.js",
      line: 34
    },
    name: "HackCompletion",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 34
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 35
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 35
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 36
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 36
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 37
        },
        name: "pos",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 37
          },
          kind: "named",
          name: "HackRange"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 38
        },
        name: "func_details",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 38
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 38
            },
            kind: "named",
            name: "HackFunctionDetails"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 39
        },
        name: "expected_ty",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 39
          },
          kind: "boolean"
        },
        optional: false
      }]
    }
  }], ["Completion", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 43
    },
    name: "Completion",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 43
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 44
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 44
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 45
        },
        name: "snippet",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 45
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 46
        },
        name: "displayText",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 46
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 47
        },
        name: "replacementPrefix",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 47
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 48
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 48
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 48
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 49
        },
        name: "leftLabel",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 49
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 49
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 50
        },
        name: "leftLabelHTML",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 50
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 50
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 51
        },
        name: "rightLabel",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 51
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 51
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 52
        },
        name: "rightLabelHTML",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 52
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 52
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 53
        },
        name: "className",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 53
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 53
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 54
        },
        name: "iconHTML",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 54
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 54
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 55
        },
        name: "description",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 55
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 55
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 56
        },
        name: "descriptionMoreURL",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 56
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 56
            },
            kind: "string"
          }
        },
        optional: true
      }]
    }
  }]])
});