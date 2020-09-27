"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scssMigrate = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const project_1 = require("@schematics/angular/utility/project");
const parse_name_1 = require("@schematics/angular/utility/parse-name");
// You don't have to export the function as default. You can also have more than one rule factory
// per file.
function scssMigrate(_options) {
    return (tree, _context) => {
        const glob = require("glob");
        const workspaceConfigBuffer = tree.read("/angular.json");
        if (!workspaceConfigBuffer) {
            throw new schematics_1.SchematicsException('Not an Angular CLI project');
        }
        const workspaceConfig = JSON.parse(workspaceConfigBuffer.toString());
        const projectName = workspaceConfig.defaultProject;
        const project = workspaceConfig.projects[projectName];
        const defaultProjectPath = project_1.buildDefaultPath(project);
        const parsedPath = parse_name_1.parseName(defaultProjectPath, _options.name);
        const { path } = parsedPath;
        let filePaths = glob.sync(`./src/**/*.css`);
        console.log('files to rename', filePaths);
        filePaths.forEach(filePath => {
            let content;
            let filePathNoExtension = filePath.substr(0, filePath.lastIndexOf('.'));
            let fileName = filePathNoExtension.substr(filePathNoExtension.lastIndexOf('/') + 1, filePathNoExtension.length);
            let newFilePath = `${filePathNoExtension}.scss`;
            tree.rename(filePath, newFilePath);
            content = tree.exists(`${filePathNoExtension}.ts`) ? tree.read(`${filePathNoExtension}.ts`) : null;
            if (content) {
                const strContent = content.toString();
                const finalstr = strContent === null || strContent === void 0 ? void 0 : strContent.replace(`${fileName}.css`, `${fileName}.scss`);
                tree.overwrite(`${filePathNoExtension}.ts`, finalstr);
            }
        });
        return tree;
    };
}
exports.scssMigrate = scssMigrate;
//# sourceMappingURL=index.js.map