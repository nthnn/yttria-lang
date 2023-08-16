import { createHash, randomUUID } from "crypto";

class YttriaUtil {
    public static generateRandomHash(): string {
        return '__' + randomUUID()
        .replace('-', '').substring(0, 12);
    }

    public static generateHash(base: string): string {
        return '__' + createHash('md5')
        .update(base)
        .digest('hex')
        .substring(0, 10);
    }
}

export default YttriaUtil;