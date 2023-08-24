// noinspection ES6ConvertRequireIntoImport
const minimist = require('minimist');
const path = require('path');
const shell = require('shelljs');
import {transformTemplate} from './transformTemplate';

console.log("########## STARTING:");

const args = minimist(process.argv.slice(2));
const transformedContent = transformCollection(args);

const transformedFilePath = `./dist/transformed-collection.json`;
shell.ShellString(transformedContent)
    .to(transformedFilePath);

const newmanArgsAfterTemplate = process.argv.slice(3).join(' ');
const newmanCommand = `newman run ${transformedFilePath} ${newmanArgsAfterTemplate}`;
const result = shell.exec(newmanCommand);
shell.rm(transformedFilePath);

if (result.code !== 0) {
    console.error('Newman execution failed');
} else {
    console.log('Newman executed successfully');
}

function transformCollection(args: { _: any[]; }) {
    const templateFilePath = args?._[1];
    const resolvedTemplateFilePath = path.resolve(templateFilePath);
    const templateContent = shell.cat(resolvedTemplateFilePath)
        .toString();
    return transformTemplate(templateContent);
}

