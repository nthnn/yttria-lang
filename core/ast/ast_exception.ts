export default class ASTError {
    private message: string;

    public constructor(message: string) {
        this.message = message;
    }

    public toString(): string {
        return this.message;
    }
}