import { Mongoose } from "mongoose";

const roleSchema = new Mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
})
export default Mongoose.model('Role', roleSchema)