const patternsData = require('./patternsData.json')

// Provide both direct array and property access for maximum compatibility
patternsData.patternsData = patternsData
patternsData.default = patternsData

module.exports = patternsData
