import express from "express";
import cors from "cors";
import http from "http";
import bodyParser from "body-parser";

import jwtAccessToken from "./api/jwtAccessToken";
import profile from "./api/profile";
import randomMessage from "./api/randomMessage";

const app = express();
const httpServer = http.createServer(app);
const port = 8182;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/ping", (_, res) => {
  res.status(200).send("pong");
});

app.use("/jwtAccessToken", async (req, res) => {
  const result = await jwtAccessToken(req.body);
  res.send(result);
});

app.use("/randomMessage", async (_, res) => {
  const result = await randomMessage();
  res.send(result);
});

app.use("/profile", async (req, res) => {
  const result = await profile(req.body);
  res.send(result);
});

export default () => {
  return httpServer.listen(port, function () {
    console.log("Listening http://localhost:" + port);
  });
};
