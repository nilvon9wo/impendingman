import {transformCollection} from "./transformTemplate";
// @ts-ignore
const shell = require('shelljs');
import {ShellString} from 'shelljs';

const customOutputFlag = 'impending-man-output';
const noConsoleFlag = 'impending-man-no-console';

export function populate(args: { _: any[]; [key: string]: any }) {
    if (args[noConsoleFlag] && !args[customOutputFlag]) {
        console.error('Warning: You specified \'impending-man-no-console\' flag without specifying an output flag.');
        process.exit(128);
    }

    const transformedContent = transformCollection(args);
    writeTransformedCollection(transformedContent, args);

    if (!args[noConsoleFlag]) {
        console.log(transformedContent);
    }
}


// noinspection JSUnresolvedReference
function writeTransformedCollection(transformedContent: string, args: { _: any[]; [key: string]: any }) {
    const outputFilePath = args[customOutputFlag as keyof typeof args];
    if (outputFilePath) {
        shell.ShellString(transformedContent)
            .to(outputFilePath);
    }
}
