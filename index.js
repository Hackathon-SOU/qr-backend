const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const YAML = require('yamljs');
require("dotenv").config();
const logger = require('./utils/logger');
const path = require('path');
const app = express();

const swaggerUi = require('swagger-ui-express');

const ROOT_FOLDER = path.join(__dirname, '..');
const SRC_FOLDER = path.join(ROOT_FOLDER, 'src');
const {
    notFound,
    errorHandling
} = require('./middleware/errorHandler');





const swaggerDocument = YAML.load(path.join(path.resolve(), './docs/swagger.yml'));
// const options = {
//     customCssUrl: path.join(path.resolve(), './public/swagger-ui-dist/swagger-ui.css'),
// }
// app.use('/public', express.static(path.join(path.resolve(), './public')));
app.use('/api/api-docs', swaggerUi.serve);
app.get('/api/api-docs', swaggerUi.setup(swaggerDocument));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cors());
const mongodbString = process.env.DATABASE_URL;
mongoose.connect(mongodbString);
const database = mongoose.connection;

const options = {
    customCssUrl: '/public/swagger-ui.css',
    customSiteTitle: "The Words That I Know API - Swagger"
};

app.use('/public', express.static(path.join(SRC_FOLDER, 'public')));
app.use('/', swaggerUi.serve);
app.get('/', swaggerUi.setup(swaggerDocument, options));


database.once("connected", () => {
    logger.info("Database is connected");
});
app.use("/api/admin", require("./routes/admin"));
app.use("/api/canteen", require("./routes/canteen"));
app.use("/api/participant", require("./routes/participant"));


app.use(notFound);
app.use(errorHandling);
let port = process.env.port || 4000;
app.listen(port, () => {
    logger.debug(`Server is running on port ${port}`);
});