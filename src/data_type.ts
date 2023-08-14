class DataType {
    private name: string;

    public constructor(name: string) {
        this.name = name;
    }

    public static STRING: DataType = new DataType("string");
}

export default DataType;