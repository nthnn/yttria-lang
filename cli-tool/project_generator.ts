import { CLIToolUtil } from './util';
import { isWebUri } from 'valid-url';

import colors from 'colors';
import os from 'os';
import path from 'path';
import ProjectStructure from './project_structure';

import * as semver from 'semver';
import { exec, execSync } from 'child_process';

export class ProjectGenerator {
    private static getProjectName(
        projectStruct: ProjectStructure
    ): void {
        let name: string = '';
        let getName = ()=> {
            name = CLIToolUtil.prompt(
                '  ▸ Project name '.cyan.bold +
                ('(' + projectStruct.name + ')')
                    .blue.italic + ': '
            );
        };

        getName();
        while(name != '' &&
            !/^[A-Za-z\s\-']+$/.test(name))
            getName();

        if(name != '')
            projectStruct.name = name;
    }

    private static getDescription(
        projectStruct: ProjectStructure
    ): void {
        let description: string = CLIToolUtil.prompt(
            '  ▸ Description '.cyan.bold +
            ('(empty)')
                .blue.italic + ': '
        );

        if(description)
            projectStruct.description = description
                .replace('\"', '\\\"')
                .replace('\'', '\\\'');
    }

    private static getAuthors(
        projectStruct: ProjectStructure
    ): void {
        let authors: string = '';
        let getAuthors = ()=> {
            authors = CLIToolUtil.prompt(
                '  ▸ Authors '.cyan.bold +
                ('(' + projectStruct.authors
                    .join(',').toString() + ')')
                    .blue.italic + ': '
            )
        };
        let hasAnInvalidAuthor = ()=> {
            let hasInvalid: boolean = false;
            authors.split(',')
                .forEach(username => {
                    if(!/^[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38}$/
                        .test(username))
                        hasInvalid = true;
                });

            return hasInvalid;
        }

        getAuthors();
        while(authors != '' &&
            hasAnInvalidAuthor())
            getAuthors();

        if(authors)
            projectStruct.authors =
                authors.split(',');
    }

    private static getVersion(
        projectStruct: ProjectStructure
    ): void {
        let version: string = '';
        let getVersion = ()=> {
            version = CLIToolUtil.prompt(
                '  ▸ Vesion '.cyan.bold +
                ('(' + projectStruct.version + ')')
                    .blue.italic + ': '
            );
        };

        getVersion();
        while(version != '' &&
            semver.valid(version) === null)
            getVersion();

        version = semver.clean(version) as string;
        if(version)
            projectStruct.version = version;
    }

    private static getUrl(
        projectStruct: ProjectStructure
    ): void {
        let url: string = '';
        let getUrl = ()=> {
            url = CLIToolUtil.prompt(
                '  ▸ Project URL '.cyan.bold +
                ('(' + projectStruct.url + ')')
                    .blue.italic + ': '
            );
        };

        getUrl();
        while(url != '' &&
            !isWebUri(url))
            getUrl();

        if(url)
            projectStruct.url = url;
    }

    private static getSourceFolder(
        projectStruct: ProjectStructure
    ): void {
        let sourceFolder: string = '';
        let getSourceFolder = ()=> {
            sourceFolder = CLIToolUtil.prompt(
                '  ▸ Source folder '.cyan.bold +
                ('(' + projectStruct.sourceFolder + ')')
                    .blue.italic + ': '
            );
        };

        getSourceFolder();
        while(sourceFolder != '' &&
            !CLIToolUtil.isValidFolderName(sourceFolder))
            getSourceFolder();

        if(sourceFolder)
            projectStruct.sourceFolder = sourceFolder;
    }

    private static getOutputFolder(
        projectStruct: ProjectStructure
    ): void {
        let outputFolder: string = '';
        let getOutputFolder = ()=> {
            outputFolder = CLIToolUtil.prompt(
                '  ▸ Output folder '.cyan.bold +
                ('(' + projectStruct.outputFolder + ')')
                    .blue.italic + ': '
            );
        };

        getOutputFolder();
        while(outputFolder != '' &&
            !CLIToolUtil.isValidFolderName(outputFolder))
            getOutputFolder();

        if(outputFolder)
            projectStruct.outputFolder = outputFolder;
    }

    private static getTarget(
        projectStruct: ProjectStructure
    ): void {
        let targetArchs: Array<string> = [];
        let execResult: string = execSync('llc --version')
            .toString();

        execResult.split('Targets:')[1]
            .split('\n')
            .forEach(line => {
                let arch: string = line
                    .split(' - ')[0]
                    .trim();

                if(arch == '')
                    return;
                targetArchs.push(arch);
            });

        projectStruct.target =
            execResult
                .split('target: ')[1]
                .split('-pc')[0];

        let target: string = '';
        let getTarget = ()=> {
            target = CLIToolUtil.prompt(
                '  ▸ Target '.cyan.bold +
                ('(' + projectStruct.target + ')')
                    .blue.italic + ': '
            );
        };

        getTarget();
        while(target != '' &&
            targetArchs.indexOf(target) == -1)
            getTarget();

        if(target)
            projectStruct.target =
                target;
    }

    public static run() {
        const projectStruct: ProjectStructure = {
            name: path.basename(__dirname),
            description: '',
            authors: [os.userInfo().username],
            version: '0.0.1',
            url: 'none',
            sourceFolder: 'src',
            outputFolder: 'dist',
            target: ''
        };

        colors.enable();
        console.log('  Configure new project (^C to exit)');

        (async()=> {
            ProjectGenerator.getProjectName(projectStruct);
            ProjectGenerator.getDescription(projectStruct);
            ProjectGenerator.getAuthors(projectStruct);
            ProjectGenerator.getVersion(projectStruct);
            ProjectGenerator.getUrl(projectStruct);
            ProjectGenerator.getSourceFolder(projectStruct);
            ProjectGenerator.getOutputFolder(projectStruct);
            ProjectGenerator.getTarget(projectStruct);
        })();

        CLIToolUtil.saveStructureToFile(projectStruct);
    }
}