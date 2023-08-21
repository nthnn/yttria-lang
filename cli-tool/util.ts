import fs from 'fs';
import ProjectStructure from './project_structure';

export class CLIToolUtil {
    public static prompt(message: string): string {
        let stdin: number = fs.openSync(
            '/dev/stdin',
            'rs'
        );
        fs.writeSync(process.stdout.fd, message);

        let str: string = '';
        let buf: Buffer = Buffer.alloc(1);

        fs.readSync(stdin,buf,0,1,null);
        while((buf[0] != 10) &&
            (buf[0] != 13)) {

            str += buf;
            fs.readSync(
                stdin, buf,
                0, 1,
                null
            );
        }

        return str;
    }

    public static isValidFolderName(
        folderName: string
    ): boolean {
        return /^[^\\/?%*:|"<>\.]+$/
            .test(folderName);
    }

    public static saveStructureToFile(
        projectStruct: ProjectStructure
    ): void {
        fs.writeFileSync(
            'yttria-config.json',
            JSON.stringify(projectStruct, null, 4)
        );
    }
}