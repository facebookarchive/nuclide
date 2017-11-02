"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};
  remoteModule.Pty = class {
    resize(arg0, arg1) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "columns",
        type: {
          kind: "number"
        }
      }, {
        name: "rows",
        type: {
          kind: "number"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 25
        },
        name: "Pty"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "resize", "void", args));
    }

    writeInput(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "data",
        type: {
          kind: "string"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 25
        },
        name: "Pty"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "writeInput", "void", args));
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  remoteModule.PtyClient = class {
    onOutput(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "data",
        type: {
          kind: "string"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 19
        },
        name: "PtyClient"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "onOutput", "void", args));
    }

    onExit(arg0, arg1) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "code",
        type: {
          kind: "number"
        }
      }, {
        name: "signal",
        type: {
          kind: "number"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 19
        },
        name: "PtyClient"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "onExit", "void", args));
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };

  remoteModule.spawn = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
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
    }]).then(args => {
      return _client.callRemoteFunction("PtyService/spawn", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "Pty"
      });
    });
  };

  remoteModule.PtyImplementation = class {
    constructor(arg0, arg1, arg2, arg3) {
      _client.createRemoteObject("PtyImplementation", this, [arg0, arg1, arg2, arg3], [{
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
      }, {
        name: "command",
        type: {
          kind: "named",
          name: "Command"
        }
      }, {
        name: "env",
        type: {
          kind: "named",
          name: "Object"
        }
      }]);
    }

    resize(arg0, arg1) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "columns",
        type: {
          kind: "number"
        }
      }, {
        name: "rows",
        type: {
          kind: "number"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "PtyService.js",
          line: 84
        },
        name: "PtyImplementation"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "resize", "void", args));
    }

    writeInput(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "data",
        type: {
          kind: "string"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "PtyService.js",
          line: 84
        },
        name: "PtyImplementation"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "writeInput", "void", args));
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
    Pty: {
      kind: "interface",
      name: "Pty",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 25
      },
      constructorArgs: null,
      staticMethods: {},
      instanceMethods: {
        resize: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 26
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
            line: 27
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
            line: 28
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
        line: 31
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
        line: 12
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
        line: 19
      },
      constructorArgs: null,
      staticMethods: {},
      instanceMethods: {
        onOutput: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 20
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
            line: 21
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
            line: 22
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
        line: 25
      },
      type: {
        location: {
          type: "source",
          fileName: "PtyService.js",
          line: 25
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
    PtyImplementation: {
      kind: "interface",
      name: "PtyImplementation",
      location: {
        type: "source",
        fileName: "PtyService.js",
        line: 84
      },
      constructorArgs: [{
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
      }, {
        name: "command",
        type: {
          kind: "named",
          name: "Command"
        }
      }, {
        name: "env",
        type: {
          kind: "named",
          name: "Object"
        }
      }],
      staticMethods: {},
      instanceMethods: {
        dispose: {
          location: {
            type: "source",
            fileName: "PtyService.js",
            line: 141
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
            line: 145
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
            line: 151
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