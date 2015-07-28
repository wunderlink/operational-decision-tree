

var tape = require('tape')

var DTS = require('../index.js')

var sampleTree = require('./test.json')


tape('Test Binary Condition', function (t) {
  var DT = new DTS()

  var subject = {
    value: 1
  }

  var condition = {
    name: 'conditionBinary',
    property: 'value',
    comparison: {
      operation: '>',
      value: 0
    }
  }

  DT.testCondition(condition, subject, function (err, result) {
    t.equal(result, 1, 'Binary condition returns 1')
    subject.value = 0
    DT.testCondition(condition, subject, function (err, result) {
      t.equal(result, 0, 'Binary condition returns 0')
      t.end()
    })
  })
})

tape('Test Arbitrary Condition', function (t) {
  var DT = new DTS()

  var subject = {
    random: 85
  }

  var condition = {
    name: 'conditionArbitrary',
    property: 'random',
    comparisons: [
      {
      operation: '<',
      value: 30
      },
      {
      operation: '<',
      value: 50
      },
      {
      operation: '<',
      value: 100
      }
    ]
  }

  DT.testCondition(condition, subject, function (err, result) {
    t.equal(result, 2, 'Arbitrary condition returns 2')
    subject.random = 35
    DT.testCondition(condition, subject, function (err, result) {
      t.equal(result, 1, 'Arbitrary condition returns 1')
      subject.random = 5
      DT.testCondition(condition, subject, function (err, result) {
        t.equal(result, 0, 'Arbitrary condition returns 0')
        t.end()
      })
    })
  })
})

tape('Test Condition With Opts', function (t) {
  var DT = new DTS()

  var subject = {
    somevalue: 1
  }

  var condition = {
    name: 'conditionOpts',
    property: 'somevalue',
    comparison: {
      operation: '<',
      value: 2
    }
  }

  DT.testCondition(condition, subject, function (err, result) {
    t.ok(result, 'Condition with opts returns true')
    subject.somevalue = 3
    DT.testCondition(condition, subject, function (err, result) {
      t.notOk(result, 'Condition with opts returns false')
      t.end()
    })
  })
})

tape('Test runNode', function (t) {
  var DT = new DTS()

  var subject = {
    age: 37
  }

  var node = {
    condition: {
      name: "conditionAge",
      property: 'age',
      comparison: {
        operation: ">",
        value: 20
      }   
    },  
    branches: [
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
  var DT = new DTS()

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
  var DT = new DTS()
  DT.countConditions(sampleTree, function(err, conditionCount) {
    t.equal(1, conditionCount.conditionPercent, 'countConditions returned the correct number of "conditionPercent"')
    t.equal(3, conditionCount.conditionAsync, 'countConditions returned the correct number of "conditionAsync"')
    t.end()
  })
})


