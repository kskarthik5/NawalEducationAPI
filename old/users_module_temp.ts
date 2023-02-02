import { Schema, model, connect } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
interface IUser {
    name: String,
    email: String,
    password: String,
    role: String
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true }
});

// 3. Create a Model.
const User = model<IUser>('User', userSchema);

run().catch(err => console.log(err));

async function run() {
  // 4. Connect to MongoDB
  await connect('mongodb+srv://admin:admin@cluster0.awxdryi.mongodb.net/users?retryWrites=true&w=majority');

  const user = new User({
    name: "Test user",
    email: "test@gmail.com",
    password: "password",
    role: "Student"
  });
  await user.save();

  console.log(user.email); // 'bill@initech.com'
}