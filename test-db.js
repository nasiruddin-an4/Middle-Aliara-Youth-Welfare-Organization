const mongoose = require("mongoose");

const MONGODB_URI =
  "mongodb+srv://maywopudb:JYAuPPruAswreb7n@btrpdb.smocvcy.mongodb.net/maywopudb?retryWrites=true&w=majority&appName=btrpdb";

async function test() {
  console.log("Testing connection to:", MONGODB_URI.split("@")[1]); // Log host part only
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("SUCCESS: Connected to MongoDB");

    // Check if we can write
    const TestSchema = new mongoose.Schema({ name: String });
    const TestModel =
      mongoose.models.Test || mongoose.model("Test", TestSchema);
    await TestModel.create({ name: "test-" + Date.now() });
    console.log("SUCCESS: Wrote to MongoDB");

    await mongoose.connection.close();
    console.log("SUCCESS: Connection closed");
    process.exit(0);
  } catch (err) {
    console.error("FAILURE:", err);
    process.exit(1);
  }
}

test();
