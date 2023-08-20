import { hideBin } from 'yargs/helpers';

import colors from 'colors';
import yargs from 'yargs';

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

    if(args.help || args.h ||
        args._.length == 0) {

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
    const args = yargs(hideBin(process.argv))
        .option('help', {
            alias: 'h',
            type: 'boolean'
        })
        .showHelp(()=> { })
        .exitProcess(false)
        .argv;

    colors.enable();
    printBanner(args);
}

main();