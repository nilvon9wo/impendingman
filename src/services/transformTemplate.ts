// noinspection ES6ConvertRequireIntoImport
const path = require('path');
const shell = require('shelljs');

const placeholderRegex = /\s*(?<openingQuote>")?\s*{{{\s*file:\/\/\/\s*(?<filePath>[^}"']+)\s*}}}\s*(?<closingQuote>")?\s*/g;

export function transformCollection(args: { _: any[]; }) {
    const templateFilePath = args?._[1];
    const resolvedTemplateFilePath = path.resolve(templateFilePath);
    const templateContent = shell.cat(resolvedTemplateFilePath)
        .toString();
    const directory = path.dirname(templateFilePath);
    return makeReplacements(templateContent, directory);
}

function makeReplacements(content: string, directory: string): string {
    return content.replace(
        placeholderRegex,
        (match, hasOpeningQuote, filePath, hasClosingQuote) => {
            const resolvedPath = getFilePath(directory, filePath);
            const newDirectory = path.dirname(path.join(directory, filePath));
            const fileContent = getFileContent(resolvedPath, filePath);
            return checkQuoted(hasOpeningQuote, hasClosingQuote, match)
                ? JSON.stringify(fileContent)
                : containsPlaceholder(fileContent)
                    ? makeReplacements(fileContent, newDirectory)
                    : fileContent;
        });
}

function getFilePath(directory: string, filePath: string) {
    const absolutePath = path.join(directory, filePath)
        .replace(/\\/g, '/');
    return path.resolve(absolutePath);
}

function getFileContent(resolvedPath: string, filePath: string) {
    const fileContent = shell.cat(resolvedPath)
        .toString();
    handleMissingFile(fileContent, filePath);
    return fileContent;
}

function handleMissingFile(scriptContent: any, filePath: string) {
    if (!scriptContent) {
        throw new Error(`Failed to read file: ${filePath}`);
    } else {
        return scriptContent;
    }
}

function checkQuoted(hasOpeningQuote: boolean, hasClosingQuote: boolean, match: string) {
    const isQuoted = hasOpeningQuote && hasClosingQuote;
    if (!isQuoted && (hasOpeningQuote || hasClosingQuote)) {
        throw new Error(`Imbalanced quotes around placeholder ${match}`);
    }
    return isQuoted;
}

function containsPlaceholder(content: string): boolean {
    return placeholderRegex.test(content);
}


