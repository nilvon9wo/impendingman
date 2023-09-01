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

    templateContent = templateContent.replace(
        placeholderRegex,
        (match, openingQuote, filePath, closingQuote) => {
            const absolutePath = path.join(templateDir, filePath)
                .replace(/\\/g, '/');
            const resolvedPath = path.resolve(absolutePath);
            const fileContent = shell.cat(resolvedPath)
                .toString();
            handleMissingFile(fileContent, filePath);

            const isQuoted = openingQuote !== undefined && closingQuote !== undefined;
            return isQuoted ?
                JSON.stringify(fileContent)
                : reevaluate(fileContent, resolvedPath, templateDir);
        });

    return templateContent;
}

function reevaluate(content: string, resolvedPath: string, baseDir: string) {
    const newDir = path.dirname(path.join(baseDir, resolvedPath));
    let updatedContent = content;

    updatedContent = updatedContent.replace(
        placeholderRegex,
        (match, openingQuote, filePath, closingQuote) => {
            const absolutePath = path.join(newDir, filePath).replace(/\\/g, '/');
            const resolvedPath = path.resolve(absolutePath);
            const fileContent = shell.cat(resolvedPath).toString();
            handleMissingFile(fileContent, filePath);

            const isQuoted = openingQuote !== undefined && closingQuote !== undefined;
            return isQuoted ?
                JSON.stringify(fileContent)
                : fileContent;
        });

    return updatedContent;
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
