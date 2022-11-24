const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const YAML = require('yamljs');
require("dotenv").config();
const logger = require('./utils/logger');
const path = require('path');
const swaggerUi = require('swagger-ui-express');


const {
    notFound,
    errorHandling
} = require('./middleware/errorHandler');


const mongodbString = process.env.DATABASE_URL;
mongoose.connect(mongodbString);
const database = mongoose.connection;

database.on("error", (error) => {
    logger.error("Database is not connected==> %o", error);
});

database.once("connected", () => {
    logger.info("Database is connected");
});


const options = {
    customCss: '.swagger-ui .topbar { display: none }',
};
const swaggerDocument = YAML.load(path.join(path.resolve(), './docs/swagger.yml'));

const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cors());
app.use(
    '/api/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, options)
);
app.use("/api/admin", require("./routes/admin"));
app.use("/api/canteen", require("./routes/canteen"));
app.use("/api/participant", require("./routes/participant"));


app.use(notFound);
app.use(errorHandling);
let port = process.env.port || 4000;
app.listen(port, () => {
    logger.debug(`Server is running on port ${port}`);
});