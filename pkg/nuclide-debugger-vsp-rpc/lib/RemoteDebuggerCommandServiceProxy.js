"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.observeRemoteDebugCommands = function () {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [])).switchMap(args => {
      return _client.callRemoteFunction("RemoteDebuggerCommandService/observeRemoteDebugCommands", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "RemoteDebugCommandRequest"
      });
    }).publish();
  };

  remoteModule.observeAttachDebugTargets = function () {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [])).switchMap(args => {
      return _client.callRemoteFunction("RemoteDebuggerCommandService/observeAttachDebugTargets", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "named",
          name: "PythonDebuggerAttachTarget"
        }
      });
    }).publish();
  };

  remoteModule.getAdapterExecutableInfo = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "adapterType",
      type: {
        kind: "named",
        name: "Adapter"
      }
    }]).then(args => {
      return _client.callRemoteFunction("RemoteDebuggerCommandService/getAdapterExecutableInfo", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "VSAdapterExecutableInfo"
      });
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
    VSAdapterExecutableInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 26
      },
      name: "VSAdapterExecutableInfo",
      definition: {
        kind: "object",
        fields: [{
          name: "command",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "args",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    PythonDebuggerAttachTarget: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "RemoteDebuggerCommandService.js",
        line: 33
      },
      name: "PythonDebuggerAttachTarget",
      definition: {
        kind: "object",
        fields: [{
          name: "port",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "localRoot",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "remoteRoot",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "debugOptions",
          type: {
            kind: "nullable",
            type: {
              kind: "array",
              type: {
                kind: "string"
              }
            }
          },
          optional: false
        }, {
          name: "id",
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
    RemoteDebugCommandRequest: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "RemoteDebuggerCommandService.js",
        line: 27
      },
      name: "RemoteDebugCommandRequest",
      definition: {
        kind: "object",
        fields: [{
          name: "type",
          type: {
            kind: "string-literal",
            value: "python"
          },
          optional: false
        }, {
          name: "command",
          type: {
            kind: "string-literal",
            value: "attach"
          },
          optional: false
        }, {
          name: "target",
          type: {
            kind: "named",
            name: "PythonDebuggerAttachTarget"
          },
          optional: false
        }]
      }
    },
    observeRemoteDebugCommands: {
      kind: "function",
      name: "observeRemoteDebugCommands",
      location: {
        type: "source",
        fileName: "RemoteDebuggerCommandService.js",
        line: 45
      },
      type: {
        location: {
          type: "source",
          fileName: "RemoteDebuggerCommandService.js",
          line: 45
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "RemoteDebugCommandRequest"
          }
        }
      }
    },
    observeAttachDebugTargets: {
      kind: "function",
      name: "observeAttachDebugTargets",
      location: {
        type: "source",
        fileName: "RemoteDebuggerCommandService.js",
        line: 57
      },
      type: {
        location: {
          type: "source",
          fileName: "RemoteDebuggerCommandService.js",
          line: 57
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "observable",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "PythonDebuggerAttachTarget"
            }
          }
        }
      }
    },
    Adapter: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "main.js",
        line: 17
      },
      name: "Adapter",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "node"
        }, {
          kind: "string-literal",
          value: "python"
        }, {
          kind: "string-literal",
          value: "prepack"
        }, {
          kind: "string-literal",
          value: "react-native"
        }, {
          kind: "string-literal",
          value: "ocaml"
        }]
      }
    },
    getAdapterExecutableInfo: {
      kind: "function",
      name: "getAdapterExecutableInfo",
      location: {
        type: "source",
        fileName: "RemoteDebuggerCommandService.js",
        line: 169
      },
      type: {
        location: {
          type: "source",
          fileName: "RemoteDebuggerCommandService.js",
          line: 169
        },
        kind: "function",
        argumentTypes: [{
          name: "adapterType",
          type: {
            kind: "named",
            name: "Adapter"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "VSAdapterExecutableInfo"
          }
        }
      }
    }
  }
});