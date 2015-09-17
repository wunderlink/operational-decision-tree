

var _ = require('lodash')
var async = require('async')

DecisionTree = module.exports = function (opts) {
  if (opts) {
    this.opts = opts
  } else {
    this.opts = {}
  }
}


DecisionTree.prototype.run = function (treeData, subjectData, cb) {
  var nodeCount = -1
  this.runNode(nodeCount, treeData, subjectData, function (err, result) {
    if (err) return cb(err)
    cb(err, result)
  })
}

DecisionTree.prototype.runNode = function (nodeCount, node, subjectData, cb) {
  nodeCount++
  var self = this
  var resolved = false
  var resolvedIndex = 0
  this.runHits(node, subjectData)
  if (node.decisions) {
    async.forEachOf(node.decisions, function (decision, index, callback) {
      if (resolved) {
        callback(null)
      } else {
        self.prepareSubject(nodeCount, node, decision, subjectData, function (err, newSubjectData) {
          if (err) return cb(err)
          var result = self.runComparisons(nodeCount, decision, subjectData)
          if (result) {
            resolved = true
          } else {
            resolvedIndex++
          }
          callback(null)
        })
      }
    }, function (err) {
      if (err) return cb(err)
      self.handleDecision(nodeCount, node, subjectData, resolvedIndex, cb)
    })
  } else {
    cb(null, node)
  }
}

DecisionTree.prototype.runComparisons = function (nodeCount, comparisons, subjectData) {
  var self = this
  for (var i in comparisons) {
    var comparison = comparisons[i]
    var result = this.compare(nodeCount, comparison.property, comparison, subjectData)
    if (!result) {
      return false
    }
  }
  return true
}

DecisionTree.prototype.runHits = function (node, subjectData) {
  var self = this
  if (node.runOnHit && this.opts.runOnHit) {
    for (var i in node.runOnHit) {
      var fn = node.runOnHit[i]
      if (this.opts.runOnHit[fn]) {
        this.opts.runOnHit[fn](subjectData)
      }
    }
  } else {
    return false
  }
}

DecisionTree.prototype.prepareSubject = function (nodeCount, node, comparisons, subjectData, cb) {
  var self = this
  async.each(comparisons, function (comparison, callback) {
    if (subjectData.odt && subjectData.odt[nodeCount] && subjectData.odt[nodeCount][comparison.property]) {
      callback(null)
    } else if (self.opts.populate && self.opts.populate[comparison.property]) {
      self.opts.populate[comparison.property](node, comparisons, comparison, subjectData, function (err, result) {
        if (err) return cb(err)
        if (!subjectData.odt) {
          subjectData.odt = {}
        }
        if (!subjectData.odt[nodeCount]) {
          subjectData.odt[nodeCount] = {}
        }
        subjectData.odt[nodeCount][comparison.property] = result
        return callback(null)
      })
    } else {
      return callback(null)
    }
  }, function (err) {
    if (err) return err
    return cb(null, subjectData)
  })
}


DecisionTree.prototype.compare = function (nodeCount, property, comparison, subjectData) {
  var result = 0;
  if (subjectData.odt && subjectData.odt[nodeCount] && subjectData.odt[nodeCount][property]) {
    var val = subjectData.odt[nodeCount][property]
  } else {
    var val = _.get(subjectData, property)
  }
  switch (comparison.operation) {
    case ">":
      if (val > comparison.value) {
        result = 1;
      }
      break;
    case ">=":
      if (val >= comparison.value) {
        result = 1;
      }
      break;
    case "<":
      if (val < comparison.value) {
        result = 1;
      }
      break;
    case "<=":
      if (val <= comparison.value) {
        result = 1;
      }
      break;
    case "==":
      if (val == comparison.value) {
        result = 1;
      }
      break;
    case "===":
      if (val === comparison.value) {
        result = 1;
      }
      break;
    case "!=":
      if (val != comparison.value) {
        result = 1;
      }
      break;
    case "!==":
      if (val !== comparison.value) {
        result = 1;
      }
      break;
    case "exists":
      if (val) {
        result = 1;
      }
      break;
    case "in":
      for (var i in comparison.value) {
        if (val === comparison.value[i]) {
          result = 1;
        }
      }
      break;
    case "nin":
      result = 1;
      for (var i in comparison.value) {
        if (val === comparison.value[i]) {
          result = 0;
        }
      }
      break;
    default:
      return new Error('Invalid comparison operation')
  }
  return result
}

DecisionTree.prototype.handleDecision = function (nodeCount, node, subjectData, resolvedIndex, cb) {
  if (node.branches) {
    if (!node.branches[resolvedIndex]) {
      return cb("result branch does not exist")
    }
    this.runNode(nodeCount, node.branches[resolvedIndex], subjectData, cb)
  } else {
console.log(node)
    return cb('Node with decisions has no branches! nodeCount:'+nodeCount+' resolvedIndex:'+resolvedIndex)
  }
}


// utility functions
DecisionTree.prototype.countDecisions = function (treeData, finished) {
  var decisionCount = {}
  var self = this
  this.walkTree(treeData, function (node, cb) {
    if (node.decision) {
      self.incrementDecisionCount(decisionCount, node.decision.name)
    } else if (node.decisions) {
      for (var index in node.decisions) {
        self.incrementDecisionCount(decisionCount, node.decisions[index].name)
      }
    }
    cb(null)
  }, function (err) {
    finished(err, decisionCount)
  })
}

DecisionTree.prototype.walkTree = function (node, perNode, finishedNode) {
  var self = this
  var count = 1
  var done = 0

  if (node.branches) {
    for (var index in node.branches) {
      count++
      self.walkTree(node.branches[index], perNode, function (err) {
        done++
        if (count === done) {
          finishedNode(null)
        }
      })
    }
  }

  perNode(node, function (err) {
    done++
    if (count === done) {
      finishedNode(null)
    }
  })
}

DecisionTree.prototype.incrementDecisionCount = function (decisionCount, decisionName) {
  if (!decisionCount[decisionName]) {
    decisionCount[decisionName] = 0
  }
  decisionCount[decisionName]++
}

function isFunction(functionToCheck) {
 var getType = {};
 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}
