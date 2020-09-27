"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scssMigrate = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const project_1 = require("@schematics/angular/utility/project");
function scssMigrate(_options) {
    return (tree, _context) => {
        const glob = require("glob");
        const workspaceConfigBuffer = tree.read("/angular.json");
        if (!workspaceConfigBuffer) {
            throw new schematics_1.SchematicsException('Not an Angular CLI project');
        }
        else {
            const shell = require('shelljs');
            const workspaceConfig = JSON.parse(workspaceConfigBuffer.toString());
            const projectName = workspaceConfig.defaultProject;
            const project = workspaceConfig.projects[projectName];
            // Needs improvement, maybe use shelljs.exec('ng config schematics.@schematics/angular:component.style scss')?
            // Maybe its possible to use RunSchematicTask from '@angular-devkit/schematics/tasks'? To achieve  
            // adding the new style schematic?
            const workspaceSchematics = project ? project.schematics ? project.schematics : null : undefined;
            if (workspaceSchematics === undefined) {
                throw new schematics_1.SchematicsException('Not a valid Angular CLI project');
            }
            if (workspaceSchematics) {
                let componectSchematics = workspaceSchematics['@schematics/angular:component'];
                if (componectSchematics) {
                    let styleSheetFormat = componectSchematics.style;
                    componectSchematics.styleExt && delete componectSchematics.styleExt;
                    if (styleSheetFormat) {
                        styleSheetFormat = styleSheetFormat = 'scss';
                    }
                    else {
                        componectSchematics.style = 'scss';
                    }
                }
                else {
                    workspaceSchematics['@schematics/angular:component'] = {
                        "style": "scss"
                    };
                }
            }
            else {
                project.schematics = { ['@schematics/angular:component']: {} };
                project.schematics['@schematics/angular:component'] = {
                    "style": "scss"
                };
            }
            tree.overwrite('/angular.json', JSON.stringify(workspaceConfig, null, "\t"));
            const defaultProjectPath = project_1.buildDefaultPath(project);
            const filePaths = glob.sync(`.${defaultProjectPath}/**/*.${_options.from}`);
            console.log('Files to rename', filePaths);
            filePaths.forEach((filePath) => {
                let relativeComponentClassFileContent;
                let filePathNoExtension = filePath.substr(0, filePath.lastIndexOf('.'));
                let fileName = filePathNoExtension.substr(filePathNoExtension.lastIndexOf('/') + 1, filePathNoExtension.length);
                let newFilePath = `${filePathNoExtension}.${_options.to}`;
                tree.rename(filePath, newFilePath);
                relativeComponentClassFileContent = tree.exists(`${filePathNoExtension}.ts`) ? tree.read(`${filePathNoExtension}.ts`) : null;
                if (relativeComponentClassFileContent) {
                    const relativeComponentClassFileContentAsString = relativeComponentClassFileContent.toString();
                    const finalComponentClassFileContent = relativeComponentClassFileContentAsString === null || relativeComponentClassFileContentAsString === void 0 ? void 0 : relativeComponentClassFileContentAsString.replace(`${fileName}.${_options.from}`, `${fileName}.${_options.to}`);
                    tree.overwrite(`${filePathNoExtension}.ts`, finalComponentClassFileContent);
                }
            });
        }
        return tree;
    };
}
exports.scssMigrate = scssMigrate;
//# sourceMappingURL=index.js.map