"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.didOpenFile = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filename",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "version",
      type: {
        kind: "number"
      }
    }, {
      name: "contents",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("didOpenFile", "void", args);
    });
  };

  remoteModule.didChangeFile = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filename",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "version",
      type: {
        kind: "number"
      }
    }, {
      name: "changes",
      type: {
        kind: "array",
        type: {
          kind: "named",
          name: "TextEdit"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("didChangeFile", "void", args);
    });
  };

  remoteModule.didCloseFile = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filename",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("didCloseFile", "void", args);
    });
  };

  remoteModule.didChangeWatchedFiles = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "changes",
      type: {
        kind: "array",
        type: {
          kind: "named",
          name: "FileEvent"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("didChangeWatchedFiles", "void", args);
    });
  };

  remoteModule.getCompletions = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filename",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "position",
      type: {
        kind: "named",
        name: "Position"
      }
    }]).then(args => {
      return _client.callRemoteFunction("getCompletions", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "named",
          name: "HackCompletion"
        }
      });
    });
  };

  remoteModule.notifyDiagnostics = function () {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [])).switchMap(args => {
      return _client.callRemoteFunction("notifyDiagnostics", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "HackDiagnosticsMessage"
      });
    }).publish();
  };

  remoteModule.disconnect = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("disconnect", "void", args);
    });
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
  }
});
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
    Position: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HackConnectionService.js",
        line: 17
      },
      name: "Position",
      definition: {
        kind: "object",
        fields: [{
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
        }]
      }
    },
    Range: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HackConnectionService.js",
        line: 24
      },
      name: "Range",
      definition: {
        kind: "object",
        fields: [{
          name: "start",
          type: {
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          name: "end",
          type: {
            kind: "named",
            name: "Position"
          },
          optional: false
        }]
      }
    },
    TextEdit: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HackConnectionService.js",
        line: 33
      },
      name: "TextEdit",
      definition: {
        kind: "object",
        fields: [{
          name: "range",
          type: {
            kind: "named",
            name: "Range"
          },
          optional: true
        }, {
          name: "text",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    didOpenFile: {
      kind: "function",
      name: "didOpenFile",
      location: {
        type: "source",
        fileName: "HackConnectionService.js",
        line: 41
      },
      type: {
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 41
        },
        kind: "function",
        argumentTypes: [{
          name: "filename",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "version",
          type: {
            kind: "number"
          }
        }, {
          name: "contents",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "void"
        }
      }
    },
    didChangeFile: {
      kind: "function",
      name: "didChangeFile",
      location: {
        type: "source",
        fileName: "HackConnectionService.js",
        line: 51
      },
      type: {
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 51
        },
        kind: "function",
        argumentTypes: [{
          name: "filename",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "version",
          type: {
            kind: "number"
          }
        }, {
          name: "changes",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "TextEdit"
            }
          }
        }],
        returnType: {
          kind: "void"
        }
      }
    },
    didCloseFile: {
      kind: "function",
      name: "didCloseFile",
      location: {
        type: "source",
        fileName: "HackConnectionService.js",
        line: 61
      },
      type: {
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 61
        },
        kind: "function",
        argumentTypes: [{
          name: "filename",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "void"
        }
      }
    },
    FileEventType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HackConnectionService.js",
        line: 74
      },
      name: "FileEventType",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "Created"
        }, {
          kind: "string-literal",
          value: "Changed"
        }, {
          kind: "string-literal",
          value: "Deleted"
        }, {
          kind: "string-literal",
          value: "Saved"
        }]
      }
    },
    FileEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HackConnectionService.js",
        line: 76
      },
      name: "FileEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "filename",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "type",
          type: {
            kind: "named",
            name: "FileEventType"
          },
          optional: false
        }]
      }
    },
    didChangeWatchedFiles: {
      kind: "function",
      name: "didChangeWatchedFiles",
      location: {
        type: "source",
        fileName: "HackConnectionService.js",
        line: 84
      },
      type: {
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 84
        },
        kind: "function",
        argumentTypes: [{
          name: "changes",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "FileEvent"
            }
          }
        }],
        returnType: {
          kind: "void"
        }
      }
    },
    HackRange: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 25
      },
      name: "HackRange",
      definition: {
        kind: "object",
        fields: [{
          name: "filename",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "line",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "char_start",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "char_end",
          type: {
            kind: "number"
          },
          optional: false
        }]
      }
    },
    HackParameterDetails: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 12
      },
      name: "HackParameterDetails",
      definition: {
        kind: "object",
        fields: [{
          name: "name",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "type",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "variadic",
          type: {
            kind: "boolean"
          },
          optional: false
        }]
      }
    },
    HackFunctionDetails: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 18
      },
      name: "HackFunctionDetails",
      definition: {
        kind: "object",
        fields: [{
          name: "min_arity",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "return_type",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "params",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "HackParameterDetails"
            }
          },
          optional: false
        }]
      }
    },
    HackCompletion: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 32
      },
      name: "HackCompletion",
      definition: {
        kind: "object",
        fields: [{
          name: "name",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "type",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "pos",
          type: {
            kind: "named",
            name: "HackRange"
          },
          optional: false
        }, {
          name: "func_details",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "HackFunctionDetails"
            }
          },
          optional: false
        }, {
          name: "expected_ty",
          type: {
            kind: "boolean"
          },
          optional: false
        }]
      }
    },
    getCompletions: {
      kind: "function",
      name: "getCompletions",
      location: {
        type: "source",
        fileName: "HackConnectionService.js",
        line: 88
      },
      type: {
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 88
        },
        kind: "function",
        argumentTypes: [{
          name: "filename",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "position",
          type: {
            kind: "named",
            name: "Position"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "HackCompletion"
            }
          }
        }
      }
    },
    SingleHackMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 55
      },
      name: "SingleHackMessage",
      definition: {
        kind: "object",
        fields: [{
          name: "path",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "descr",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "code",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "line",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "start",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "end",
          type: {
            kind: "number"
          },
          optional: false
        }]
      }
    },
    HackDiagnostic: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 53
      },
      name: "HackDiagnostic",
      definition: {
        kind: "array",
        type: {
          kind: "named",
          name: "SingleHackMessage"
        }
      }
    },
    HackDiagnosticsMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HackConnectionService.js",
        line: 95
      },
      name: "HackDiagnosticsMessage",
      definition: {
        kind: "object",
        fields: [{
          name: "filename",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "errors",
          type: {
            kind: "array",
            type: {
              kind: "object",
              fields: [{
                name: "message",
                type: {
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
    },
    notifyDiagnostics: {
      kind: "function",
      name: "notifyDiagnostics",
      location: {
        type: "source",
        fileName: "HackConnectionService.js",
        line: 102
      },
      type: {
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 102
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "HackDiagnosticsMessage"
          }
        }
      }
    },
    disconnect: {
      kind: "function",
      name: "disconnect",
      location: {
        type: "source",
        fileName: "HackConnectionService.js",
        line: 109
      },
      type: {
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 109
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "void"
        }
      }
    }
  }
});