


Country = module.exports = function (opts) {
  this.title = 'Country'
  this.schema = {
    operator: {
      default: '=',
      options: [
        '=',
        '>',
        '>=',
        '<',
        '<='
      ]
    },
    value: {
      default: 0,
      type: 'number'
    }
  }
}

Country.prototype.run = function (opts) {

}
