const express = require('express');
var cors = require('cors');
// const bodyParser = require('body-parser');

const API_PORT = process.env.PORT || 3001;
const app = express();
app.use(cors());
const router = express.Router();

router.get('/media', (req, res) => {
  // Data.find((err, data) => {
  //   if (err) return res.json({ success: false, error: err });
  //   return res.json({ success: true, data: data });
  // });
});

console.log('port', API_PORT);
app.listen(API_PORT, () => console.log(`SERVER LISTENING ON PORT ${API_PORT}`));
