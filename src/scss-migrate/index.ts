import { Rule, SchematicContext, Tree, SchematicsException } from '@angular-devkit/schematics';
import { buildDefaultPath } from '@schematics/angular/utility/project'
import { Schema } from './schema';
import { RunSchematicTask } from '@angular-devkit/schematics/tasks';

export function scssMigrate(_options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const glob = require("glob");
    const workspaceConfigBuffer = tree.read("/angular.json");

    if (!workspaceConfigBuffer) {
      throw new SchematicsException('Not an Angular CLI project')
    } else {
      const shell = require('shelljs');

      const workspaceConfig = JSON.parse(workspaceConfigBuffer.toString());
      const projectName = workspaceConfig.defaultProject;
      const project = workspaceConfig.projects[projectName];

      // Needs improvement, maybe use shelljs.exec('ng config schematics.@schematics/angular:component.style scss')?
      // Maybe its possible to use RunSchematicTask from '@angular-devkit/schematics/tasks'? To achieve  
      // adding the new style schematic?

      const workspaceSchematics = project ? project.schematics ? project.schematics : null : undefined;

      if (workspaceSchematics === undefined) {
        throw new SchematicsException('Not a valid Angular CLI project')
      }

      if (workspaceSchematics) {
        let componectSchematics = workspaceSchematics['@schematics/angular:component'];

        if (componectSchematics) {
          let styleSheetFormat = componectSchematics.style;

          componectSchematics.styleExt && delete componectSchematics.styleExt;

          if (styleSheetFormat) {
            styleSheetFormat = styleSheetFormat = 'scss';
          } else {
            componectSchematics.style = 'scss';
          }
        } else {
          workspaceSchematics['@schematics/angular:component'] = {
            "style": "scss"
          };
        }
      } else {
        project.schematics = { ['@schematics/angular:component']: {} };

        project.schematics['@schematics/angular:component'] = {
          "style": "scss"
        };
      }

      tree.overwrite('/angular.json', JSON.stringify(workspaceConfig, null, "\t"));

      const defaultProjectPath = buildDefaultPath(project);
      const filePaths = glob.sync(`.${defaultProjectPath}/**/*.${_options.from}`);

      console.log('Files to rename', filePaths);

      filePaths.forEach((filePath: string) => {
        let relativeComponentClassFileContent: Buffer;
        let filePathNoExtension: string = filePath.substr(0, filePath.lastIndexOf('.'));
        let fileName: string = filePathNoExtension.substr(filePathNoExtension.lastIndexOf('/') + 1, filePathNoExtension.length)
        let newFilePath: string = `${filePathNoExtension}.${_options.to}`;

        tree.rename(filePath, newFilePath);

        relativeComponentClassFileContent = tree.exists(`${filePathNoExtension}.ts`) ? tree.read(`${filePathNoExtension}.ts`) : null;

        if (relativeComponentClassFileContent) {
          const relativeComponentClassFileContentAsString = relativeComponentClassFileContent.toString();
          const finalComponentClassFileContent: string = relativeComponentClassFileContentAsString?.replace(
            `${fileName}.${_options.from}`,
            `${fileName}.${_options.to}`
          );

          tree.overwrite(`${filePathNoExtension}.ts`, finalComponentClassFileContent);
        }
      });
    }

    return tree;
  };
}
