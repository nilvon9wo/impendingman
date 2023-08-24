import fs from 'fs';

export function transformTemplate(templateContent: string): string {
    const execPlaceholderRegex = /"\s*exec\s*"\s*:\s*"{{{\s*([^}]+)\s*}}}"\s*/g;

    let match;
    while ((match = execPlaceholderRegex.exec(templateContent)) !== null) {
        const placeholder = match[0];
        const filePath = match[1];
        try {
            const scriptContent = fs.readFileSync(filePath, 'utf8');
            templateContent = templateContent.replace(placeholder, `"exec": ${JSON.stringify(scriptContent)}`);
        } catch (error) {
            console.error(`Failed to read file: ${filePath}`);
        }
    }

    return templateContent;
}
