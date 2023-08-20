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

export var CompileTarget: ProjectStructure = {
    name: path.basename(__dirname),
    description: '',
    authors: [os.userInfo().username],
    version: '0.0.1',
    url: 'none',
    sourceFolder: 'src',
    outputFolder: 'dist',
    projectType: ''
};