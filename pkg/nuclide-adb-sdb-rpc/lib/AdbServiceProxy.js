"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.registerAdbPath = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "id",
      type: {
        kind: "string"
      }
    }, {
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "priority",
      type: {
        kind: "nullable",
        type: {
          kind: "number"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/registerAdbPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.getFullConfig = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("AdbService/getFullConfig", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "DebugBridgeFullConfig"
      });
    });
  };

  remoteModule.registerCustomPath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "nullable",
        type: {
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/registerCustomPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.getDeviceInfo = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/getDeviceInfo", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "map",
        keyType: {
          kind: "string"
        },
        valueType: {
          kind: "string"
        }
      });
    }).publish();
  };

  remoteModule.getProcesses = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/getProcesses", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "named",
          name: "Process"
        }
      });
    }).publish();
  };

  remoteModule.stopPackage = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/stopPackage", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.getDeviceList = function () {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("AdbService/getDeviceList", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "named",
          name: "DeviceDescription"
        }
      });
    }).publish();
  };

  remoteModule.getPidFromPackageName = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/getPidFromPackageName", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "number"
      });
    });
  };

  remoteModule.installPackage = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "string"
      }
    }, {
      name: "packagePath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/installPackage", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.uninstallPackage = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/uninstallPackage", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.forwardJdwpPortToPid = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "string"
      }
    }, {
      name: "tcpPort",
      type: {
        kind: "number"
      }
    }, {
      name: "pid",
      type: {
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/forwardJdwpPortToPid", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    });
  };

  remoteModule.launchActivity = function (arg0, arg1, arg2, arg3, arg4, arg5) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        kind: "string"
      }
    }, {
      name: "activity",
      type: {
        kind: "string"
      }
    }, {
      name: "debug",
      type: {
        kind: "boolean"
      }
    }, {
      name: "action",
      type: {
        kind: "nullable",
        type: {
          kind: "string"
        }
      }
    }, {
      name: "parameters",
      type: {
        kind: "nullable",
        type: {
          kind: "map",
          keyType: {
            kind: "string"
          },
          valueType: {
            kind: "string"
          }
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/launchActivity", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    });
  };

  remoteModule.launchMainActivity = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        kind: "string"
      }
    }, {
      name: "debug",
      type: {
        kind: "boolean"
      }
    }, {
      name: "parameters",
      type: {
        kind: "nullable",
        type: {
          kind: "map",
          keyType: {
            kind: "string"
          },
          valueType: {
            kind: "string"
          }
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/launchMainActivity", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    });
  };

  remoteModule.activityExists = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "string"
      }
    }, {
      name: "packageName",
      type: {
        kind: "string"
      }
    }, {
      name: "activity",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/activityExists", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "boolean"
      });
    });
  };

  remoteModule.getJavaProcesses = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/getJavaProcesses", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "named",
          name: "AndroidJavaProcess"
        }
      });
    }).publish();
  };

  remoteModule.dumpsysPackage = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "string"
      }
    }, {
      name: "identifier",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/dumpsysPackage", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "string"
        }
      });
    });
  };

  remoteModule.touchFile = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "string"
      }
    }, {
      name: "path",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/touchFile", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    });
  };

  remoteModule.removeFile = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "string"
      }
    }, {
      name: "path",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/removeFile", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    });
  };

  remoteModule.getInstalledPackages = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/getInstalledPackages", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "string"
        }
      });
    });
  };

  remoteModule.setAdbPort = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "port",
      type: {
        kind: "nullable",
        type: {
          kind: "number"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("AdbService/setAdbPort", "void", args);
    });
  };

  remoteModule.getAdbPort = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("AdbService/getAdbPort", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "number"
        }
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
    registerAdbPath: {
      kind: "function",
      name: "registerAdbPath",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 29
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 29
        },
        kind: "function",
        argumentTypes: [{
          name: "id",
          type: {
            kind: "string"
          }
        }, {
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "priority",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
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
    DebugBridgeFullConfig: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 40
      },
      name: "DebugBridgeFullConfig",
      definition: {
        kind: "object",
        fields: [{
          name: "active",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "all",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "port",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          },
          optional: false
        }]
      }
    },
    getFullConfig: {
      kind: "function",
      name: "getFullConfig",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 37
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 37
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "DebugBridgeFullConfig"
          }
        }
      }
    },
    registerCustomPath: {
      kind: "function",
      name: "registerCustomPath",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 41
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 41
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
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
    getDeviceInfo: {
      kind: "function",
      name: "getDeviceInfo",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 45
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 45
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "map",
            keyType: {
              kind: "string"
            },
            valueType: {
              kind: "string"
            }
          }
        }
      }
    },
    Process: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 29
      },
      name: "Process",
      definition: {
        kind: "object",
        fields: [{
          name: "user",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "pid",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "name",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "cpuUsage",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          },
          optional: false
        }, {
          name: "memUsage",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          },
          optional: false
        }, {
          name: "isJava",
          type: {
            kind: "boolean"
          },
          optional: false
        }]
      }
    },
    getProcesses: {
      kind: "function",
      name: "getProcesses",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 51
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 51
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "Process"
            }
          }
        }
      }
    },
    stopPackage: {
      kind: "function",
      name: "stopPackage",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 57
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 57
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "string"
          }
        }, {
          name: "packageName",
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
    DeviceDescription: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 22
      },
      name: "DeviceDescription",
      definition: {
        kind: "object",
        fields: [{
          name: "name",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "architecture",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "apiVersion",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "model",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    getDeviceList: {
      kind: "function",
      name: "getDeviceList",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 64
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 64
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "observable",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "DeviceDescription"
            }
          }
        }
      }
    },
    getPidFromPackageName: {
      kind: "function",
      name: "getPidFromPackageName",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 70
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 70
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "number"
          }
        }
      }
    },
    ProcessExitMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 584
      },
      name: "ProcessExitMessage",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          name: "exitCode",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          },
          optional: false
        }, {
          name: "signal",
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
    ProcessMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 590
      },
      name: "ProcessMessage",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            name: "data",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            name: "data",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            name: "exitCode",
            type: {
              kind: "nullable",
              type: {
                kind: "number"
              }
            },
            optional: false
          }, {
            name: "signal",
            type: {
              kind: "nullable",
              type: {
                kind: "string"
              }
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    LegacyProcessMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 603
      },
      name: "LegacyProcessMessage",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            name: "data",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            name: "data",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            name: "exitCode",
            type: {
              kind: "nullable",
              type: {
                kind: "number"
              }
            },
            optional: false
          }, {
            name: "signal",
            type: {
              kind: "nullable",
              type: {
                kind: "string"
              }
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            name: "error",
            type: {
              kind: "named",
              name: "Object"
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    installPackage: {
      kind: "function",
      name: "installPackage",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 77
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 77
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "string"
          }
        }, {
          name: "packagePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "LegacyProcessMessage"
          }
        }
      }
    },
    uninstallPackage: {
      kind: "function",
      name: "uninstallPackage",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 85
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 85
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "LegacyProcessMessage"
          }
        }
      }
    },
    forwardJdwpPortToPid: {
      kind: "function",
      name: "forwardJdwpPortToPid",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 93
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 93
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "string"
          }
        }, {
          name: "tcpPort",
          type: {
            kind: "number"
          }
        }, {
          name: "pid",
          type: {
            kind: "number"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "string"
          }
        }
      }
    },
    launchActivity: {
      kind: "function",
      name: "launchActivity",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 101
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 101
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            kind: "string"
          }
        }, {
          name: "activity",
          type: {
            kind: "string"
          }
        }, {
          name: "debug",
          type: {
            kind: "boolean"
          }
        }, {
          name: "action",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          }
        }, {
          name: "parameters",
          type: {
            kind: "nullable",
            type: {
              kind: "map",
              keyType: {
                kind: "string"
              },
              valueType: {
                kind: "string"
              }
            }
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "string"
          }
        }
      }
    },
    launchMainActivity: {
      kind: "function",
      name: "launchMainActivity",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 118
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 118
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            kind: "string"
          }
        }, {
          name: "debug",
          type: {
            kind: "boolean"
          }
        }, {
          name: "parameters",
          type: {
            kind: "nullable",
            type: {
              kind: "map",
              keyType: {
                kind: "string"
              },
              valueType: {
                kind: "string"
              }
            }
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "string"
          }
        }
      }
    },
    activityExists: {
      kind: "function",
      name: "activityExists",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 127
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 127
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "string"
          }
        }, {
          name: "packageName",
          type: {
            kind: "string"
          }
        }, {
          name: "activity",
          type: {
            kind: "string"
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
    SimpleProcess: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 12
      },
      name: "SimpleProcess",
      definition: {
        kind: "object",
        fields: [{
          name: "user",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "pid",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "name",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    AndroidJavaProcess: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 18
      },
      name: "AndroidJavaProcess",
      definition: {
        kind: "named",
        name: "SimpleProcess"
      }
    },
    getJavaProcesses: {
      kind: "function",
      name: "getJavaProcesses",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 135
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 135
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "AndroidJavaProcess"
            }
          }
        }
      }
    },
    dumpsysPackage: {
      kind: "function",
      name: "dumpsysPackage",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 141
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 141
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "string"
          }
        }, {
          name: "identifier",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          }
        }
      }
    },
    touchFile: {
      kind: "function",
      name: "touchFile",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 148
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 148
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "string"
          }
        }, {
          name: "path",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "string"
          }
        }
      }
    },
    removeFile: {
      kind: "function",
      name: "removeFile",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 152
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 152
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "string"
          }
        }, {
          name: "path",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "string"
          }
        }
      }
    },
    getInstalledPackages: {
      kind: "function",
      name: "getInstalledPackages",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 159
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 159
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }
      }
    },
    setAdbPort: {
      kind: "function",
      name: "setAdbPort",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 165
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 165
        },
        kind: "function",
        argumentTypes: [{
          name: "port",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          }
        }],
        returnType: {
          kind: "void"
        }
      }
    },
    getAdbPort: {
      kind: "function",
      name: "getAdbPort",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 169
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 169
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          }
        }
      }
    }
  }
});