// noinspection ES6ConvertRequireIntoImport
const minimist = require('minimist');
import  {run} from './runner';

const args = minimist(process.argv.slice(2));
run(args);

