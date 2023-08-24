// noinspection ES6ConvertRequireIntoImport
import fs from 'fs';
const path = require('path');
const shell = require('shelljs');

const placeholderRegex = /"\s*exec\s*"\s*:\s*"{{{\s*file:\/\/\/\s*([^}]+)\s*}}}"\s*/g;
export function transformCollection(args: { _: any[]; }) {
    const templateFilePath = args?._[1];
    const resolvedTemplateFilePath = path.resolve(templateFilePath);
    const templateContent = shell.cat(resolvedTemplateFilePath)
        .toString();
    return transformTemplate(templateContent, templateFilePath);
}

function transformTemplate(templateContent: string, templateFilePath: string): string {
    const templateDir = path.dirname(templateFilePath);
    let match;
    while ((match = placeholderRegex.exec(templateContent)) !== null) {
        const placeholder = match[0];
        const filePath = match[1];
        try {
            const absolutePath = path.join(templateDir, filePath)
                .replace(/\\/g, '/');
            const resolvedPath = path.resolve(absolutePath);
            const scriptContent = shell.cat(resolvedPath)
                .toString();
            templateContent = templateContent.replace(placeholder, `"exec": ${JSON.stringify(scriptContent)}`);
        } catch (error) {
            console.error(`Failed to read file: ${filePath}`);
        }
    }

    return templateContent;
}
