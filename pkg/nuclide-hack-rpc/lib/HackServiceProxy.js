"use strict";

let Observable, trackOperationTiming;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.initialize = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "hackCommand",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 131
        },
        kind: "string"
      }
    }, {
      name: "useIdeConnection",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 132
        },
        kind: "boolean"
      }
    }, {
      name: "logLevel",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 133
        },
        kind: "named",
        name: "LogLevel"
      }
    }]).then(args => {
      return _client.callRemoteFunction("HackService/initialize", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 134
        },
        kind: "named",
        name: "HackLanguageService"
      });
    });
  };

  remoteModule.HackLanguageService = class {
    constructor() {
      _client.createRemoteObject("HackLanguageService", this, [], [])
    }
    getDiagnostics(arg0, arg1) {
      return trackOperationTiming("HackLanguageService.getDiagnostics", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 144
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
              line: 145
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 145
              },
              kind: "string"
            }
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 142
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
              line: 146
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 146
              },
              kind: "named",
              name: "HackDiagnosticsResult"
            }
          });
        });
      });
    }
    getCompletions(arg0, arg1, arg2, arg3, arg4) {
      return trackOperationTiming("HackLanguageService.getCompletions", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 177
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
              line: 178
            },
            kind: "string"
          }
        }, {
          name: "offset",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 179
            },
            kind: "number"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 180
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 181
            },
            kind: "number"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 142
            },
            name: "HackLanguageService"
          }).then(id => {
            return _client.callRemoteMethod(id, "getCompletions", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 182
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 182
              },
              kind: "named",
              name: "HackCompletionsResult"
            }
          });
        });
      });
    }
    getDefinition(arg0, arg1, arg2, arg3) {
      return trackOperationTiming("HackLanguageService.getDefinition", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 215
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
              line: 216
            },
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 217
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 218
            },
            kind: "number"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 142
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
              line: 219
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 219
              },
              kind: "named",
              name: "HackDefinition"
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
              line: 252
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
              line: 253
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 142
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
              line: 254
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 254
              },
              kind: "named",
              name: "HackIdeOutlineItem"
            }
          });
        });
      });
    }
    findReferences(arg0, arg1, arg2, arg3) {
      return trackOperationTiming("HackLanguageService.findReferences", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 265
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
              line: 266
            },
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 267
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 268
            },
            kind: "number"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 142
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
              line: 269
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 269
              },
              kind: "named",
              name: "HackReferencesResult"
            }
          });
        });
      });
    }
    queryHack(arg0, arg1) {
      return trackOperationTiming("HackLanguageService.queryHack", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "rootDirectory",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 287
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "queryString_",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 288
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 142
            },
            name: "HackLanguageService"
          }).then(id => {
            return _client.callRemoteMethod(id, "queryHack", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 289
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 289
              },
              kind: "named",
              name: "HackSearchPosition"
            }
          });
        });
      });
    }
    getTypedRegions(arg0) {
      return trackOperationTiming("HackLanguageService.getTypedRegions", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 319
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
              line: 142
            },
            name: "HackLanguageService"
          }).then(id => {
            return _client.callRemoteMethod(id, "getTypedRegions", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 320
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 320
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HackService.js",
                  line: 320
                },
                kind: "named",
                name: "HackTypedRegion"
              }
            }
          });
        });
      });
    }
    getIdeOutline(arg0, arg1) {
      return trackOperationTiming("HackLanguageService.getIdeOutline", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 331
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
              line: 332
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 142
            },
            name: "HackLanguageService"
          }).then(id => {
            return _client.callRemoteMethod(id, "getIdeOutline", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 333
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 333
              },
              kind: "named",
              name: "HackIdeOutline"
            }
          });
        });
      });
    }
    getTypeAtPos(arg0, arg1, arg2, arg3) {
      return trackOperationTiming("HackLanguageService.getTypeAtPos", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 344
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
              line: 345
            },
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 346
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 347
            },
            kind: "number"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 142
            },
            name: "HackLanguageService"
          }).then(id => {
            return _client.callRemoteMethod(id, "getTypeAtPos", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 348
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 348
              },
              kind: "named",
              name: "HackTypeAtPosResult"
            }
          });
        });
      });
    }
    getSourceHighlights(arg0, arg1, arg2, arg3) {
      return trackOperationTiming("HackLanguageService.getSourceHighlights", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 359
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
              line: 360
            },
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 361
            },
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 362
            },
            kind: "number"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 142
            },
            name: "HackLanguageService"
          }).then(id => {
            return _client.callRemoteMethod(id, "getSourceHighlights", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 363
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 363
              },
              kind: "named",
              name: "HackHighlightRefsResult"
            }
          });
        });
      });
    }
    formatSource(arg0, arg1, arg2, arg3) {
      return trackOperationTiming("HackLanguageService.formatSource", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 374
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
              line: 375
            },
            kind: "string"
          }
        }, {
          name: "startOffset",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 376
            },
            kind: "number"
          }
        }, {
          name: "endOffset",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 377
            },
            kind: "number"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 142
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
              line: 378
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 378
              },
              kind: "named",
              name: "HackFormatSourceResult"
            }
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
              line: 388
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
              line: 142
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
              line: 388
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 388
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
              line: 396
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
              line: 142
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
              line: 396
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
      line: 34
    },
    name: "SymbolTypeValue",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 34
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 34
        },
        kind: "number-literal",
        value: 0
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 34
        },
        kind: "number-literal",
        value: 1
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 34
        },
        kind: "number-literal",
        value: 2
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 34
        },
        kind: "number-literal",
        value: 3
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 34
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
      line: 36
    },
    name: "HackDiagnosticsResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 36
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 36
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 36
          },
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 36
            },
            kind: "named",
            name: "HackDiagnostic"
          },
          optional: false
        }]
      }
    }
  }], ["HackDiagnostic", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 43
    },
    name: "HackDiagnostic",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 43
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 43
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
      line: 45
    },
    name: "SingleHackMessage",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 45
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 46
        },
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 46
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 46
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
          line: 47
        },
        name: "descr",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 47
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 48
        },
        name: "code",
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
        name: "line",
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
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 50
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 51
        },
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 51
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
      line: 55
    },
    name: "HackSpan",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 55
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 56
        },
        name: "filename",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 56
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 57
        },
        name: "line_start",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 57
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 58
        },
        name: "char_start",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 58
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 59
        },
        name: "line_end",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 59
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 60
        },
        name: "char_end",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 60
          },
          kind: "number"
        },
        optional: false
      }]
    }
  }], ["HackCompletionsResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 64
    },
    name: "HackCompletionsResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 64
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 64
        },
        kind: "named",
        name: "HackCompletion"
      }
    }
  }], ["HackReferencesResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 66
    },
    name: "HackReferencesResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 66
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 66
        },
        kind: "named",
        name: "HackReference"
      }
    }
  }], ["HackSearchPosition", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 68
    },
    name: "HackSearchPosition",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 68
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 69
        },
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 69
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 70
        },
        name: "line",
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
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 71
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 72
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 72
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 73
        },
        name: "length",
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
        name: "scope",
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
        name: "additionalInfo",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 75
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
      line: 78
    },
    name: "HackReference",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 78
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 79
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 79
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 80
        },
        name: "filename",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 80
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 81
        },
        name: "projectRoot",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 81
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 82
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 82
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 83
        },
        name: "char_start",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 83
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 84
        },
        name: "char_end",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 84
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
      line: 87
    },
    name: "HackTypedRegion",
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
        name: "color",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 88
          },
          kind: "union",
          types: [{
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 88
            },
            kind: "string-literal",
            value: "default"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 88
            },
            kind: "string-literal",
            value: "checked"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 88
            },
            kind: "string-literal",
            value: "partial"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 88
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
          line: 89
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 89
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
      line: 92
    },
    name: "HackIdeOutlineItem",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 92
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 93
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 93
          },
          kind: "union",
          types: [{
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 93
            },
            kind: "string-literal",
            value: "function"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 93
            },
            kind: "string-literal",
            value: "class"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 93
            },
            kind: "string-literal",
            value: "property"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 93
            },
            kind: "string-literal",
            value: "method"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 93
            },
            kind: "string-literal",
            value: "const"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 94
            },
            kind: "string-literal",
            value: "enum"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 94
            },
            kind: "string-literal",
            value: "typeconst"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 94
            },
            kind: "string-literal",
            value: "param"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 94
            },
            kind: "string-literal",
            value: "trait"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 94
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
          line: 95
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 95
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 96
        },
        name: "position",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 96
          },
          kind: "named",
          name: "HackRange"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 97
        },
        name: "id",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 97
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 97
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 98
        },
        name: "span",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 98
          },
          kind: "named",
          name: "HackSpan"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 99
        },
        name: "modifiers",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 99
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 99
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 99
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
          line: 100
        },
        name: "children",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 100
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 100
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
          line: 101
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 101
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 101
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
          line: 102
        },
        name: "docblock",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 102
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
      line: 105
    },
    name: "HackIdeOutline",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 105
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 105
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
      line: 107
    },
    name: "HackTypeAtPosResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 107
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 108
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 108
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 108
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 109
        },
        name: "pos",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 109
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 109
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
      line: 112
    },
    name: "HackHighlightRefsResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 112
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 112
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
      line: 114
    },
    name: "HackFormatSourceResult",
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
        name: "error_message",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 115
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 116
        },
        name: "result",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 116
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 117
        },
        name: "internal_error",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 117
          },
          kind: "boolean"
        },
        optional: false
      }]
    }
  }], ["HackDefinition", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 120
    },
    name: "HackDefinition",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 120
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 121
        },
        name: "definition_pos",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 121
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 121
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
        name: "pos",
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
        name: "projectRoot",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 124
          },
          kind: "named",
          name: "NuclideUri"
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
      line: 130
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 130
      },
      kind: "function",
      argumentTypes: [{
        name: "hackCommand",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 131
          },
          kind: "string"
        }
      }, {
        name: "useIdeConnection",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 132
          },
          kind: "boolean"
        }
      }, {
        name: "logLevel",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 133
          },
          kind: "named",
          name: "LogLevel"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 134
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 134
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
      line: 142
    },
    constructorArgs: [],
    staticMethods: new Map(),
    instanceMethods: new Map([["getDiagnostics", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 143
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 144
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
            line: 145
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 145
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 146
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 146
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 146
            },
            kind: "named",
            name: "HackDiagnosticsResult"
          }
        }
      }
    }], ["getCompletions", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 176
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 177
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
            line: 178
          },
          kind: "string"
        }
      }, {
        name: "offset",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 179
          },
          kind: "number"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 180
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 181
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 182
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 182
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 182
            },
            kind: "named",
            name: "HackCompletionsResult"
          }
        }
      }
    }], ["getDefinition", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 214
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 215
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
            line: 216
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 217
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 218
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 219
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 219
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 219
            },
            kind: "named",
            name: "HackDefinition"
          }
        }
      }
    }], ["getDefinitionById", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 251
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 252
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
            line: 253
          },
          kind: "string"
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
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 254
            },
            kind: "named",
            name: "HackIdeOutlineItem"
          }
        }
      }
    }], ["findReferences", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 264
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 265
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
            line: 266
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 267
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 268
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 269
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 269
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 269
            },
            kind: "named",
            name: "HackReferencesResult"
          }
        }
      }
    }], ["queryHack", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 286
      },
      kind: "function",
      argumentTypes: [{
        name: "rootDirectory",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 287
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "queryString_",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 288
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 289
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 289
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 289
            },
            kind: "named",
            name: "HackSearchPosition"
          }
        }
      }
    }], ["getTypedRegions", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 318
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 319
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 320
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 320
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 320
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 320
              },
              kind: "named",
              name: "HackTypedRegion"
            }
          }
        }
      }
    }], ["getIdeOutline", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 330
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 331
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
            line: 332
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 333
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 333
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 333
            },
            kind: "named",
            name: "HackIdeOutline"
          }
        }
      }
    }], ["getTypeAtPos", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 343
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 344
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
            line: 345
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 346
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 347
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 348
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 348
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 348
            },
            kind: "named",
            name: "HackTypeAtPosResult"
          }
        }
      }
    }], ["getSourceHighlights", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 358
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 359
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
            line: 360
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 361
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 362
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 363
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 363
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 363
            },
            kind: "named",
            name: "HackHighlightRefsResult"
          }
        }
      }
    }], ["formatSource", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 373
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 374
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
            line: 375
          },
          kind: "string"
        }
      }, {
        name: "startOffset",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 376
          },
          kind: "number"
        }
      }, {
        name: "endOffset",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 377
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 378
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 378
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 378
            },
            kind: "named",
            name: "HackFormatSourceResult"
          }
        }
      }
    }], ["getProjectRoot", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 388
      },
      kind: "function",
      argumentTypes: [{
        name: "fileUri",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 388
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 388
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 388
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 388
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
        line: 396
      },
      kind: "function",
      argumentTypes: [{
        name: "fileUri",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 396
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 396
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 396
          },
          kind: "boolean"
        }
      }
    }], ["dispose", {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 401
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 401
        },
        kind: "void"
      }
    }]])
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
  }]])
});