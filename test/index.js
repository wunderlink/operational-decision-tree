

var tape = require('tape')

var DTS = require('../index.js')

var sampleTree = require('./test.json')
var conditions = require('./conditions.js')


tape('Test Basic Condition', function (t) {
  var DT = new DTS({conditions:conditions})

  var subject = {
    value: 1
  }

  var condition = {
    name: 'conditionBasic',
    opts: {}
  }

  DT.testCondition(condition, subject, function (err, result) {
    t.ok(result, 'Basic condition returns true')
    subject.value = 0
    DT.testCondition(condition, subject, function (err, result) {
      t.notOk(result, 'Basic condition returns false')
      t.end()
    })
  })
})

tape('Test Condition With Opts', function (t) {
  var DT = new DTS({conditions:conditions})

  var subject = {
    value: 1
  }

  var condition = {
    name: 'conditionOpts',
    opts: {
      value: 2
    }
  }

  DT.testCondition(condition, subject, function (err, result) {
    t.ok(result, 'Condition with opts returns true')
    subject.value = 3
    DT.testCondition(condition, subject, function (err, result) {
      t.notOk(result, 'Condition with opts returns false')
      t.end()
    })
  })
})

tape('Test runNode', function (t) {
  var DT = new DTS({conditions:conditions})

  var subject = {
    age: 37
  }

  var node = {
    condition: {
      name: "conditionAge",
      opts: {
        operator: ">",
        value: 20
      }   
    },  
    paths: [
      {   
        result: "Leaf A: Aged under 20" 
      },  
      {   
        result: "Leaf B: Aged 21 or over" 
      }   
    ]   
  }

  DT.runNode(node, subject, function (err, result) {
    t.ok(result, 'Leaf B: Aged 21 or over')
    subject.age = 8
    DT.runNode(node, subject, function (err, result) {
      t.ok(result, 'Leaf A: Aged under 20')
      t.end()
    })
  })
})

tape('Test defaultDecider', function (t) {
  var DT = new DTS({conditions:conditions})

  var result

  result = DT.defaultDecider(true)
  t.equal(result, 1, 'Decider properly handles "true"')

  result = DT.defaultDecider(false)
  t.equal(result, 0, 'Decider properly handles "false"')

  result = DT.defaultDecider(1)
  t.equal(result, 1, 'Decider properly handles "1"')

  result = DT.defaultDecider(0)
  t.equal(result, 0, 'Decider properly handles "0"')

  result = DT.defaultDecider(2)
  t.equal(result, 2, 'Decider properly handles "2"')

  result = DT.defaultDecider('Oops')
  t.equal(result instanceof Error, new Error() instanceof Error, 'Decider properly returns an error on strings')

  t.end()
})


tape('Test countConditions', function (t) {
  var DT = new DTS({conditions:conditions})
  DT.countConditions(sampleTree, function(err, conditionCount) {
    t.equal(1, conditionCount.conditionPercent, 'countConditions returned the correct number of "conditionPercent"')
    t.equal(3, conditionCount.conditionAsync, 'countConditions returned the correct number of "conditionAsync"')
    t.end()
  })
})

tape('Test conditionAsync', function (t) {
  var DT = new DTS({conditions:conditions})
  DT.run(sampleTree, {random:64}, function(err, result) {
    t.equal('Leaf C', result.result)
    t.end()
  })
})

