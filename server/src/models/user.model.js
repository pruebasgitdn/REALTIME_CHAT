import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    profilePic: {
      public_id: { type: String },
      url: { type: String },
    },
  },
  { timestamps: true }
);

//HASHEAR passwordS
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//Comparar passwords hasheadas
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//Generar JSONTOKEN
userSchema.methods.generateJWT = function () {
  //Firma el token con el _id
  return jwt.sign(
    {
      id: this._id,
      fullName: this.fullName,
      email: this.email,
      profilePic: this.profilePic,
      createdAt: this.createdAt,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES,
    }
  );
};

const User = mongoose.model("User", userSchema);
export default User;
