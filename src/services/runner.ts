import {transformCollection} from "./transformTemplate";
// @ts-ignore
const shell = require('shelljs');
import {ShellString} from 'shelljs';

const customOutputPrefix = 'impending-man';
const customOutputFlag = 'impending-man-output';
export function run(args: { _: any[]; }) {
    let transformedContent: string = '';
    try {
        transformedContent = transformCollection(args);
    }
    catch (error) {
        console.error(error);
        process.exit(404);
    }

    if (transformedContent) {
        const {outputFilePath, transformedFilePath} = writeTransformedCollection(transformedContent, args);
        const newmanArgsAfterTemplate = extractNewmanArguments();
        const newmanCommand = `newman run ${transformedFilePath} ${newmanArgsAfterTemplate}`;
        const result = shell.exec(newmanCommand);
        cleanUp(outputFilePath, transformedFilePath);
        exit(result);
    }
}


// noinspection JSUnresolvedReference
function writeTransformedCollection(transformedContent: string, args: { _: any[]; }) {
    const {outputFilePath, transformedFilePath} = selectOutputPath(args);
    shell.ShellString(transformedContent)
        .to(transformedFilePath);
    return {outputFilePath, transformedFilePath};
}

function selectOutputPath(args: { _: any[]; [key: string]: any }) {
    const outputFilePath = args[customOutputFlag as keyof typeof args];
    const transformedFilePath = outputFilePath ?? createTimestampedPath();
    return { outputFilePath, transformedFilePath };
}

function createTimestampedPath() {
    const timestamp = new Date()
        .toISOString()
        .replace(/[-:.]/g, '');
    return `./transformed-collection_${timestamp}.json`;
}

function extractNewmanArguments() {
    return process.argv.slice(3)
        .filter(arg => !arg.startsWith(`--${customOutputPrefix}`))
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
