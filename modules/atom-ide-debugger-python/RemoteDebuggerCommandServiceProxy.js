"use strict";

module.exports = _client => {
  const remoteModule = {};

  remoteModule.observeRemoteDebugCommands = function () {
    return _client.callRemoteFunction("RemoteDebuggerCommandService/observeRemoteDebugCommands", "observable", _client.marshalArguments(Array.from(arguments), [])).map(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "RemoteDebugCommandRequest"
      });
    }).publish();
  };

  remoteModule.observeAttachDebugTargets = function () {
    return _client.callRemoteFunction("RemoteDebuggerCommandService/observeAttachDebugTargets", "observable", _client.marshalArguments(Array.from(arguments), [])).map(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "named",
          name: "PythonDebuggerAttachTarget"
        }
      });
    }).publish();
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
    PythonDebuggerAttachTarget: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "RemoteDebuggerCommandService.js",
        line: 29
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
        line: 23
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
        line: 41
      },
      type: {
        location: {
          type: "source",
          fileName: "RemoteDebuggerCommandService.js",
          line: 41
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
        line: 53
      },
      type: {
        location: {
          type: "source",
          fileName: "RemoteDebuggerCommandService.js",
          line: 53
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
    }
  }
});