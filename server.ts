import express from "express";
import mongoose, { Schema, Document } from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ---- MongoDB Connection ----
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecoscholardb";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ---- User Model ----
interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);

// ---- Routes ----

// Health check
app.get("/", (_req, res) => {
  res.send("🌍 ECOScholar Backend Running");
});

// Create User
app.post("/api/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already exists" });

    const user = new User({ name, email, passwordHash: password });
    await user.save();

    res.status(201).json({ message: "User created", id: user._id });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get Users
app.get("/api/users", async (_req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ---- Start Server ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
