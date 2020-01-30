const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const app = express();

app.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();

  twiml.message('Hello there! -Obi Wan Kenobi, Star Wars Epsidoe III');

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

var port = process.env.PORT || '3000';

http.createServer(app).listen(port, () => {
  console.log('Express server listening on port ' + port);
});