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
          line: 158
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
          line: 159
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 159
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("HackService/getDiagnostics", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 160
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 160
          },
          kind: "named",
          name: "HackDiagnosticsResult"
        }
      });
    });
  };

  remoteModule.getCompletions = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "file",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 195
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
          line: 196
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("HackService/getCompletions", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 197
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 197
          },
          kind: "named",
          name: "HackCompletionsResult"
        }
      });
    });
  };

  remoteModule.getDefinition = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "file",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 217
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
          line: 218
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 219
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 220
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("HackService/getDefinition", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 221
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 221
          },
          kind: "named",
          name: "HackDefinition"
        }
      });
    });
  };

  remoteModule.findReferences = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "file",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 257
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
          line: 258
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 259
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 260
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("HackService/findReferences", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 261
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 261
          },
          kind: "named",
          name: "HackReferencesResult"
        }
      });
    });
  };

  remoteModule.getHackEnvironmentDetails = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "localFile",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 284
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
          line: 285
        },
        kind: "string"
      }
    }, {
      name: "useIdeConnection",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 286
        },
        kind: "boolean"
      }
    }, {
      name: "logLevel",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 287
        },
        kind: "named",
        name: "LogLevel"
      }
    }]).then(args => {
      return _client.callRemoteFunction("HackService/getHackEnvironmentDetails", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 288
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 288
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 288
            },
            name: "hackRoot",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 288
              },
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 288
            },
            name: "hackCommand",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 288
              },
              kind: "string"
            },
            optional: false
          }]
        }
      });
    });
  };

  remoteModule.queryHack = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootDirectory",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 299
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
          line: 300
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("HackService/queryHack", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 301
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 301
          },
          kind: "named",
          name: "HackSearchPosition"
        }
      });
    });
  };

  remoteModule.getTypedRegions = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 329
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("HackService/getTypedRegions", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 330
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 330
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 330
            },
            kind: "named",
            name: "HackTypedRegion"
          }
        }
      });
    });
  };

  remoteModule.getIdeOutline = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 346
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
          line: 347
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("HackService/getIdeOutline", "promise", args);
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
          name: "HackIdeOutline"
        }
      });
    });
  };

  remoteModule.getTypeAtPos = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 363
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
          line: 364
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 365
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 366
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("HackService/getTypeAtPos", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 367
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 367
          },
          kind: "named",
          name: "HackTypeAtPosResult"
        }
      });
    });
  };

  remoteModule.getSourceHighlights = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 383
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
          line: 384
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 385
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 386
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("HackService/getSourceHighlights", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 387
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 387
          },
          kind: "named",
          name: "HackHighlightRefsResult"
        }
      });
    });
  };

  remoteModule.formatSource = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 403
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
          line: 404
        },
        kind: "string"
      }
    }, {
      name: "startOffset",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 405
        },
        kind: "number"
      }
    }, {
      name: "endOffset",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 406
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("HackService/formatSource", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 407
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 407
          },
          kind: "named",
          name: "HackFormatSourceResult"
        }
      });
    });
  };

  remoteModule.isAvailableForDirectoryHack = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootDirectory",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 427
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("HackService/isAvailableForDirectoryHack", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 427
        },
        kind: "boolean"
      });
    });
  };

  remoteModule.isFileInHackProject = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileUri",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 436
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("HackService/isFileInHackProject", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 436
        },
        kind: "boolean"
      });
    });
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
  }], ["SymbolTypeValue", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 25
    },
    name: "SymbolTypeValue",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 25
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 25
        },
        kind: "number-literal",
        value: 0
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 25
        },
        kind: "number-literal",
        value: 1
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 25
        },
        kind: "number-literal",
        value: 2
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 25
        },
        kind: "number-literal",
        value: 3
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 25
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
      line: 27
    },
    name: "HackDiagnosticsResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 27
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 29
        },
        name: "hackRoot",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 29
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 30
        },
        name: "messages",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 30
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 30
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 31
              },
              name: "message",
              type: {
                location: {
                  type: "source",
                  fileName: "HackService.js",
                  line: 31
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
      line: 40
    },
    name: "HackDiagnostic",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 40
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 40
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
      line: 42
    },
    name: "SingleHackMessage",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 42
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 43
        },
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 43
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 43
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
          line: 44
        },
        name: "descr",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 44
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 45
        },
        name: "code",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 45
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 46
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 46
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 47
        },
        name: "start",
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
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 48
          },
          kind: "number"
        },
        optional: false
      }]
    }
  }], ["HackParameterDetails", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 51
    },
    name: "HackParameterDetails",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 51
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 52
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 52
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 53
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 53
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 54
        },
        name: "variadic",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 54
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
      fileName: "HackService.js",
      line: 57
    },
    name: "HackFunctionDetails",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 57
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 58
        },
        name: "min_arity",
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
        name: "return_type",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 59
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 60
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 60
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 60
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
      fileName: "HackService.js",
      line: 64
    },
    name: "HackRange",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 64
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 65
        },
        name: "filename",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 65
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 66
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 66
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 67
        },
        name: "char_start",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 67
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 68
        },
        name: "char_end",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 68
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
      line: 72
    },
    name: "HackSpan",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 72
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 73
        },
        name: "filename",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 73
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 74
        },
        name: "line_start",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 74
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 75
        },
        name: "char_start",
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
        name: "line_end",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 76
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 77
        },
        name: "char_end",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 77
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
      line: 80
    },
    name: "HackCompletion",
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
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 81
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 82
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 82
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 83
        },
        name: "pos",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 83
          },
          kind: "named",
          name: "HackRange"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 84
        },
        name: "func_details",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 84
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 84
            },
            kind: "named",
            name: "HackFunctionDetails"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 85
        },
        name: "expected_ty",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 85
          },
          kind: "boolean"
        },
        optional: false
      }]
    }
  }], ["HackCompletionsResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 88
    },
    name: "HackCompletionsResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 88
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 89
        },
        name: "hackRoot",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 89
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 90
        },
        name: "completions",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 90
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 90
            },
            kind: "named",
            name: "HackCompletion"
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
      line: 93
    },
    name: "HackReferencesResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 93
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 94
        },
        name: "hackRoot",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 94
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 95
        },
        name: "references",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 95
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 95
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
      line: 98
    },
    name: "HackSearchPosition",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 98
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 99
        },
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 99
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 100
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 100
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 101
        },
        name: "column",
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
        name: "name",
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
        name: "length",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 103
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 104
        },
        name: "scope",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 104
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 105
        },
        name: "additionalInfo",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 105
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
      line: 108
    },
    name: "HackReference",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 108
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 109
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 109
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 110
        },
        name: "filename",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 110
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 111
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 111
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 112
        },
        name: "char_start",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 112
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 113
        },
        name: "char_end",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 113
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
      line: 116
    },
    name: "HackTypedRegion",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 116
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 117
        },
        name: "color",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 117
          },
          kind: "union",
          types: [{
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 117
            },
            kind: "string-literal",
            value: "default"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 117
            },
            kind: "string-literal",
            value: "checked"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 117
            },
            kind: "string-literal",
            value: "partial"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 117
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
          line: 118
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 118
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
      line: 121
    },
    name: "HackIdeOutlineItem",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 121
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 122
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 122
          },
          kind: "union",
          types: [{
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 122
            },
            kind: "string-literal",
            value: "function"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 122
            },
            kind: "string-literal",
            value: "class"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 122
            },
            kind: "string-literal",
            value: "property"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 122
            },
            kind: "string-literal",
            value: "method"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 122
            },
            kind: "string-literal",
            value: "const"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 123
            },
            kind: "string-literal",
            value: "enum"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 123
            },
            kind: "string-literal",
            value: "typeconst"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 123
            },
            kind: "string-literal",
            value: "param"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 123
            },
            kind: "string-literal",
            value: "trait"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 123
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
          line: 124
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 124
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 125
        },
        name: "position",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 125
          },
          kind: "named",
          name: "HackRange"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 126
        },
        name: "span",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 126
          },
          kind: "named",
          name: "HackSpan"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 127
        },
        name: "modifiers",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 127
          },
          kind: "nullable",
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
              kind: "string"
            }
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 128
        },
        name: "children",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 128
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 128
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
          line: 129
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 129
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 129
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
          line: 130
        },
        name: "docblock",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 130
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
      line: 133
    },
    name: "HackIdeOutline",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 133
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 133
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
      line: 135
    },
    name: "HackTypeAtPosResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 135
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 136
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 136
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 136
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 137
        },
        name: "pos",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 137
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 137
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
      line: 140
    },
    name: "HackHighlightRefsResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 140
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 140
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
      line: 142
    },
    name: "HackFormatSourceResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 142
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 143
        },
        name: "error_message",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 143
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 144
        },
        name: "result",
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
        name: "internal_error",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 145
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
      line: 148
    },
    name: "HackDefinition",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 148
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 149
        },
        name: "definition_pos",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 149
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 149
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
        name: "pos",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 151
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
      line: 157
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 157
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 158
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
            line: 159
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 159
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 160
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 160
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 160
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
      line: 194
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 194
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 195
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
            line: 196
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 197
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 197
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 197
            },
            kind: "named",
            name: "HackCompletionsResult"
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
      line: 216
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 216
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 217
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
            line: 218
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 219
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 220
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 221
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 221
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 221
            },
            kind: "named",
            name: "HackDefinition"
          }
        }
      }
    }
  }], ["findReferences", {
    kind: "function",
    name: "findReferences",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 256
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 256
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 257
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
            line: 258
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 259
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 260
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 261
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 261
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 261
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
      line: 283
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 283
      },
      kind: "function",
      argumentTypes: [{
        name: "localFile",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 284
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
            line: 285
          },
          kind: "string"
        }
      }, {
        name: "useIdeConnection",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 286
          },
          kind: "boolean"
        }
      }, {
        name: "logLevel",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 287
          },
          kind: "named",
          name: "LogLevel"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 288
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 288
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 288
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 288
              },
              name: "hackRoot",
              type: {
                location: {
                  type: "source",
                  fileName: "HackService.js",
                  line: 288
                },
                kind: "named",
                name: "NuclideUri"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 288
              },
              name: "hackCommand",
              type: {
                location: {
                  type: "source",
                  fileName: "HackService.js",
                  line: 288
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
      line: 298
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 298
      },
      kind: "function",
      argumentTypes: [{
        name: "rootDirectory",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 299
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
            line: 300
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 301
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 301
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 301
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
      line: 329
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 329
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 329
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 330
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 330
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 330
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 330
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
      line: 345
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 345
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 346
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
            line: 347
          },
          kind: "string"
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
      line: 362
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 362
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 363
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
            line: 364
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 365
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 366
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 367
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 367
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 367
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
      line: 382
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 382
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 383
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
            line: 384
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 385
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 386
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 387
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 387
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 387
            },
            kind: "named",
            name: "HackHighlightRefsResult"
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
      line: 402
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 402
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 403
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
            line: 404
          },
          kind: "string"
        }
      }, {
        name: "startOffset",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 405
          },
          kind: "number"
        }
      }, {
        name: "endOffset",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 406
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 407
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 407
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 407
            },
            kind: "named",
            name: "HackFormatSourceResult"
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
      line: 427
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 427
      },
      kind: "function",
      argumentTypes: [{
        name: "rootDirectory",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 427
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 427
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 427
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
      line: 436
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 436
      },
      kind: "function",
      argumentTypes: [{
        name: "fileUri",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 436
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 436
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 436
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