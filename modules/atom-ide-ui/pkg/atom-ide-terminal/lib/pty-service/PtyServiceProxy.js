"use strict";

module.exports = _client => {
  const remoteModule = {};
  remoteModule.Pty = class {
    constructor() {
      throw Error("constructors are not supported for remote objects");
    }

    resize(arg0, arg1) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 26
        },
        name: "Pty"
      }), "resize", "void", _client.marshalArguments(Array.from(arguments), [{
        name: "columns",
        type: {
          kind: "number"
        }
      }, {
        name: "rows",
        type: {
          kind: "number"
        }
      }]));
    }

    writeInput(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 26
        },
        name: "Pty"
      }), "writeInput", "void", _client.marshalArguments(Array.from(arguments), [{
        name: "data",
        type: {
          kind: "string"
        }
      }]));
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  remoteModule.PtyClient = class {
    constructor() {
      throw Error("constructors are not supported for remote objects");
    }

    onOutput(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 20
        },
        name: "PtyClient"
      }), "onOutput", "void", _client.marshalArguments(Array.from(arguments), [{
        name: "data",
        type: {
          kind: "string"
        }
      }]));
    }

    onExit(arg0, arg1) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 20
        },
        name: "PtyClient"
      }), "onExit", "void", _client.marshalArguments(Array.from(arguments), [{
        name: "code",
        type: {
          kind: "number"
        }
      }, {
        name: "signal",
        type: {
          kind: "number"
        }
      }]));
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };

  remoteModule.spawn = function (arg0, arg1) {
    return _client.callRemoteFunction("PtyService/spawn", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "info",
      type: {
        kind: "named",
        name: "PtyInfo"
      }
    }, {
      name: "client",
      type: {
        kind: "named",
        name: "PtyClient"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "Pty"
      });
    });
  };

  remoteModule.useTitleAsPath = function (arg0) {
    return _client.callRemoteFunction("PtyService/useTitleAsPath", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "client",
      type: {
        kind: "named",
        name: "PtyClient"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "boolean"
      });
    });
  };

  remoteModule.PtyImplementation = class {
    constructor() {
      throw Error("constructors are not supported for remote objects");
    }

    resize(arg0, arg1) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "PtyService.js",
          line: 151
        },
        name: "PtyImplementation"
      }), "resize", "void", _client.marshalArguments(Array.from(arguments), [{
        name: "columns",
        type: {
          kind: "number"
        }
      }, {
        name: "rows",
        type: {
          kind: "number"
        }
      }]));
    }

    writeInput(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "PtyService.js",
          line: 151
        },
        name: "PtyImplementation"
      }), "writeInput", "void", _client.marshalArguments(Array.from(arguments), [{
        name: "data",
        type: {
          kind: "string"
        }
      }]));
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

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
    Pty: {
      kind: "interface",
      name: "Pty",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 26
      },
      staticMethods: {},
      instanceMethods: {
        resize: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 27
          },
          kind: "function",
          argumentTypes: [{
            name: "columns",
            type: {
              kind: "number"
            }
          }, {
            name: "rows",
            type: {
              kind: "number"
            }
          }],
          returnType: {
            kind: "void"
          }
        },
        writeInput: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          kind: "function",
          argumentTypes: [{
            name: "data",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "void"
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 29
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
      }
    },
    Command: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 32
      },
      name: "Command",
      definition: {
        kind: "object",
        fields: [{
          name: "file",
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
    PtyInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 13
      },
      name: "PtyInfo",
      definition: {
        kind: "object",
        fields: [{
          name: "terminalType",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "environment",
          type: {
            kind: "map",
            keyType: {
              kind: "string"
            },
            valueType: {
              kind: "string"
            }
          },
          optional: true
        }, {
          name: "cwd",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "command",
          type: {
            kind: "named",
            name: "Command"
          },
          optional: true
        }]
      }
    },
    PtyClient: {
      kind: "interface",
      name: "PtyClient",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 20
      },
      staticMethods: {},
      instanceMethods: {
        onOutput: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 21
          },
          kind: "function",
          argumentTypes: [{
            name: "data",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "void"
          }
        },
        onExit: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          kind: "function",
          argumentTypes: [{
            name: "code",
            type: {
              kind: "number"
            }
          }, {
            name: "signal",
            type: {
              kind: "number"
            }
          }],
          returnType: {
            kind: "void"
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 23
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
      }
    },
    spawn: {
      kind: "function",
      name: "spawn",
      location: {
        type: "source",
        fileName: "PtyService.js",
        line: 30
      },
      type: {
        location: {
          type: "source",
          fileName: "PtyService.js",
          line: 30
        },
        kind: "function",
        argumentTypes: [{
          name: "info",
          type: {
            kind: "named",
            name: "PtyInfo"
          }
        }, {
          name: "client",
          type: {
            kind: "named",
            name: "PtyClient"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "Pty"
          }
        }
      }
    },
    useTitleAsPath: {
      kind: "function",
      name: "useTitleAsPath",
      location: {
        type: "source",
        fileName: "PtyService.js",
        line: 39
      },
      type: {
        location: {
          type: "source",
          fileName: "PtyService.js",
          line: 39
        },
        kind: "function",
        argumentTypes: [{
          name: "client",
          type: {
            kind: "named",
            name: "PtyClient"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "boolean"
          }
        }
      }
    },
    PtyImplementation: {
      kind: "interface",
      name: "PtyImplementation",
      location: {
        type: "source",
        fileName: "PtyService.js",
        line: 151
      },
      staticMethods: {},
      instanceMethods: {
        dispose: {
          location: {
            type: "source",
            fileName: "PtyService.js",
            line: 215
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        },
        resize: {
          location: {
            type: "source",
            fileName: "PtyService.js",
            line: 219
          },
          kind: "function",
          argumentTypes: [{
            name: "columns",
            type: {
              kind: "number"
            }
          }, {
            name: "rows",
            type: {
              kind: "number"
            }
          }],
          returnType: {
            kind: "void"
          }
        },
        writeInput: {
          location: {
            type: "source",
            fileName: "PtyService.js",
            line: 225
          },
          kind: "function",
          argumentTypes: [{
            name: "data",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "void"
          }
        }
      }
    }
  }
});