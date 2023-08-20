import { CLIToolUtil } from './util';

import colors from 'colors';
import os from 'os';
import path from 'path';

export interface ProjectStructure {
    name: string,
    description: string,
    authors: Array<string>,
    version: string,
    url: string,
    sourceFolder: string,
    outputFolder: string,
    projectType: string
}

export class ProjectGenerator {
    public static run() {
        const projectStruct: ProjectStructure = {
            name: path.basename(__dirname),
            description: '',
            authors: [os.userInfo().username],
            version: '0.0.1',
            url: 'none',
            sourceFolder: 'src',
            outputFolder: 'dist',
            projectType: ''
        };

        colors.enable();
        console.log('  Configure new project (^C to exit)');

        (async()=> {
            let name: string = CLIToolUtil.prompt(
                '  ▸ Project name '.cyan.bold +
                ('(' + projectStruct.name + ')')
                    .blue.italic + ': '
            );

            if(name != '')
                projectStruct.name = name;

            let description: string = CLIToolUtil.prompt(
                '  ▸ Description '.cyan.bold +
                ('(empty)')
                    .blue.italic + ': '
            );

            if(description)
                projectStruct.description = description;

            let authors: string = CLIToolUtil.prompt(
                '  ▸ Authors '.cyan.bold +
                ('(' + projectStruct.authors.join(',').toString() + ')')
                    .blue.italic + ': '
            );

            if(authors)
                projectStruct.authors = authors.split(',');

            let version: string = CLIToolUtil.prompt(
                '  ▸ Vesion '.cyan.bold +
                ('(' + projectStruct.version + ')')
                    .blue.italic + ': '
            );

            if(version)
                projectStruct.version = version;

            let url: string = CLIToolUtil.prompt(
                '  ▸ Project URL '.cyan.bold +
                ('(' + projectStruct.url + ')')
                    .blue.italic + ': '
            );
    
            if(url)
                projectStruct.url = url;
        })();
    }
}