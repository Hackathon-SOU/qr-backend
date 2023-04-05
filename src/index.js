const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const httpStatus = require("http-status");
require("dotenv").config();
const logger = require("./utils/logger");
const path = require("path");
const app = express();

// const swaggerUi = require('swagger-ui-express');

const ApiError = require("../src/utils/ApiError");

const { errorConverter, errorHandler } = require("./middleware/error");

const ROOT_FOLDER = path.join(path.resolve(), ".");

var whitelist = ["http://localhost:5000", "https://eventpad.live"];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use((req, res, next) => {
  res.append("Access-Control-Allow-Headers", "Content-Type");
  next();
});
let mongodbString = process.env.DATABASE_DEV_URL;
if (process.env.ENV === "production") {
  logger.info("production");
  mongodbString = process.env.DATABASE_PROD_URL;
  app.use(cors(corsOptions));
} else if (process.env.ENV === "development") {
  logger.info("development");
  mongodbString = process.env.DATABASE_DEV_URL;
  app.use(cors());
}
mongoose.connect(mongodbString);
const database = mongoose.connection;

database.once("connected", () => {
  logger.info("Database is connected");
});

// const swaggerDocument = YAML.load(path.join(path.resolve(), './src/docs/swagger.yml'));
// const options = {
//     customCssUrl: './public/swagger-ui.css',
//     customSiteTitle: "Qr Server API - Swagger"
// };
// app.use('/uploads', express.static(path.join(ROOT_FOLDER, 'uploads')));
// app.use('/api/api-docs/swagger-ui.css', express.static(path.join(ROOT_FOLDER, 'public/swagger-ui.css')));
// app.use('/api/api-docs', swaggerUi.serve);
// app.use('/api/api-docs', swaggerUi.setup(swaggerDocument, options));

app.use("/api/admin", require("./routes/admin"));
app.use("/api/canteen", require("./routes/canteen"));
app.use("/api/participant", require("./routes/participant"));

app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not Found"));
});
app.use(errorConverter);
app.use(errorHandler);
let port = process.env.port || 4000;
app.listen(port, () => {
  logger.debug(`Server is running on port ${port}`);
});
