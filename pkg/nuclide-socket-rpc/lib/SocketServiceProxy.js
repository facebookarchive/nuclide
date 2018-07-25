"use strict";

module.exports = _client => {
  const remoteModule = {};
  remoteModule.Connection = class {
    constructor() {
      throw Error("constructors are not supported for remote objects");
    }

    write(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "Connection.js",
          line: 23
        },
        name: "Connection"
      }), "write", "void", _client.marshalArguments(Array.from(arguments), [{
        name: "msg",
        type: {
          kind: "named",
          name: "Buffer"
        }
      }]));
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  remoteModule.IRemoteSocket = class {
    constructor() {
      throw Error("constructors are not supported for remote objects");
    }

    write(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "types.js",
          line: 20
        },
        name: "IRemoteSocket"
      }), "write", "void", _client.marshalArguments(Array.from(arguments), [{
        name: "msg",
        type: {
          kind: "named",
          name: "Buffer"
        }
      }]));
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  remoteModule.ConnectionFactory = class {
    constructor() {
      throw Error("constructors are not supported for remote objects");
    }

    createConnection(arg0, arg1) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "Connection.js",
          line: 88
        },
        name: "ConnectionFactory"
      }), "createConnection", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "tunnelHost",
        type: {
          kind: "named",
          name: "TunnelHost"
        }
      }, {
        name: "socket",
        type: {
          kind: "named",
          name: "IRemoteSocket"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "Connection"
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };

  remoteModule.getConnectionFactory = function () {
    return _client.callRemoteFunction("SocketService/getConnectionFactory", "promise", _client.marshalArguments(Array.from(arguments), [])).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "ConnectionFactory"
      });
    });
  };

  remoteModule.createTunnel = function (arg0, arg1) {
    return _client.callRemoteFunction("SocketService/createTunnel", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "t",
      type: {
        kind: "named",
        name: "ResolvedTunnel"
      }
    }, {
      name: "cf",
      type: {
        kind: "named",
        name: "ConnectionFactory"
      }
    }])).map(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "SocketEvent"
      });
    }).publish();
  };

  remoteModule.getAvailableServerPort = function () {
    return _client.callRemoteFunction("SocketService/getAvailableServerPort", "promise", _client.marshalArguments(Array.from(arguments), [])).then(value => {
      return _client.unmarshal(value, {
        kind: "number"
      });
    });
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
    Connection: {
      kind: "interface",
      name: "Connection",
      location: {
        type: "source",
        fileName: "Connection.js",
        line: 23
      },
      staticMethods: {},
      instanceMethods: {
        write: {
          location: {
            type: "source",
            fileName: "Connection.js",
            line: 76
          },
          kind: "function",
          argumentTypes: [{
            name: "msg",
            type: {
              kind: "named",
              name: "Buffer"
            }
          }],
          returnType: {
            kind: "void"
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "Connection.js",
            line: 80
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
      }
    },
    TunnelHost: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 47
      },
      name: "TunnelHost",
      definition: {
        kind: "object",
        fields: [{
          name: "host",
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
        }, {
          name: "family",
          type: {
            kind: "union",
            types: [{
              kind: "number-literal",
              value: 4
            }, {
              kind: "number-literal",
              value: 6
            }]
          },
          optional: false
        }]
      }
    },
    IRemoteSocket: {
      kind: "interface",
      name: "IRemoteSocket",
      location: {
        type: "source",
        fileName: "types.js",
        line: 20
      },
      staticMethods: {},
      instanceMethods: {
        write: {
          location: {
            type: "source",
            fileName: "types.js",
            line: 21
          },
          kind: "function",
          argumentTypes: [{
            name: "msg",
            type: {
              kind: "named",
              name: "Buffer"
            }
          }],
          returnType: {
            kind: "void"
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "types.js",
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
    ConnectionFactory: {
      kind: "interface",
      name: "ConnectionFactory",
      location: {
        type: "source",
        fileName: "Connection.js",
        line: 88
      },
      staticMethods: {},
      instanceMethods: {
        createConnection: {
          location: {
            type: "source",
            fileName: "Connection.js",
            line: 91
          },
          kind: "function",
          argumentTypes: [{
            name: "tunnelHost",
            type: {
              kind: "named",
              name: "TunnelHost"
            }
          }, {
            name: "socket",
            type: {
              kind: "named",
              name: "IRemoteSocket"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "named",
              name: "Connection"
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "Connection.js",
            line: 98
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
      }
    },
    getConnectionFactory: {
      kind: "function",
      name: "getConnectionFactory",
      location: {
        type: "source",
        fileName: "SocketService.js",
        line: 25
      },
      type: {
        location: {
          type: "source",
          fileName: "SocketService.js",
          line: 25
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "ConnectionFactory"
          }
        }
      }
    },
    SocketEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 12
      },
      name: "SocketEvent",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "server_started"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "client_connected"
            },
            optional: false
          }, {
            name: "clientPort",
            type: {
              kind: "number"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "client_disconnected"
            },
            optional: false
          }, {
            name: "clientPort",
            type: {
              kind: "number"
            },
            optional: false
          }]
        }],
        discriminantField: "type"
      }
    },
    ResolvedTunnel: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 53
      },
      name: "ResolvedTunnel",
      definition: {
        kind: "object",
        fields: [{
          name: "from",
          type: {
            kind: "named",
            name: "TunnelHost"
          },
          optional: false
        }, {
          name: "to",
          type: {
            kind: "named",
            name: "TunnelHost"
          },
          optional: false
        }]
      }
    },
    createTunnel: {
      kind: "function",
      name: "createTunnel",
      location: {
        type: "source",
        fileName: "SocketService.js",
        line: 29
      },
      type: {
        location: {
          type: "source",
          fileName: "SocketService.js",
          line: 29
        },
        kind: "function",
        argumentTypes: [{
          name: "t",
          type: {
            kind: "named",
            name: "ResolvedTunnel"
          }
        }, {
          name: "cf",
          type: {
            kind: "named",
            name: "ConnectionFactory"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "SocketEvent"
          }
        }
      }
    },
    getAvailableServerPort: {
      kind: "function",
      name: "getAvailableServerPort",
      location: {
        type: "source",
        fileName: "SocketService.js",
        line: 36
      },
      type: {
        location: {
          type: "source",
          fileName: "SocketService.js",
          line: 36
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
    }
  }
});