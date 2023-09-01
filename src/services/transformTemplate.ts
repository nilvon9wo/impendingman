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
    content: string,
    filePath: string
): string {
    const directory = path.dirname(filePath);
    return makeReplacements(
        content,
        directory,
        (fileContent: string, resolvedPath: string, directory: string) =>
            reevaluate(fileContent, resolvedPath, directory)
    );
}
function reevaluate(
    content: string,
    filePath: string,
    baseDir: string
) : string {
    const directory = path.dirname(path.join(baseDir, filePath));
    return makeReplacements(
        content,
        directory,
        (fileContent: string, resolvedPath: string, directory: string) =>
            containsPlaceholder(fileContent)
                ? reevaluate(fileContent, resolvedPath, directory)
                : fileContent
    );
}

function containsPlaceholder(content: string): boolean {
    return placeholderRegex.test(content);
}

function makeReplacements(
    content: string,
    directory: string,
    doWithEmbeddedObject: (fileContent: string, resolvedPath: string, directory: string) => string
): string {
    content = content.replace(
        placeholderRegex,
        (match, hasOpeningQuote, filePath, hasClosingQuote) => {
            const absolutePath = path.join(directory, filePath).replace(/\\/g, '/');
            const resolvedPath = path.resolve(absolutePath);
            const fileContent = shell.cat(resolvedPath).toString();
            handleMissingFile(fileContent, filePath);

            return checkQuoted(hasOpeningQuote, hasClosingQuote, match)
                ? JSON.stringify(fileContent)
                : doWithEmbeddedObject(fileContent, resolvedPath, directory);
        });

    return content;
}

function checkQuoted(hasOpeningQuote: boolean, hasClosingQuote: boolean, match: string) {
    const isQuoted = hasOpeningQuote && hasClosingQuote;
    if (!isQuoted && (hasOpeningQuote || hasClosingQuote)) {
        throw new Error(`Imbalanced quotes around placeholder ${match}`);
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
