// noinspection ES6ConvertRequireIntoImport
const path = require('path');
const shell = require('shelljs');

const placeholderRegex = /\s*(?<openingQuote>")?\s*{{{\s*file:\/\/\/\s*(?<filePath>[^}"']+)\s*}}}\s*(?<closingQuote>")?\s*/g;

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
    const filePath = match.groups?.filePath;
    const absolutePath = path.join(templateDir, filePath!)
        .replace(/\\/g, '/');
    const resolvedPath = path.resolve(absolutePath);
    const content = shell.cat(resolvedPath)
        .toString();
    handleMissingFile(content, filePath!);
    const resolvedContent = resolve(match, content, resolvedPath);
    console.log("##################### placeholder", placeholder);
    console.log("##################### resolvedContent", resolvedContent);
    let returnedContent = templateContent.replace(placeholder, resolvedContent);
    console.log("##################### returnedContent", returnedContent);
    return returnedContent;
}

function resolve(
        match: RegExpExecArray,
        content: string,
        resolvedPath: string,
) {
    const isQuoted = checkQuoted(match);
    return isQuoted
        ? ` ${JSON.stringify(content)} `
        : content;
}

function checkQuoted(match: RegExpExecArray) {
    const hasOpeningQuote = match.groups?.openingQuote;
    const hasClosingQuote = match.groups?.closingQuote;
    const isQuoted = hasOpeningQuote && hasClosingQuote;
    if (!isQuoted && (hasOpeningQuote || hasClosingQuote)) {
        throw new Error(`Imbalanced quotes around placeholder ${match[0]}`);
    }
    return isQuoted;
}

function handleMissingFile(scriptContent: any, filePath: string) {
    if (!scriptContent) {
        throw new Error(`Failed to read file: ${filePath}`);
    } else {
        return scriptContent;
    }
}

