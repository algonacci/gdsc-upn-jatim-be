const path = require("path");
const express = require("express");
const morgan = require("morgan");
const nunjucks = require("nunjucks");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const configuration = new GoogleGenerativeAI(process.env.API_KEY);
const modelId = "gemini-pro";
const model = configuration.getGenerativeModel({ model: modelId });

const app = express();
app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "./public")));
nunjucks.configure("views", {
  autoescape: true,
  express: app,
});
app.set("view engine", "njk");

app.get("/", (req, res) => {
  res.render("pages/index.njk");
});

app.get("/simple_gemini_api_request", (req, res) => {
  res.render("pages/simpleRequest.njk");
});

app.post("/simple_gemini_api_request", async (req, res) => {
  const { inputPrompt } = req.body;
  const prompt = inputPrompt;
  const result = await model.generateContent(prompt);
  console.log(result.response.text());
  res.render("pages/simpleRequest.njk", { response: result.response.text(), inputPrompt });
});

module.exports = app;
