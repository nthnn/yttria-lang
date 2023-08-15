class DataType {
    private name: string;

    public constructor(name: string) {
        this.name = name;
    }

    public static STRING: DataType = new DataType("string");

    public static I4: DataType = new DataType("i4");
    public static I8: DataType = new DataType("i8");
    public static I16: DataType = new DataType("i16");
    public static I32: DataType = new DataType("i32");
    public static I64: DataType = new DataType("i64");
    public static I128: DataType = new DataType("i128");

    public static F16: DataType = new DataType("f16");
    public static F32: DataType = new DataType("f32");
    public static F64: DataType = new DataType("f64");
    public static F128: DataType = new DataType("f128");
}

export default DataType;