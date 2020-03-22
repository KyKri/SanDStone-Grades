const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const config = require('./config.json');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/sms', (req, res) => {
    console.log("Received post request to /sms.");
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
    if (words.length > 3 || isNaN(firstWord) || !(secondWord === "recent" || secondWord === "current") || thirdWord !== "grades") {
        twiml.message('Please send a messaging beginning with a student id number'
            + ' immediately followed by either "recent grades" or "current grades".'
            + ' For example:\n123456 recent grades');
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
        return;
    }

    let studentId = parseInt(firstWord);
    let whatsappId = req.body.From;

    // Make sure the whatsappId is not null or empty
    if (whatsappId == null || whatsappId == undefined || whatsappId == "") {
        console.log("whatsappId is null, unable to check grades.");
        res.writeHead(400);
        res.write("Whatsapp ID is null. Whatsapp ID must be included to check grades.");
        res.end();
        return;
    }

    whatsappId = whatsappId.substring(9);

    let authorized = false;

    isAuthorized(whatsappId, studentId).then((auth) => {
        authorized = auth;

        console.log("In /sms, authorized is: " + authorized);

        if (authorized === true) {
            twiml.message("You are authorized to check grades for student id: " + studentId + ".\nChecking grades.");
        }
        else {
            twiml.message("Either you are not authorized to check that student id or we do not have a student by that id.");
        }

        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
    });
});

async function isAuthorized(whatsappId, studentId) {
    console.log("Checking Authorizations for " + whatsappId);

    var con = await mysql.createConnection(config.connection);
    var authorized = false;

    try {
        const [rows, fields] = await con.execute(
            `SELECT whatsapp, student  
            FROM grade_authorizations
            WHERE whatsapp = ${whatsappId}
            AND student = ${studentId};`
        );
        if (rows.length > 0) {
            if (rows[0].whatsapp === whatsappId && rows[0].student === studentId) {
                authorized = true;
            }
        }
    } catch (err) {
        console.log(err);
    } finally {
        return authorized;
    }
}

var port = process.env.PORT || '3000';

http.createServer(app).listen(port, () => {
    console.log('Express server listening on port ' + port);
});