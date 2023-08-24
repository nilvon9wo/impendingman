// noinspection ES6ConvertRequireIntoImport
const minimist = require('minimist');
const shell = require('shelljs');
import {ShellString} from "shelljs";
import {transformCollection} from './transformTemplate';

const customOutputFlag = 'impendingman-o';

const args = minimist(process.argv.slice(2));
const transformedContent = transformCollection(args);
const {outputFilePath, transformedFilePath} = writeTransformedCollection(args);
const newmanArgsAfterTemplate = extractNewmanArguments();
const newmanCommand = `newman run ${transformedFilePath} ${newmanArgsAfterTemplate}`;
const result = shell.exec(newmanCommand);
cleanUp(outputFilePath, transformedFilePath);
exit(result);

function writeTransformedCollection(args: (string | any)[]) {
    // @ts-ignore
    const outputFilePath = args[customOutputFlag];
    const transformedFilePath = outputFilePath ?? `./dist/transformed-collection.json`;
    shell.ShellString(transformedContent)
        .to(transformedFilePath);
    return {outputFilePath, transformedFilePath};
}

function extractNewmanArguments() {
    return process.argv.slice(3)
        .filter(arg => arg !== customOutputFlag)
        .join(' ');
}

function cleanUp(outputFilePath: string, transformedFilePath: string) {
    if (!outputFilePath) {
        shell.rm(transformedFilePath);
    }
}

function exit(result: ShellString) {
    if (result.code !== 0) {
        console.error('Newman execution failed.');
    } else {
        console.log('Newman executed successfully.');
    }
    process.exit(result.code);
}


