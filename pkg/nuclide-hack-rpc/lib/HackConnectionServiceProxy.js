"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.didOpenFile = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filename",
      type: {
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 42
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "version",
      type: {
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 43
        },
        kind: "number"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 44
        },
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
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 52
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "version",
      type: {
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 53
        },
        kind: "number"
      }
    }, {
      name: "changes",
      type: {
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 54
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 54
          },
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
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 61
        },
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
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 84
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 84
          },
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
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 89
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "position",
      type: {
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 90
        },
        kind: "named",
        name: "Position"
      }
    }]).then(args => {
      return _client.callRemoteFunction("getCompletions", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 91
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 91
          },
          kind: "named",
          name: "HackCompletion"
        }
      });
    });
  };

  remoteModule.notifyDiagnostics = function () {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("notifyDiagnostics", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 103
        },
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
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 17
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 18
          },
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 18
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 19
          },
          name: "column",
          type: {
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 19
            },
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
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 24
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 25
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 25
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 26
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 26
            },
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
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 33
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 34
          },
          name: "range",
          type: {
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 34
            },
            kind: "named",
            name: "Range"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 35
          },
          name: "text",
          type: {
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 35
            },
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
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 42
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "version",
          type: {
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 43
            },
            kind: "number"
          }
        }, {
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 44
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 45
          },
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
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 52
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "version",
          type: {
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 53
            },
            kind: "number"
          }
        }, {
          name: "changes",
          type: {
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 54
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HackConnectionService.js",
                line: 54
              },
              kind: "named",
              name: "TextEdit"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 55
          },
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
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 61
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 61
          },
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
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 74
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 74
          },
          kind: "string-literal",
          value: "Created"
        }, {
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 74
          },
          kind: "string-literal",
          value: "Changed"
        }, {
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 74
          },
          kind: "string-literal",
          value: "Deleted"
        }, {
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 74
          },
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
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 76
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 77
          },
          name: "filename",
          type: {
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 77
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 78
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 78
            },
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
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 84
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HackConnectionService.js",
                line: 84
              },
              kind: "named",
              name: "FileEvent"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 84
          },
          kind: "void"
        }
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
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 89
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "position",
          type: {
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 90
            },
            kind: "named",
            name: "Position"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 91
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 91
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HackConnectionService.js",
                line: 91
              },
              kind: "named",
              name: "HackCompletion"
            }
          }
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
        location: {
          type: "source",
          fileName: "HackConnectionService.js",
          line: 95
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 96
          },
          name: "filename",
          type: {
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 96
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 97
          },
          name: "errors",
          type: {
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 97
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HackConnectionService.js",
                line: 97
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "HackConnectionService.js",
                  line: 98
                },
                name: "message",
                type: {
                  location: {
                    type: "source",
                    fileName: "HackConnectionService.js",
                    line: 98
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
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 102
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "HackConnectionService.js",
              line: 103
            },
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
          location: {
            type: "source",
            fileName: "HackConnectionService.js",
            line: 109
          },
          kind: "void"
        }
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
          name: "name",
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
          name: "type",
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
            line: 15
          },
          name: "variadic",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 15
            },
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
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 18
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 19
          },
          name: "min_arity",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 19
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 20
          },
          name: "return_type",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 20
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 21
          },
          name: "params",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 21
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 21
              },
              kind: "named",
              name: "HackParameterDetails"
            }
          },
          optional: false
        }]
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
          name: "filename",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 26
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 27
          },
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 27
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          name: "char_start",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 28
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 29
          },
          name: "char_end",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 29
            },
            kind: "number"
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
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 33
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 34
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 34
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 35
          },
          name: "pos",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 35
            },
            kind: "named",
            name: "HackRange"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 36
          },
          name: "func_details",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 36
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 36
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
            line: 37
          },
          name: "expected_ty",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 37
            },
            kind: "boolean"
          },
          optional: false
        }]
      }
    },
    HackCompletionsResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 40
      },
      name: "HackCompletionsResult",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 40
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 40
          },
          kind: "named",
          name: "HackCompletion"
        }
      }
    },
    HackDiagnosticsResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 42
      },
      name: "HackDiagnosticsResult",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 42
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 43
          },
          name: "errors",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 43
            },
            kind: "array",
            type: {
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
                name: "message",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 44
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
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 53
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 53
          },
          kind: "named",
          name: "SingleHackMessage"
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
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 55
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 56
          },
          name: "path",
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
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 57
          },
          name: "descr",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 57
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 58
          },
          name: "code",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 58
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 59
          },
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 59
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 60
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 60
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 61
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 61
            },
            kind: "number"
          },
          optional: false
        }]
      }
    }
  }
});