"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.pushDotMerlinPath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 58
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/pushDotMerlinPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 58
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 58
          },
          kind: "any"
        }
      });
    });
  };

  remoteModule.pushNewBuffer = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "name",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 63
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "content",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 63
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/pushNewBuffer", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 63
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 63
          },
          kind: "any"
        }
      });
    });
  };

  remoteModule.locate = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 69
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 70
        },
        kind: "number"
      }
    }, {
      name: "col",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 71
        },
        kind: "number"
      }
    }, {
      name: "kind",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 72
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/locate", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 73
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 73
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 74
            },
            name: "file",
            type: {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 74
              },
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 75
            },
            name: "pos",
            type: {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 75
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "MerlinService.js",
                  line: 76
                },
                name: "line",
                type: {
                  location: {
                    type: "source",
                    fileName: "MerlinService.js",
                    line: 76
                  },
                  kind: "number"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "MerlinService.js",
                  line: 77
                },
                name: "col",
                type: {
                  location: {
                    type: "source",
                    fileName: "MerlinService.js",
                    line: 77
                  },
                  kind: "number"
                },
                optional: false
              }]
            },
            optional: false
          }]
        }
      });
    });
  };

  remoteModule.enclosingType = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 89
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 90
        },
        kind: "number"
      }
    }, {
      name: "col",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 91
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/enclosingType", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 92
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 92
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 92
            },
            kind: "named",
            name: "MerlinType"
          }
        }
      });
    });
  };

  remoteModule.complete = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 98
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 99
        },
        kind: "number"
      }
    }, {
      name: "col",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 100
        },
        kind: "number"
      }
    }, {
      name: "prefix",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 101
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/complete", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 102
        },
        kind: "any"
      });
    });
  };

  remoteModule.errors = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 108
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/errors", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 109
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 109
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 109
            },
            kind: "named",
            name: "MerlinError"
          }
        }
      });
    });
  };

  remoteModule.outline = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 115
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/outline", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 116
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 116
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 116
            },
            kind: "named",
            name: "MerlinOutline"
          }
        }
      });
    });
  };

  remoteModule.cases = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 122
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "position",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 123
        },
        kind: "named",
        name: "atom$Point"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/cases", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 124
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 124
          },
          kind: "named",
          name: "MerlinCases"
        }
      });
    });
  };

  remoteModule.occurrences = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 138
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "position",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 139
        },
        kind: "named",
        name: "atom$Point"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/occurrences", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 140
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 140
          },
          kind: "named",
          name: "MerlinOccurrences"
        }
      });
    });
  };

  remoteModule.runSingleCommand = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 150
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "command",
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 151
        },
        kind: "mixed"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/runSingleCommand", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 152
        },
        kind: "any"
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
    MerlinPosition: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 15
      },
      name: "MerlinPosition",
      definition: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 15
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 16
          },
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 16
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 17
          },
          name: "col",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 17
            },
            kind: "number"
          },
          optional: false
        }]
      }
    },
    MerlinType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 20
      },
      name: "MerlinType",
      definition: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 20
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 21
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 21
            },
            kind: "named",
            name: "MerlinPosition"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 22
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 22
            },
            kind: "named",
            name: "MerlinPosition"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 23
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 23
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 24
          },
          name: "tail",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 24
            },
            kind: "union",
            types: [{
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 24
              },
              kind: "string-literal",
              value: "no"
            }, {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 24
              },
              kind: "string-literal",
              value: "position"
            }, {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 24
              },
              kind: "string-literal",
              value: "call"
            }]
          },
          optional: false
        }]
      }
    },
    MerlinError: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 27
      },
      name: "MerlinError",
      definition: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 27
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 28
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 28
            },
            kind: "named",
            name: "MerlinPosition"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 29
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 29
            },
            kind: "named",
            name: "MerlinPosition"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 30
          },
          name: "valid",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 30
            },
            kind: "boolean"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 31
          },
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 31
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 32
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 32
            },
            kind: "union",
            types: [{
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 32
              },
              kind: "string-literal",
              value: "type"
            }, {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 32
              },
              kind: "string-literal",
              value: "parser"
            }, {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 32
              },
              kind: "string-literal",
              value: "env"
            }, {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 32
              },
              kind: "string-literal",
              value: "warning"
            }, {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 32
              },
              kind: "string-literal",
              value: "unknown"
            }]
          },
          optional: false
        }]
      }
    },
    MerlinOutline: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 35
      },
      name: "MerlinOutline",
      definition: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 35
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 36
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 36
            },
            kind: "named",
            name: "MerlinPosition"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 37
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 37
            },
            kind: "named",
            name: "MerlinPosition"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 38
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 38
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 39
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 39
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 40
          },
          name: "children",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 40
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 40
              },
              kind: "named",
              name: "MerlinOutline"
            }
          },
          optional: false
        }]
      }
    },
    MerlinCases: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 43
      },
      name: "MerlinCases",
      definition: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 43
        },
        kind: "tuple",
        types: [{
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 44
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 45
            },
            name: "start",
            type: {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 45
              },
              kind: "named",
              name: "MerlinPosition"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 46
            },
            name: "end",
            type: {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 46
              },
              kind: "named",
              name: "MerlinPosition"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 50
          },
          kind: "string"
        }]
      }
    },
    MerlinOccurrences: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 53
      },
      name: "MerlinOccurrences",
      definition: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 53
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 53
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 54
            },
            name: "start",
            type: {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 54
              },
              kind: "named",
              name: "MerlinPosition"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 55
            },
            name: "end",
            type: {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 55
              },
              kind: "named",
              name: "MerlinPosition"
            },
            optional: false
          }]
        }
      }
    },
    pushDotMerlinPath: {
      kind: "function",
      name: "pushDotMerlinPath",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 58
      },
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 58
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 58
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 58
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 58
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 58
              },
              kind: "any"
            }
          }
        }
      }
    },
    pushNewBuffer: {
      kind: "function",
      name: "pushNewBuffer",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 63
      },
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 63
        },
        kind: "function",
        argumentTypes: [{
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 63
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "content",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 63
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 63
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 63
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 63
              },
              kind: "any"
            }
          }
        }
      }
    },
    locate: {
      kind: "function",
      name: "locate",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 68
      },
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 68
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 69
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 70
            },
            kind: "number"
          }
        }, {
          name: "col",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 71
            },
            kind: "number"
          }
        }, {
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 72
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 73
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 73
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 73
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "MerlinService.js",
                  line: 74
                },
                name: "file",
                type: {
                  location: {
                    type: "source",
                    fileName: "MerlinService.js",
                    line: 74
                  },
                  kind: "named",
                  name: "NuclideUri"
                },
                optional: false
              }, {
                location: {
                  type: "source",
                  fileName: "MerlinService.js",
                  line: 75
                },
                name: "pos",
                type: {
                  location: {
                    type: "source",
                    fileName: "MerlinService.js",
                    line: 75
                  },
                  kind: "object",
                  fields: [{
                    location: {
                      type: "source",
                      fileName: "MerlinService.js",
                      line: 76
                    },
                    name: "line",
                    type: {
                      location: {
                        type: "source",
                        fileName: "MerlinService.js",
                        line: 76
                      },
                      kind: "number"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "MerlinService.js",
                      line: 77
                    },
                    name: "col",
                    type: {
                      location: {
                        type: "source",
                        fileName: "MerlinService.js",
                        line: 77
                      },
                      kind: "number"
                    },
                    optional: false
                  }]
                },
                optional: false
              }]
            }
          }
        }
      }
    },
    enclosingType: {
      kind: "function",
      name: "enclosingType",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 88
      },
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 88
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 89
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 90
            },
            kind: "number"
          }
        }, {
          name: "col",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 91
            },
            kind: "number"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 92
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 92
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 92
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "MerlinService.js",
                  line: 92
                },
                kind: "named",
                name: "MerlinType"
              }
            }
          }
        }
      }
    },
    complete: {
      kind: "function",
      name: "complete",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 97
      },
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 97
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 98
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "line",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 99
            },
            kind: "number"
          }
        }, {
          name: "col",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 100
            },
            kind: "number"
          }
        }, {
          name: "prefix",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 101
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 102
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 102
            },
            kind: "any"
          }
        }
      }
    },
    errors: {
      kind: "function",
      name: "errors",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 107
      },
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 107
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 108
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 109
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 109
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 109
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "MerlinService.js",
                  line: 109
                },
                kind: "named",
                name: "MerlinError"
              }
            }
          }
        }
      }
    },
    outline: {
      kind: "function",
      name: "outline",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 114
      },
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 114
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 115
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 116
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 116
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 116
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "MerlinService.js",
                  line: 116
                },
                kind: "named",
                name: "MerlinOutline"
              }
            }
          }
        }
      }
    },
    cases: {
      kind: "function",
      name: "cases",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 121
      },
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 121
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 122
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "position",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 123
            },
            kind: "named",
            name: "atom$Point"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 124
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 124
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 124
              },
              kind: "named",
              name: "MerlinCases"
            }
          }
        }
      }
    },
    occurrences: {
      kind: "function",
      name: "occurrences",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 137
      },
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 137
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 138
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "position",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 139
            },
            kind: "named",
            name: "atom$Point"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 140
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 140
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "MerlinService.js",
                line: 140
              },
              kind: "named",
              name: "MerlinOccurrences"
            }
          }
        }
      }
    },
    runSingleCommand: {
      kind: "function",
      name: "runSingleCommand",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 149
      },
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 149
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 150
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 151
            },
            kind: "mixed"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "MerlinService.js",
            line: 152
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "MerlinService.js",
              line: 152
            },
            kind: "any"
          }
        }
      }
    }
  }
});