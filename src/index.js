import express from "express";

const app = express();
const port = 3000;
const chefRouter = require("./routes/chefsRoutes");

app.use(express.json());
app.use("/chefs", chefRouter);

app.listen(port, () => console.log(`Server is on port: ${port}`));
