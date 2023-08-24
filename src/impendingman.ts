// noinspection ES6ConvertRequireIntoImport
const minimist = require('minimist');
const shell = require('shelljs');
import {transformCollection} from './transformTemplate';

const args = minimist(process.argv.slice(2));
const transformedContent = transformCollection(args);

const transformedFilePath = `./dist/transformed-collection.json`;
shell.ShellString(transformedContent)
    .to(transformedFilePath);

const newmanArgsAfterTemplate = process.argv.slice(3).join(' ');
const newmanCommand = `newman run ${transformedFilePath} ${newmanArgsAfterTemplate}`;
const result = shell.exec(newmanCommand);
//RESTORE: shell.rm(transformedFilePath);

if (result.code !== 0) {
    console.error('Newman execution failed');
} else {
    console.log('Newman executed successfully');
}
process.exit(result.code);

