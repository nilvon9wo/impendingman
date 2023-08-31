// noinspection ES6ConvertRequireIntoImport

const path = require('path');
const shell = require('shelljs');

//const placeholderRegex = /\s*"{{{\s*file:\/\/\/\s*([^}]+)\s*}}}"\s*/g;
const placeholderRegex = /\s*(")?\s*{{{\s*file:\/\/\/\s*([^}"']+)\s*}}}\s*(")?\s*/g;

const customMissingFileFlag = 'impending-man-on-missing-file';

export function transformCollection(args: { _: any[]; }) {
    const templateFilePath = args?._[1];
    const resolvedTemplateFilePath = path.resolve(templateFilePath);
    const templateContent = shell.cat(resolvedTemplateFilePath)
        .toString();
    return transformTemplate(templateContent, templateFilePath, args);
}

function transformTemplate(
    templateContent: string,
    templateFilePath: string,
    args: { _: any[]; }
): string {
    const templateDir = path.dirname(templateFilePath);
    let match;
    while ((match = placeholderRegex.exec(templateContent)) !== null) {
        templateContent = fillPlaceholder(match, templateDir, templateContent, args);
    }

    return templateContent;
}

function fillPlaceholder(
        match: RegExpExecArray,
        templateDir: string,
        templateContent: string,
        args: { _: any[] }
    ) {
    const placeholder = match[0];
    const filePath = match[2];
    const absolutePath = path.join(templateDir, filePath)
        .replace(/\\/g, '/');
    const resolvedPath = path.resolve(absolutePath);
    const scriptContent = shell.cat(resolvedPath)
        .toString();
    handleMissingFile(scriptContent, filePath, args);
    const resolvedContent = resolve(match, scriptContent);
    return templateContent.replace(placeholder, ` ${JSON.stringify(resolvedContent)}`);
}

function resolve(match: RegExpExecArray, scriptContent: string) {
    const hasOpeningQuote = match[1] !== undefined;
    const hasClosingQuote = match[3] !== undefined;
    const isQuoted = hasOpeningQuote && hasClosingQuote;
    if (!isQuoted && (hasOpeningQuote || hasClosingQuote)) {
        throw new Error(`Imbalanced quotes around placeholder ${match[0]}`);
    }

    return isQuoted
        ? JSON.stringify(scriptContent)
        : scriptContent;
}

function handleMissingFile(scriptContent: any, filePath: string, args: { _: any[]; }) {
    if (scriptContent) {
        return scriptContent;
    }

    const flag: string = String(args[customMissingFileFlag as keyof typeof args]);
    switch (flag) {
        case 'warning-only':
            console.warn(`Failed to read file: ${filePath}`);
            break;
        default:
            throw new Error(`Failed to read file: ${filePath}`);
    }
}

