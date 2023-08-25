// noinspection ES6ConvertRequireIntoImport
const minimist = require('minimist');
import  {run} from './services/runner';
import  {populate} from './services/populator';

const args = minimist(process.argv.slice(2));
switch (args._[0]) {
    case 'run':
        run(args);
        break;
    case 'populate':
        populate(args);
        break;
    default:
        console.error('Unsupported!');
        process.exit(404);
}
