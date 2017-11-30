// require all modules ending in "_test" from the
// current directory and all subdirectories
import './testConfig.js'
var testsContext = require.context(".", true, /_test$/);
testsContext.keys().forEach(testsContext);
