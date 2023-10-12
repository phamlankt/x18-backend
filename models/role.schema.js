import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
          },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default RoleSchema;
