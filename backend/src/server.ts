import app from "./app.js";

const port = Number(process.env.PORT ?? 10000);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
