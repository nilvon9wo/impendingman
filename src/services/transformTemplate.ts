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
    return transformTemplate(templateContent, templateFilePath);
}

function transformTemplate(
    templateContent: string,
    templateFilePath: string
): string {
    const templateDir = path.dirname(templateFilePath);
    let match;
    while ((match = placeholderRegex.exec(templateContent)) !== null) {
        templateContent = fillPlaceholder(match, templateDir, templateContent);
    }

    return templateContent;
}

function fillPlaceholder(
        match: RegExpExecArray,
        templateDir: string,
        templateContent: string
    ) {
    const placeholder = match[0];
    const filePath = match[2];
    const absolutePath = path.join(templateDir, filePath)
        .replace(/\\/g, '/');
    const resolvedPath = path.resolve(absolutePath);
    const content = shell.cat(resolvedPath)
        .toString();
    handleMissingFile(content, filePath);
    const resolvedContent = resolve(match, content, resolvedPath);
    return templateContent.replace(placeholder, ` ${JSON.stringify(resolvedContent)}`);
}

function resolve(
        match: RegExpExecArray,
        content: string,
        resolvedPath: string,
) {
    const hasOpeningQuote = match[1] !== undefined;
    const hasClosingQuote = match[3] !== undefined;
    const isQuoted = hasOpeningQuote && hasClosingQuote;
    if (!isQuoted && (hasOpeningQuote || hasClosingQuote)) {
        throw new Error(`Imbalanced quotes around placeholder ${match[0]}`);
    }

    return isQuoted
        ? JSON.stringify(content)
        : reevaluate(content, resolvedPath);
}

function reevaluate(content: string, resolvedPath: string) {
    return (placeholderRegex.test(content))
        ? transformTemplate(content, resolvedPath)
        : content;
}

function handleMissingFile(scriptContent: any, filePath: string) {
    if (!scriptContent) {
        throw new Error(`Failed to read file: ${filePath}`);
    } else {
        return scriptContent;
    }
}

