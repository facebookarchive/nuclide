"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getPortForJavaDebugger = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("JavaDebuggerHelpersService/getPortForJavaDebugger", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "number"
      });
    });
  };

  remoteModule.getJavaVSAdapterExecutableInfo = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "debug",
      type: {
        kind: "boolean"
      }
    }]).then(args => {
      return _client.callRemoteFunction("JavaDebuggerHelpersService/getJavaVSAdapterExecutableInfo", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "VSAdapterExecutableInfo"
      });
    });
  };

  remoteModule.prepareForTerminalLaunch = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "launchInfo",
      type: {
        kind: "named",
        name: "JavaLaunchTargetInfo"
      }
    }]).then(args => {
      return _client.callRemoteFunction("JavaDebuggerHelpersService/prepareForTerminalLaunch", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "TerminalLaunchInfo"
      });
    });
  };

  remoteModule.javaDebugWaitForJdwpProcessStart = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "jvmSuspendArgs",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("JavaDebuggerHelpersService/javaDebugWaitForJdwpProcessStart", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.javaDebugWaitForJdwpProcessExit = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "jvmSuspendArgs",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("JavaDebuggerHelpersService/javaDebugWaitForJdwpProcessExit", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
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
    JavaLaunchTargetInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JavaDebuggerHelpersService.js",
        line: 23
      },
      name: "JavaLaunchTargetInfo",
      definition: {
        kind: "object",
        fields: [{
          name: "debugMode",
          type: {
            kind: "string-literal",
            value: "launch"
          },
          optional: false
        }, {
          name: "commandLine",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "classPath",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "runArgs",
          type: {
            kind: "nullable",
            type: {
              kind: "array",
              type: {
                kind: "string"
              }
            }
          },
          optional: true
        }]
      }
    },
    JavaAttachPortTargetInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JavaDebuggerHelpersService.js",
        line: 30
      },
      name: "JavaAttachPortTargetInfo",
      definition: {
        kind: "object",
        fields: [{
          name: "debugMode",
          type: {
            kind: "string-literal",
            value: "attach"
          },
          optional: false
        }, {
          name: "machineName",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "port",
          type: {
            kind: "number"
          },
          optional: false
        }]
      }
    },
    JavaTargetInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JavaDebuggerHelpersService.js",
        line: 36
      },
      name: "JavaTargetInfo",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "debugMode",
            type: {
              kind: "string-literal",
              value: "launch"
            },
            optional: false
          }, {
            name: "commandLine",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "classPath",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "runArgs",
            type: {
              kind: "nullable",
              type: {
                kind: "array",
                type: {
                  kind: "string"
                }
              }
            },
            optional: true
          }]
        }, {
          kind: "object",
          fields: [{
            name: "debugMode",
            type: {
              kind: "string-literal",
              value: "attach"
            },
            optional: false
          }, {
            name: "machineName",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "port",
            type: {
              kind: "number"
            },
            optional: false
          }]
        }],
        discriminantField: "debugMode"
      }
    },
    TerminalLaunchInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JavaDebuggerHelpersService.js",
        line: 38
      },
      name: "TerminalLaunchInfo",
      definition: {
        kind: "object",
        fields: [{
          name: "launchCommand",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "launchCwd",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "targetExecutable",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "launchArgs",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "attachPort",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "attachHost",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    getPortForJavaDebugger: {
      kind: "function",
      name: "getPortForJavaDebugger",
      location: {
        type: "source",
        fileName: "JavaDebuggerHelpersService.js",
        line: 49
      },
      type: {
        location: {
          type: "source",
          fileName: "JavaDebuggerHelpersService.js",
          line: 49
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "number"
          }
        }
      }
    },
    VSAdapterExecutableInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 32
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
    getJavaVSAdapterExecutableInfo: {
      kind: "function",
      name: "getJavaVSAdapterExecutableInfo",
      location: {
        type: "source",
        fileName: "JavaDebuggerHelpersService.js",
        line: 53
      },
      type: {
        location: {
          type: "source",
          fileName: "JavaDebuggerHelpersService.js",
          line: 53
        },
        kind: "function",
        argumentTypes: [{
          name: "debug",
          type: {
            kind: "boolean"
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
    },
    prepareForTerminalLaunch: {
      kind: "function",
      name: "prepareForTerminalLaunch",
      location: {
        type: "source",
        fileName: "JavaDebuggerHelpersService.js",
        line: 62
      },
      type: {
        location: {
          type: "source",
          fileName: "JavaDebuggerHelpersService.js",
          line: 62
        },
        kind: "function",
        argumentTypes: [{
          name: "launchInfo",
          type: {
            kind: "named",
            name: "JavaLaunchTargetInfo"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "TerminalLaunchInfo"
          }
        }
      }
    },
    javaDebugWaitForJdwpProcessStart: {
      kind: "function",
      name: "javaDebugWaitForJdwpProcessStart",
      location: {
        type: "source",
        fileName: "JavaDebuggerHelpersService.js",
        line: 90
      },
      type: {
        location: {
          type: "source",
          fileName: "JavaDebuggerHelpersService.js",
          line: 90
        },
        kind: "function",
        argumentTypes: [{
          name: "jvmSuspendArgs",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    javaDebugWaitForJdwpProcessExit: {
      kind: "function",
      name: "javaDebugWaitForJdwpProcessExit",
      location: {
        type: "source",
        fileName: "JavaDebuggerHelpersService.js",
        line: 110
      },
      type: {
        location: {
          type: "source",
          fileName: "JavaDebuggerHelpersService.js",
          line: 110
        },
        kind: "function",
        argumentTypes: [{
          name: "jvmSuspendArgs",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    }
  }
});