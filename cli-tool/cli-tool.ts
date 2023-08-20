import { hideBin } from 'yargs/helpers';

import colors from 'colors';
import yargs from 'yargs';
import { ProjectGenerator } from './project_generator';

function printBanner(args: any) {
    console.log();
    console.log('┌──────────────────────────────────────┐');
    console.log('│                                      │');

    // Here comes the wizardry.
    console.log(
        '│' + '  ▀▀▌' + '───────'.gray + '▐▀▀' + '                       │\n' +
        '│' + '  ▄▀' + '░'.blue + '◌'.bold + '░░░░░░░'.blue + '▀▄' + '  ┓┏            •'.cyan.bold + '      │\n' +
        '│' + ' ▐' + '░░'.blue + '◌'.bold + '░'.blue + '▄▀██▄█' + '░░░'.blue + '▌' + ' ┗┫  ╋  ╋  ┏┓  ┓  ┏┓'.cyan.bold + '  │\n' +
        '│' + ' ▐' + '░░░'.blue + '▀████▀▄' + '░░░'.blue + '▌' + ' ┗┛  ┗  ┗  ┛   ┗  ┗┻'.cyan.bold + '  │\n' +
        '│' + ' ▐' + '░░░░░░░░░░░░░'.blue + '▌ ' + '      CLI Tool      '.bgRed + ' │\n' +
        '│' + '  ▀▄▄▄▄▄▄▄▄▄▄▄▀' + '  v0.0.1'.yellow.bold + '               │\n' +
        '│                                      │'
    );

    if(args.help || args.h) {
        console.log(
            '├──────────────────────────────────────┤\n' +
            '│ Argument Parameters:                 │\n' +
            '│  --init, -i     Init a new project.  │\n' +
            '└──────────────────────────────────────┘\n'
        );
    }
    else if(!args.help && !args.init &&
        !args.update && !args.h &&
        !args.i && !args.h) {
        console.log(
            '├──────────────────────────────────────┤\n' +
            '│ Use ' + '-h'.italic + ' to print help screen.         │\n' +
            '│                                      │\n' +
            '│ For more details, visit:             │\n' +
            '│ ' + 'https://nthnn.github.io/yttria-lang'.underline + '  │\n' +
            '└──────────────────────────────────────┘\n'
        );
    }
    else console.log('└──────────────────────────────────────┘\n');
}

function main(): void {
    const args: any = yargs(hideBin(process.argv))
        .option('help', {
            alias: 'h',
            type: 'boolean'
        })
        .option('init', {
            alias: 'i',
            type: 'boolean'
        })
        .showHelp(()=> { })
        .exitProcess(false)
        .argv;

    colors.enable();
    printBanner(args);

    if(args.init || args.i)
        ProjectGenerator.run();
}

main();