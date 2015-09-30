

var tape = require('tape')

var DTS = require('../index.js')

var sampleTree = require('./tree.json')


tape('Test Binary Condition', function (t) {
  var DT = new DTS()

  var subject = {
    target: 1
  }

  var decision = [{
        property: 'target',
        operation: '>',
        value: 2
      }]

  var result = DT.runDecisions(0, decision, subject, {})
  t.equal(result, false, 'Binary condition returns false')

  subject.target = 3
  var result = DT.runDecisions(0, decision, subject, {})
  t.equal(result, true, 'Binary condition returns true')

  t.end()
})

tape('Test Arbitrary Condition', function (t) {
  var DT = new DTS()

  var subject = {
    random: 85
  }

  var node = {
    decisions: [
      [{
        property: 'random',
        operation: '<',
        value: 30
      }],
      [{
        property: 'random',
        operation: '<',
        value: 50
      }],
      [{
        property: 'random',
        operation: '<',
        value: 100
      }]
    ],
    branches: [
      'first',
      'second',
      'third'
    ]
  }

  DT.runNode(0, node, subject, {}, function (err, result) {
    t.equal(result, 'third', 'Node returns third branch')
    subject.random = 35
    DT.runNode(0, node, subject, {}, function (err, result) {
      t.equal(result, 'second', 'Node returns second branch')
      subject.random = 5
      DT.runNode(0, node, subject, {}, function (err, result) {
        t.equal(result, 'first', 'Node returns first branch')
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


