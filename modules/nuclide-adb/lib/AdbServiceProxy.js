"use strict";

module.exports = _client => {
  const remoteModule = {};

  remoteModule.registerAdbPath = function (arg0, arg1, arg2) {
    return _client.callRemoteFunction("AdbService/registerAdbPath", "promise", _client.marshalArguments(Array.from(arguments), [{
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
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.getFullConfig = function () {
    return _client.callRemoteFunction("AdbService/getFullConfig", "promise", _client.marshalArguments(Array.from(arguments), [])).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "DebugBridgeFullConfig"
      });
    });
  };

  remoteModule.registerCustomPath = function (arg0) {
    return _client.callRemoteFunction("AdbService/registerCustomPath", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "nullable",
        type: {
          kind: "string"
        }
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.getDeviceInfo = function (arg0) {
    return _client.callRemoteFunction("AdbService/getDeviceInfo", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }])).map(value => {
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

  remoteModule.getProcesses = function (arg0, arg1) {
    return _client.callRemoteFunction("AdbService/getProcesses", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }, {
      name: "timeout",
      type: {
        kind: "number"
      }
    }])).map(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "named",
          name: "Process"
        }
      });
    }).publish();
  };

  remoteModule.stopProcess = function (arg0, arg1, arg2) {
    return _client.callRemoteFunction("AdbService/stopProcess", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }, {
      name: "packageName",
      type: {
        kind: "string"
      }
    }, {
      name: "pid",
      type: {
        kind: "number"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.getDeviceList = function (arg0) {
    return _client.callRemoteFunction("AdbService/getDeviceList", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "options",
      type: {
        kind: "nullable",
        type: {
          kind: "named",
          name: "getDevicesOptions"
        }
      }
    }])).map(value => {
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
    return _client.callRemoteFunction("AdbService/getPidFromPackageName", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }, {
      name: "packageName",
      type: {
        kind: "string"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "number"
      });
    });
  };

  remoteModule.installPackage = function (arg0, arg1) {
    return _client.callRemoteFunction("AdbService/installPackage", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }, {
      name: "packagePath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).map(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.uninstallPackage = function (arg0, arg1) {
    return _client.callRemoteFunction("AdbService/uninstallPackage", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }, {
      name: "packageName",
      type: {
        kind: "string"
      }
    }])).map(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "LegacyProcessMessage"
      });
    }).publish();
  };

  remoteModule.forwardJdwpPortToPid = function (arg0, arg1, arg2) {
    return _client.callRemoteFunction("AdbService/forwardJdwpPortToPid", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
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
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "string"
        }
      });
    });
  };

  remoteModule.removeJdwpForwardSpec = function (arg0, arg1) {
    return _client.callRemoteFunction("AdbService/removeJdwpForwardSpec", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }, {
      name: "spec",
      type: {
        kind: "nullable",
        type: {
          kind: "string"
        }
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    });
  };

  remoteModule.launchActivity = function (arg0, arg1, arg2, arg3, arg4, arg5) {
    return _client.callRemoteFunction("AdbService/launchActivity", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
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
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    });
  };

  remoteModule.launchMainActivity = function (arg0, arg1, arg2) {
    return _client.callRemoteFunction("AdbService/launchMainActivity", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
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
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    });
  };

  remoteModule.launchService = function (arg0, arg1, arg2, arg3) {
    return _client.callRemoteFunction("AdbService/launchService", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }, {
      name: "packageName",
      type: {
        kind: "string"
      }
    }, {
      name: "serviceName",
      type: {
        kind: "string"
      }
    }, {
      name: "debug",
      type: {
        kind: "boolean"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    });
  };

  remoteModule.activityExists = function (arg0, arg1, arg2) {
    return _client.callRemoteFunction("AdbService/activityExists", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
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
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "boolean"
      });
    });
  };

  remoteModule.getAllAvailablePackages = function (arg0) {
    return _client.callRemoteFunction("AdbService/getAllAvailablePackages", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "string"
        }
      });
    });
  };

  remoteModule.getJavaProcesses = function (arg0) {
    return _client.callRemoteFunction("AdbService/getJavaProcesses", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }])).map(value => {
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
    return _client.callRemoteFunction("AdbService/dumpsysPackage", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }, {
      name: "identifier",
      type: {
        kind: "string"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "string"
        }
      });
    });
  };

  remoteModule.touchFile = function (arg0, arg1) {
    return _client.callRemoteFunction("AdbService/touchFile", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }, {
      name: "path",
      type: {
        kind: "string"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    });
  };

  remoteModule.removeFile = function (arg0, arg1) {
    return _client.callRemoteFunction("AdbService/removeFile", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }, {
      name: "path",
      type: {
        kind: "string"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    });
  };

  remoteModule.getInstalledPackages = function (arg0) {
    return _client.callRemoteFunction("AdbService/getInstalledPackages", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "device",
      type: {
        kind: "named",
        name: "DeviceId"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "string"
        }
      });
    });
  };

  remoteModule.addAdbPort = function (arg0) {
    return _client.callRemoteFunction("AdbService/addAdbPort", "void", _client.marshalArguments(Array.from(arguments), [{
      name: "port",
      type: {
        kind: "number"
      }
    }]));
  };

  remoteModule.removeAdbPort = function (arg0) {
    return _client.callRemoteFunction("AdbService/removeAdbPort", "void", _client.marshalArguments(Array.from(arguments), [{
      name: "port",
      type: {
        kind: "number"
      }
    }]));
  };

  remoteModule.getAdbPorts = function () {
    return _client.callRemoteFunction("AdbService/getAdbPorts", "promise", _client.marshalArguments(Array.from(arguments), [])).then(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "number"
        }
      });
    });
  };

  remoteModule.killServer = function () {
    return _client.callRemoteFunction("AdbService/killServer", "promise", _client.marshalArguments(Array.from(arguments), [])).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.getApkManifest = function (arg0, arg1) {
    return _client.callRemoteFunction("AdbService/getApkManifest", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "apkPath",
      type: {
        kind: "string"
      }
    }, {
      name: "buildToolsVersion",
      type: {
        kind: "nullable",
        type: {
          kind: "string"
        }
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    });
  };

  remoteModule.getVersion = function () {
    return _client.callRemoteFunction("AdbService/getVersion", "promise", _client.marshalArguments(Array.from(arguments), [])).then(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    });
  };

  remoteModule.checkMuxStatus = function () {
    return _client.callRemoteFunction("AdbService/checkMuxStatus", "promise", _client.marshalArguments(Array.from(arguments), [])).then(value => {
      return _client.unmarshal(value, {
        kind: "boolean"
      });
    });
  };

  remoteModule.checkInMuxPort = function (arg0) {
    return _client.callRemoteFunction("AdbService/checkInMuxPort", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "port",
      type: {
        kind: "number"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.checkOutMuxPort = function (arg0) {
    return _client.callRemoteFunction("AdbService/checkOutMuxPort", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "port",
      type: {
        kind: "number"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
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
    registerAdbPath: {
      kind: "function",
      name: "registerAdbPath",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 35
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 35
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
        line: 47
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
          name: "ports",
          type: {
            kind: "array",
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
        line: 43
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 43
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
        line: 47
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 47
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
    DeviceId: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 26
      },
      name: "DeviceId",
      definition: {
        kind: "object",
        fields: [{
          name: "name",
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
    getDeviceInfo: {
      kind: "function",
      name: "getDeviceInfo",
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
            kind: "named",
            name: "DeviceId"
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
        line: 36
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
            kind: "named",
            name: "DeviceId"
          }
        }, {
          name: "timeout",
          type: {
            kind: "number"
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
    stopProcess: {
      kind: "function",
      name: "stopProcess",
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
        argumentTypes: [{
          name: "device",
          type: {
            kind: "named",
            name: "DeviceId"
          }
        }, {
          name: "packageName",
          type: {
            kind: "string"
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
        line: 28
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
          name: "port",
          type: {
            kind: "number"
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
    getDevicesOptions: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "DebugBridge.js",
        line: 22
      },
      name: "getDevicesOptions",
      definition: {
        kind: "object",
        fields: [{
          name: "port",
          type: {
            kind: "number"
          },
          optional: true
        }]
      }
    },
    getDeviceList: {
      kind: "function",
      name: "getDeviceList",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 72
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 72
        },
        kind: "function",
        argumentTypes: [{
          name: "options",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "getDevicesOptions"
            }
          }
        }],
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
        line: 78
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 78
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "named",
            name: "DeviceId"
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
        line: 665
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
        line: 671
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
        line: 684
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
            kind: "named",
            name: "DeviceId"
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
            kind: "named",
            name: "DeviceId"
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
            kind: "named",
            name: "DeviceId"
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
            kind: "nullable",
            type: {
              kind: "string"
            }
          }
        }
      }
    },
    removeJdwpForwardSpec: {
      kind: "function",
      name: "removeJdwpForwardSpec",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 109
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 109
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "named",
            name: "DeviceId"
          }
        }, {
          name: "spec",
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
        line: 116
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 116
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "named",
            name: "DeviceId"
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
        line: 133
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 133
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "named",
            name: "DeviceId"
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
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "string"
          }
        }
      }
    },
    launchService: {
      kind: "function",
      name: "launchService",
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
            kind: "named",
            name: "DeviceId"
          }
        }, {
          name: "packageName",
          type: {
            kind: "string"
          }
        }, {
          name: "serviceName",
          type: {
            kind: "string"
          }
        }, {
          name: "debug",
          type: {
            kind: "boolean"
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
        line: 150
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 150
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "named",
            name: "DeviceId"
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
    getAllAvailablePackages: {
      kind: "function",
      name: "getAllAvailablePackages",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 158
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 158
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "named",
            name: "DeviceId"
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
    SimpleProcess: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 16
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
        line: 22
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
        line: 164
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 164
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "named",
            name: "DeviceId"
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
        line: 170
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 170
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "named",
            name: "DeviceId"
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
        line: 177
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 177
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "named",
            name: "DeviceId"
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
        line: 184
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 184
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "named",
            name: "DeviceId"
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
        line: 191
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 191
        },
        kind: "function",
        argumentTypes: [{
          name: "device",
          type: {
            kind: "named",
            name: "DeviceId"
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
    addAdbPort: {
      kind: "function",
      name: "addAdbPort",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 197
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 197
        },
        kind: "function",
        argumentTypes: [{
          name: "port",
          type: {
            kind: "number"
          }
        }],
        returnType: {
          kind: "void"
        }
      }
    },
    removeAdbPort: {
      kind: "function",
      name: "removeAdbPort",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 201
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 201
        },
        kind: "function",
        argumentTypes: [{
          name: "port",
          type: {
            kind: "number"
          }
        }],
        returnType: {
          kind: "void"
        }
      }
    },
    getAdbPorts: {
      kind: "function",
      name: "getAdbPorts",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 205
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 205
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "array",
            type: {
              kind: "number"
            }
          }
        }
      }
    },
    killServer: {
      kind: "function",
      name: "killServer",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 209
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 209
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    getApkManifest: {
      kind: "function",
      name: "getApkManifest",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 234
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 234
        },
        kind: "function",
        argumentTypes: [{
          name: "apkPath",
          type: {
            kind: "string"
          }
        }, {
          name: "buildToolsVersion",
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
            kind: "string"
          }
        }
      }
    },
    getVersion: {
      kind: "function",
      name: "getVersion",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 242
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 242
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "string"
          }
        }
      }
    },
    checkMuxStatus: {
      kind: "function",
      name: "checkMuxStatus",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 246
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 246
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "boolean"
          }
        }
      }
    },
    checkInMuxPort: {
      kind: "function",
      name: "checkInMuxPort",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 257
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 257
        },
        kind: "function",
        argumentTypes: [{
          name: "port",
          type: {
            kind: "number"
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
    checkOutMuxPort: {
      kind: "function",
      name: "checkOutMuxPort",
      location: {
        type: "source",
        fileName: "AdbService.js",
        line: 263
      },
      type: {
        location: {
          type: "source",
          fileName: "AdbService.js",
          line: 263
        },
        kind: "function",
        argumentTypes: [{
          name: "port",
          type: {
            kind: "number"
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