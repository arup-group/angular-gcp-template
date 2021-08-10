const express = require('express');
const app = express();
const _app_folder = 'dist/<YOUR_PROJECT>-frontend';
app.use(express.static(_app_folder));


// ---- SERVE STATIC FILES ---- //
app.get('*.*', express.static(_app_folder, {maxAge: '1y'}));

// ---- SERVE APLICATION PATHS ---- //
app.all('*', function (req, res) {
  res.status(200).sendFile(`/`, {root: _app_folder});
});

// app.all('/', function (req, res,next) {
//   next()
// });
app.listen(8080,function () {
  console.log("Node Express server for " + app.name + " listening on http://localhost:8080");
})

