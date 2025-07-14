import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.statusCode(200).json({
    message: "Hello, World!",
  });
});

app.listen(5555, () => {
  console.log("Server is running on port 5555");
});
