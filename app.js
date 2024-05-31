const path = require("path");
const express = require("express");
const morgan = require("morgan");
const nunjucks = require("nunjucks");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");

const configuration = new GoogleGenerativeAI(process.env.API_KEY);
const modelId = "gemini-pro";
const model = configuration.getGenerativeModel({ model: modelId });

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
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

app.get("/streaming_request", (req, res) => {
  res.render("pages/streamingRequest.njk");
});

app.post("/streaming_request", async (req, res) => {
  const { inputPrompt } = req.body;
  const prompt = inputPrompt;
  const result = await model.generateContentStream(prompt);
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    console.log(chunkText);
    res.write(chunkText);
  }
});

app.get("/custom_needs", (req, res) => {
  res.render("pages/customNeeds.njk");
});

app.post("/custom_needs", async (req, res) => {
  const { destination, pax, currency, budget, season, duration, tripType } = req.body;
  console.log("==========");
  console.log(destination);
  const prompt = `Buatkan sebuah itinerary ke ${destination} untuk jumlah ${pax}
  orang dalam hitungan mata uang ${currency} dengan maksimal anggaran ${budget} 
  pada saat musim ${season} untuk durasi ${duration} hari dengan jenis liburan ${tripType}`;
  const result = await model.generateContentStream(prompt);
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    console.log(chunkText);
    res.write(chunkText);
  }
});

module.exports = app;
