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
          line: 127
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
          line: 128
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 128
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
          line: 129
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 129
          },
          kind: "named",
          name: "HackDiagnosticsResult"
        }
      });
    });
  };

  remoteModule.getCompletions = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "file",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 161
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
          line: 162
        },
        kind: "string"
      }
    }, {
      name: "offset",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 163
        },
        kind: "number"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 164
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 165
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("HackService/getCompletions", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
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
          line: 198
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
          line: 199
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 200
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 201
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
          line: 202
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 202
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
          line: 232
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
          line: 233
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 234
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 235
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
          line: 236
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 236
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
          line: 248
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
          line: 249
        },
        kind: "string"
      }
    }, {
      name: "useIdeConnection",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 250
        },
        kind: "boolean"
      }
    }, {
      name: "logLevel",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 251
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
          line: 252
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 252
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 252
            },
            name: "hackRoot",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 252
              },
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 252
            },
            name: "hackCommand",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 252
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
          line: 263
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
          line: 264
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
          line: 265
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 265
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
          line: 293
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
          line: 294
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 294
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 294
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
          line: 306
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
          line: 307
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
          line: 308
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 308
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
          line: 320
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
          line: 321
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 322
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 323
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
          line: 324
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 324
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
          line: 336
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
          line: 337
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 338
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 339
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
          line: 340
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 340
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
          line: 352
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
          line: 353
        },
        kind: "string"
      }
    }, {
      name: "startOffset",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 354
        },
        kind: "number"
      }
    }, {
      name: "endOffset",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 355
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
          line: 356
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 356
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
          line: 372
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
          line: 372
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
          line: 381
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
          line: 381
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
      line: 33
    },
    name: "SymbolTypeValue",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 33
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 33
        },
        kind: "number-literal",
        value: 0
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 33
        },
        kind: "number-literal",
        value: 1
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 33
        },
        kind: "number-literal",
        value: 2
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 33
        },
        kind: "number-literal",
        value: 3
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 33
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
      line: 35
    },
    name: "HackDiagnosticsResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 35
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 35
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 35
          },
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 35
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
  }], ["HackSpan", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HackService.js",
      line: 54
    },
    name: "HackSpan",
    definition: {
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
          line: 55
        },
        name: "filename",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 55
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 56
        },
        name: "line_start",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 56
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 57
        },
        name: "char_start",
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
        name: "line_end",
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
        name: "char_end",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 59
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
      line: 63
    },
    name: "HackCompletionsResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 63
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 63
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
      line: 65
    },
    name: "HackReferencesResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 65
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 65
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
      line: 67
    },
    name: "HackSearchPosition",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 67
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 68
        },
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 68
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 69
        },
        name: "line",
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
        name: "column",
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
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 71
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 72
        },
        name: "length",
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
        name: "scope",
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
        name: "additionalInfo",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 74
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
      line: 77
    },
    name: "HackReference",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 77
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 78
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 78
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 79
        },
        name: "filename",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 79
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 80
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 80
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 81
        },
        name: "char_start",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 81
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 82
        },
        name: "char_end",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 82
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
      line: 85
    },
    name: "HackTypedRegion",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 85
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 86
        },
        name: "color",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 86
          },
          kind: "union",
          types: [{
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 86
            },
            kind: "string-literal",
            value: "default"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 86
            },
            kind: "string-literal",
            value: "checked"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 86
            },
            kind: "string-literal",
            value: "partial"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 86
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
          line: 87
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 87
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
      line: 90
    },
    name: "HackIdeOutlineItem",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 90
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 91
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 91
          },
          kind: "union",
          types: [{
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 91
            },
            kind: "string-literal",
            value: "function"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 91
            },
            kind: "string-literal",
            value: "class"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 91
            },
            kind: "string-literal",
            value: "property"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 91
            },
            kind: "string-literal",
            value: "method"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 91
            },
            kind: "string-literal",
            value: "const"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 92
            },
            kind: "string-literal",
            value: "enum"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 92
            },
            kind: "string-literal",
            value: "typeconst"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 92
            },
            kind: "string-literal",
            value: "param"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 92
            },
            kind: "string-literal",
            value: "trait"
          }, {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 92
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
        name: "position",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 94
          },
          kind: "named",
          name: "HackRange"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 95
        },
        name: "span",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 95
          },
          kind: "named",
          name: "HackSpan"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 96
        },
        name: "modifiers",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 96
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 96
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 96
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
          line: 97
        },
        name: "children",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 97
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 97
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
          line: 98
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 98
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 98
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
          line: 99
        },
        name: "docblock",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 99
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
      line: 102
    },
    name: "HackIdeOutline",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 102
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 102
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
      line: 104
    },
    name: "HackTypeAtPosResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 104
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 105
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 105
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 105
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 106
        },
        name: "pos",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 106
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 106
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
      line: 109
    },
    name: "HackHighlightRefsResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 109
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 109
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
      line: 111
    },
    name: "HackFormatSourceResult",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 111
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 112
        },
        name: "error_message",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 112
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 113
        },
        name: "result",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 113
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 114
        },
        name: "internal_error",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 114
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
      line: 117
    },
    name: "HackDefinition",
    definition: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 117
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 118
        },
        name: "definition_pos",
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
            name: "HackRange"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 119
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 119
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 120
        },
        name: "pos",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 120
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
      line: 126
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 126
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 127
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
            line: 128
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 128
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 129
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 129
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 129
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
      line: 160
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 160
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 161
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
            line: 162
          },
          kind: "string"
        }
      }, {
        name: "offset",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 163
          },
          kind: "number"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 164
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 165
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 166
        },
        kind: "promise",
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
      line: 197
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 197
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 198
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
            line: 199
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 200
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 201
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 202
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 202
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 202
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
      line: 231
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 231
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 232
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
            line: 233
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 234
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 235
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 236
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 236
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 236
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
      line: 247
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 247
      },
      kind: "function",
      argumentTypes: [{
        name: "localFile",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 248
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
            line: 249
          },
          kind: "string"
        }
      }, {
        name: "useIdeConnection",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 250
          },
          kind: "boolean"
        }
      }, {
        name: "logLevel",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 251
          },
          kind: "named",
          name: "LogLevel"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 252
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 252
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 252
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 252
              },
              name: "hackRoot",
              type: {
                location: {
                  type: "source",
                  fileName: "HackService.js",
                  line: 252
                },
                kind: "named",
                name: "NuclideUri"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 252
              },
              name: "hackCommand",
              type: {
                location: {
                  type: "source",
                  fileName: "HackService.js",
                  line: 252
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
      line: 262
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 262
      },
      kind: "function",
      argumentTypes: [{
        name: "rootDirectory",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 263
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
            line: 264
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 265
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 265
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 265
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
      line: 293
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 293
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 293
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 294
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 294
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 294
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HackService.js",
                line: 294
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
      line: 305
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 305
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 306
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
            line: 307
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 308
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 308
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 308
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
      line: 319
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 319
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 320
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
            line: 321
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 322
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 323
          },
          kind: "number"
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
      line: 335
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 335
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 336
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
            line: 337
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 338
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 339
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 340
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 340
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 340
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
      line: 351
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 351
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 352
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
            line: 353
          },
          kind: "string"
        }
      }, {
        name: "startOffset",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 354
          },
          kind: "number"
        }
      }, {
        name: "endOffset",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 355
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 356
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 356
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HackService.js",
              line: 356
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
      line: 372
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 372
      },
      kind: "function",
      argumentTypes: [{
        name: "rootDirectory",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 372
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HackService.js",
          line: 372
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 372
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
      line: 381
    },
    type: {
      location: {
        type: "source",
        fileName: "HackService.js",
        line: 381
      },
      kind: "function",
      argumentTypes: [{
        name: "fileUri",
        type: {
          location: {
            type: "source",
            fileName: "HackService.js",
            line: 381
          },
          kind: "named",
          name: "NuclideUri"
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