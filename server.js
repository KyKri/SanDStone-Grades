const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const mysql = require('mysql');
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
    if (isNaN(firstWord) || !(secondWord === "recent" || secondWord === "current") || thirdWord !== "grades") {
        twiml.message('Please send a messaging beginning with a student id number'
            + ' immediately followed by either "recent grades" or "current grades".'
            + ' For example:\n123456 recent grades');
    }

    let studentId = firstWord;
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

    let authorized = isAuthorized(whatsappId, studentId);

    if (authorized === true) {
        twiml.message("You are authorized to check grades for student id: " + studentId + ".\nChecking grades.");
    }
    else {
        twiml.message("Either you are not authorized to check that student id or we do not have a student by that id.");
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});

async function isAuthorized(whatsappId, studentId) {
    console.log("Checking Authorizations for " + whatsappId);

    var con = mysql.createConnection(config.connection);
    var authorized = false;

    con.connect((err) => {
        if (err) {
            throw err;
        }

        console.log("DB connection opened.");

        con.query(`SELECT whatsapp 
                    FROM grade_authorizations
                    WHERE whatsapp = ${whatsappId}
                    AND student = ${studentId};`,
            (err, result) => {
                if (err) {
                    throw err;
                }
                console.log(result.length);
                if (result.length > 0) {
                    authorized = true;
                }
                con.end((err) => {
                    if (err)
                        throw err;
                    console.log("DB connection closed.");
                    console.log("Authorized is: " + authorized);
                    return authorized;
                });
            });
    });
}

function connectionTest() {
    var con = mysql.createConnection(config.connection);

    con.connect((err) => {
        if (err) {
            throw err;
        }
        console.log("Connected to the MySQL DB!");
        con.query('SELECT * FROM students;', (err, result) => {
            if (err) {
                throw err;
            }
            console.log(result[0].id, result[0].firstname, result[0].lastname);
        });

        con.end((err) => {
            if (err)
                throw err;
            console.log("Connection closed");
        });
    });
}

var port = process.env.PORT || '3000';

http.createServer(app).listen(port, () => {
    console.log('Express server listening on port ' + port);
});