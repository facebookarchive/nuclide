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
          line: 152
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
          line: 153
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 153
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
          line: 154
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 154
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
          line: 189
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
          line: 190
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
          line: 191
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 191
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
          line: 211
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
          line: 212
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 213
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 214
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
          line: 215
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 215
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
          line: 251
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
          line: 252
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 253
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 254
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
          line: 255
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 255
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
          line: 278
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
          line: 279
        },
        kind: "string"
      }
    }, {
      name: "useIdeConnection",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 280
        },
        kind: "boolean"
      }
    }, {
      name: "logLevel",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 281
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
          line: 282
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 282
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 282
            },
            name: "hackRoot",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 282
              },
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 282
            },
            name: "hackCommand",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 282
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
          line: 293
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
          line: 294
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
          line: 295
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 295
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
          line: 323
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
          line: 324
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 324
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 324
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
          line: 340
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
          line: 341
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
          line: 342
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 342
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
          line: 357
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
          line: 358
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 359
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 360
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
          line: 361
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 361
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
          line: 377
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
          line: 378
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 379
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 380
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
          line: 381
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 381
          },
          kind: "named",
          name: "HackFindLvarRefsResult"
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
          line: 397
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
          line: 398
        },
        kind: "string"
      }
    }, {
      name: "startOffset",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 399
        },
        kind: "number"
      }
    }, {
      name: "endOffset",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 400
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
          line: 401
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 401
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
          line: 421
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
          line: 421
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
          line: 430
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
          line: 430
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
  }], ["HackFunctionDetails", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 51
    },
    name: "HackFunctionDetails",
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
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 52
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 52
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
      line: 56
    },
    name: "HackRange",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 56
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 57
        },
        name: "filename",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 57
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 58
        },
        name: "line",
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
        name: "char_start",
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
  }], ["HackSpan", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 64
    },
    name: "HackSpan",
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
        name: "line_start",
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
        name: "line_end",
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
        name: "char_end",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 69
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
      line: 72
    },
    name: "HackCompletion",
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
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 73
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 74
        },
        name: "type",
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
        name: "pos",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 75
          },
          kind: "named",
          name: "HackRange"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 76
        },
        name: "func_details",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 76
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 76
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
      line: 79
    },
    name: "HackCompletionsResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 79
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 80
        },
        name: "hackRoot",
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
        name: "completions",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 81
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 81
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
      line: 84
    },
    name: "HackReferencesResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 84
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 85
        },
        name: "hackRoot",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 85
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 86
        },
        name: "references",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 86
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 86
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
      line: 89
    },
    name: "HackSearchPosition",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 89
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 90
        },
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 90
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 91
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 91
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 92
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 92
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 93
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 93
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 94
        },
        name: "length",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 94
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 95
        },
        name: "scope",
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
        name: "additionalInfo",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 96
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
      line: 99
    },
    name: "HackReference",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 99
      },
      kind: "object",
      fields: [{
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
        name: "filename",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 101
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 102
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 102
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 103
        },
        name: "char_start",
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
        name: "char_end",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 104
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
      line: 107
    },
    name: "HackTypedRegion",
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
        name: "color",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 108
          },
          kind: "union",
          types: [{
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 108
            },
            kind: "string-literal",
            value: "default"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 108
            },
            kind: "string-literal",
            value: "checked"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 108
            },
            kind: "string-literal",
            value: "partial"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 108
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
          line: 109
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 109
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
      line: 112
    },
    name: "HackIdeOutlineItem",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 112
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 113
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 113
          },
          kind: "union",
          types: [{
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 113
            },
            kind: "string-literal",
            value: "function"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 113
            },
            kind: "string-literal",
            value: "class"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 113
            },
            kind: "string-literal",
            value: "property"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 113
            },
            kind: "string-literal",
            value: "method"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 113
            },
            kind: "string-literal",
            value: "const"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 114
            },
            kind: "string-literal",
            value: "enum"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 114
            },
            kind: "string-literal",
            value: "typeconst"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 114
            },
            kind: "string-literal",
            value: "param"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 114
            },
            kind: "string-literal",
            value: "trait"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 114
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
          line: 115
        },
        name: "name",
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
        name: "position",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 116
          },
          kind: "named",
          name: "HackRange"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 117
        },
        name: "span",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 117
          },
          kind: "named",
          name: "HackSpan"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 118
        },
        name: "modifiers",
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
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 118
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
          line: 119
        },
        name: "children",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 119
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 119
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
          line: 120
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 120
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 120
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
          line: 121
        },
        name: "docblock",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 121
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
      line: 124
    },
    name: "HackIdeOutline",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 124
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 124
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
      line: 126
    },
    name: "HackTypeAtPosResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 126
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 127
        },
        name: "type",
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
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 128
        },
        name: "pos",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 128
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 128
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
      line: 131
    },
    name: "HackFindLvarRefsResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 131
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 132
        },
        name: "positions",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 132
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 132
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
          line: 133
        },
        name: "internal_error",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 133
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
      line: 136
    },
    name: "HackFormatSourceResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 136
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 137
        },
        name: "error_message",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 137
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 138
        },
        name: "result",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 138
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 139
        },
        name: "internal_error",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 139
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
      line: 142
    },
    name: "HackDefinition",
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
        name: "definition_pos",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 143
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 143
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
          line: 144
        },
        name: "name",
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
        name: "pos",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 145
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
      line: 151
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 151
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 152
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
            line: 153
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 153
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 154
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 154
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 154
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
      line: 188
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 188
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 189
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
            line: 190
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 191
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 191
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 191
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
      line: 210
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 210
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 211
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
            line: 212
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 213
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 214
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 215
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 215
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 215
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
      line: 250
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 250
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 251
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
            line: 252
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 253
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 254
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 255
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 255
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 255
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
      line: 277
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 277
      },
      kind: "function",
      argumentTypes: [{
        name: "localFile",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 278
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
            line: 279
          },
          kind: "string"
        }
      }, {
        name: "useIdeConnection",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 280
          },
          kind: "boolean"
        }
      }, {
        name: "logLevel",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 281
          },
          kind: "named",
          name: "LogLevel"
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
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 282
              },
              name: "hackRoot",
              type: {
                location: {
                  type: "source",
                  fileName: "HackService.js",
                  line: 282
                },
                kind: "named",
                name: "NuclideUri"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 282
              },
              name: "hackCommand",
              type: {
                location: {
                  type: "source",
                  fileName: "HackService.js",
                  line: 282
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
      line: 292
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 292
      },
      kind: "function",
      argumentTypes: [{
        name: "rootDirectory",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 293
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
            line: 294
          },
          kind: "string"
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
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 295
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
      line: 323
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 323
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 323
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 324
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 324
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 324
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 324
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
      line: 339
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 339
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 340
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
            line: 341
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 342
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 342
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 342
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
      line: 356
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 356
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 357
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
            line: 358
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 359
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 360
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 361
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 361
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 361
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
      line: 376
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 376
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 377
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
            line: 378
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 379
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 380
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 381
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 381
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 381
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
      line: 396
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 396
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 397
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
            line: 398
          },
          kind: "string"
        }
      }, {
        name: "startOffset",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 399
          },
          kind: "number"
        }
      }, {
        name: "endOffset",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 400
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 401
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 401
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 401
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
      line: 421
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 421
      },
      kind: "function",
      argumentTypes: [{
        name: "rootDirectory",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 421
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 421
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 421
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
      line: 430
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 430
      },
      kind: "function",
      argumentTypes: [{
        name: "fileUri",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 430
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 430
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 430
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