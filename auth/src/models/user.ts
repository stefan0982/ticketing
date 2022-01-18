import mongoose, { Model, Schema } from "mongoose";
import { Password } from "../services/password";

interface UserAttributes {
  email: string;
  password: string;
}

interface UserModel extends Model<UserDoc>{
  build(attrs: UserAttributes): UserDoc
}

// response when user is built
interface UserDoc extends mongoose.Document{
  email: string
  password: string
}

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
}, {
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id
      delete ret._id
      delete ret.password
    }
  }, versionKey: false
});

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'))
    this.set('password', hashed)
  }
  done()
})

userSchema.statics.build = (attrs: UserAttributes) => {
  return new User(attrs)
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

// const buildUser = (attrs: UserAttributes) => {
//     new Ticket(attrs)
// }

export { User }
