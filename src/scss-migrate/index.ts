import { Rule, SchematicContext, Tree, url, apply, template, mergeWith, SchematicsException } from '@angular-devkit/schematics';
import { buildDefaultPath } from '@schematics/angular/utility/project'
import { parseName } from '@schematics/angular/utility/parse-name'
import { Schema } from './schema';

import { strings } from '@angular-devkit/core';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function scssMigrate(_options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const glob = require("glob");
    const workspaceConfigBuffer = tree.read("/angular.json");

    if (!workspaceConfigBuffer) {
      throw new SchematicsException('Not an Angular CLI project')
    }


    const workspaceConfig = JSON.parse(workspaceConfigBuffer.toString());
    const projectName = workspaceConfig.defaultProject;
    const project = workspaceConfig.projects[projectName];
    const defaultProjectPath = buildDefaultPath(project);
    const parsedPath = parseName(defaultProjectPath, _options.name);
    const { path } = parsedPath;


    let filePaths = glob.sync(`.${path}/**/*.css`);

    console.log('Files to rename', filePaths);

    filePaths.forEach(filePath => {
      let content: Buffer;
      let filePathNoExtension: string = filePath.substr(0, filePath.lastIndexOf('.'));
      let fileName = filePathNoExtension.substr(filePathNoExtension.lastIndexOf('/') + 1, filePathNoExtension.length)
      let newFilePath = `${filePathNoExtension}.scss`;

      tree.rename(filePath, newFilePath);

      content = tree.exists(`${filePathNoExtension}.ts`) ? tree.read(`${filePathNoExtension}.ts`) : null;

      if (content) {
        const strContent = content.toString();
        const finalstr: string = strContent?.replace(`${fileName}.css`, `${fileName}.scss`);

        tree.overwrite(`${filePathNoExtension}.ts`, finalstr);
      }
    });


    return tree;
  };
}
