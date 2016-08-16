"use strict";

let Observable, trackOperationTiming;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.findArcConfigDirectory = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 55
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findArcConfigDirectory", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 55
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 55
          },
          kind: "named",
          name: "NuclideUri"
        }
      });
    });
  };

  remoteModule.readArcConfig = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 63
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/readArcConfig", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 63
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 63
          },
          kind: "any"
        }
      });
    });
  };

  remoteModule.findArcProjectIdOfPath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 78
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findArcProjectIdOfPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 78
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 78
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.getProjectRelativePath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 83
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/getProjectRelativePath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 83
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 83
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.findDiagnostics = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "pathToFiles",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 89
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 89
          },
          kind: "named",
          name: "NuclideUri"
        }
      }
    }, {
      name: "skip",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 90
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 90
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/findDiagnostics", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 91
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 91
          },
          kind: "named",
          name: "ArcDiagnostic"
        }
      });
    });
  };

  remoteModule.createPhabricatorRevision = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 168
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/createPhabricatorRevision", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 169
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 169
          },
          name: "stderr",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 169
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 169
          },
          name: "stdout",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 169
            },
            kind: "string"
          },
          optional: true
        }]
      });
    });
  };

  remoteModule.updatePhabricatorRevision = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 174
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "message",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 175
        },
        kind: "string"
      }
    }, {
      name: "allowUntracked",
      type: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 176
        },
        kind: "boolean"
      }
    }]).then(args => {
      return _client.callRemoteFunction("ArcanistService/updatePhabricatorRevision", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 177
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 177
          },
          name: "stderr",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 177
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 177
          },
          name: "stdout",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 177
            },
            kind: "string"
          },
          optional: true
        }]
      });
    });
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
    trackOperationTiming = arguments[1];
  }
});
Object.defineProperty(module.exports, "defs", {
  value: new Map([["Object", {
    kind: "alias",
    name: "Object",
    location: {
      type: "builtin"
    }
  }], ["Date", {
    kind: "alias",
    name: "Date",
    location: {
      type: "builtin"
    }
  }], ["RegExp", {
    kind: "alias",
    name: "RegExp",
    location: {
      type: "builtin"
    }
  }], ["Buffer", {
    kind: "alias",
    name: "Buffer",
    location: {
      type: "builtin"
    }
  }], ["fs.Stats", {
    kind: "alias",
    name: "fs.Stats",
    location: {
      type: "builtin"
    }
  }], ["NuclideUri", {
    kind: "alias",
    name: "NuclideUri",
    location: {
      type: "builtin"
    }
  }], ["ArcDiagnostic", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 38
    },
    name: "ArcDiagnostic",
    definition: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 38
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 39
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 39
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 40
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 40
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 41
        },
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 41
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 42
        },
        name: "row",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 42
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 43
        },
        name: "col",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 43
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 44
        },
        name: "code",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 44
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 44
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 47
        },
        name: "original",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 47
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 48
        },
        name: "replacement",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 48
          },
          kind: "string"
        },
        optional: true
      }]
    }
  }], ["findArcConfigDirectory", {
    kind: "function",
    name: "findArcConfigDirectory",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 55
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 55
      },
      kind: "function",
      argumentTypes: [{
        name: "fileName",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 55
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 55
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 55
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 55
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }
    }
  }], ["readArcConfig", {
    kind: "function",
    name: "readArcConfig",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 63
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 63
      },
      kind: "function",
      argumentTypes: [{
        name: "fileName",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 63
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 63
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 63
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 63
            },
            kind: "any"
          }
        }
      }
    }
  }], ["findArcProjectIdOfPath", {
    kind: "function",
    name: "findArcProjectIdOfPath",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 78
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 78
      },
      kind: "function",
      argumentTypes: [{
        name: "fileName",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 78
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 78
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 78
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 78
            },
            kind: "string"
          }
        }
      }
    }
  }], ["getProjectRelativePath", {
    kind: "function",
    name: "getProjectRelativePath",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 83
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 83
      },
      kind: "function",
      argumentTypes: [{
        name: "fileName",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 83
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 83
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 83
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 83
            },
            kind: "string"
          }
        }
      }
    }
  }], ["findDiagnostics", {
    kind: "function",
    name: "findDiagnostics",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 88
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 88
      },
      kind: "function",
      argumentTypes: [{
        name: "pathToFiles",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 89
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 89
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }, {
        name: "skip",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 90
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 90
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 91
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 91
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 91
            },
            kind: "named",
            name: "ArcDiagnostic"
          }
        }
      }
    }
  }], ["createPhabricatorRevision", {
    kind: "function",
    name: "createPhabricatorRevision",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 167
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 167
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 168
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 169
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 169
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 169
            },
            name: "stderr",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 169
              },
              kind: "string"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 169
            },
            name: "stdout",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 169
              },
              kind: "string"
            },
            optional: true
          }]
        }
      }
    }
  }], ["updatePhabricatorRevision", {
    kind: "function",
    name: "updatePhabricatorRevision",
    location: {
      type: "source",
      fileName: "ArcanistService.js",
      line: 173
    },
    type: {
      location: {
        type: "source",
        fileName: "ArcanistService.js",
        line: 173
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 174
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 175
          },
          kind: "string"
        }
      }, {
        name: "allowUntracked",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 176
          },
          kind: "boolean"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ArcanistService.js",
          line: 177
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "ArcanistService.js",
            line: 177
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 177
            },
            name: "stderr",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 177
              },
              kind: "string"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "ArcanistService.js",
              line: 177
            },
            name: "stdout",
            type: {
              location: {
                type: "source",
                fileName: "ArcanistService.js",
                line: 177
              },
              kind: "string"
            },
            optional: true
          }]
        }
      }
    }
  }]])
});