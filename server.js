const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/sms', (req, res) => {
    const twiml = new MessagingResponse();

    if (req.body.Body === null || req.body.Body === undefined) {
        res.writeHead(400);
        res.write("Body must include a message.");
        res.end();
        return;
    }

    let words = req.body.Body.split(' ');
    let firstWord = words[0];
    let secondWord = words[1];
    let thirdWord = words[2];

    // Make sure that that the message is of the form "[id] [current/recent] grades"
    if (isNaN(firstWord) || !(secondWord === "recent" || secondWord ===  "current") || thirdWord !== "grades") {
        twiml.message('Please send a messaging beginning with a student id number'
            + ' immediately followed by either "recent grades" or "current grades".'
            + ' For example:\n123456 recent grades');
    } else {
        twiml.message('Checking ' + secondWord + ' grades for ' + firstWord);
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});

var port = process.env.PORT || '3000';

http.createServer(app).listen(port, () => {
    console.log('Express server listening on port ' + port);
});