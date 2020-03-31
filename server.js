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

    // Make sure that we got a message from Twilio
    if (req.body.Body === null || req.body.Body === undefined) {
        res.writeHead(400);
        res.write("Requests must include a message.");
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
    if (whatsappId === null || whatsappId === undefined || whatsappId === "") {
        console.log("whatsappId is null, unable to check grades.");
        res.writeHead(400);
        res.write("Whatsapp ID is null. Whatsapp ID must be included to check grades.");
        res.end();
        return;
    }

    // Strip off the first 9 characters, as Twilio prepends "whatsapp:" to the id
    whatsappId = whatsappId.substring(9);

    asyncMain(whatsappId, studentId, secondWord).then((message) => {
        twiml.message(message);
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
    });
});

// Async handler to call other async functions
async function asyncMain(whatsappId, studentId, secondWord) {
    let message = '';

    // Check that the whatsappId is authorized to check grades for the provided studentId
    let authorization = await isAuthorized(whatsappId, studentId);

    // Either something went wrong, or the whatsappId is not authorized
    if (authorization.auth === false || authorization.err === true) {
        message = authorization.msg;
        return message;
    }

    // Depending on what was requested, check either recent or current grades
    if (secondWord === 'recent') {
        let grades = await recentGrades(studentId);

        if (grades.err) {
            message = grades.msg;
            return message;
        }

        message = grades.msg;
    }
    return message;
}

// Checks if the requesting Whatsapp id is authorized 
// to check the grades of the specified student id
async function isAuthorized(whatsappId, studentId) {
    console.log("Checking Authorizations for " + whatsappId);

    var authorization = {
        auth: false,
        err: false,
        msg: "Either you are not authorized to check that student id or we do not have a student by that id."
    };

    // Try connecting to the database
    try {
        var con = await mysql.createConnection(config.connection);
    } catch (err) {
        console.log("Error connecting to DB:\n" + err);
        authorization.err = true;
        authorization.msg = "Sorry, we had some trouble on our end. Please try again later. Error #66.";
        return authorization;
    }

    // Try querying the database to see if the whatsappId is authorized for the studentId
    try {
        const [rows, fields] = await con.execute(
            `SELECT whatsapp, student  
            FROM grade_authorizations
            WHERE whatsapp = ${whatsappId}
            AND student = ${studentId};`
        );
        if (rows.length > 0) {
            // The whatsappId is authorized
            if (rows[0].whatsapp === whatsappId && rows[0].student === studentId) {
                authorization.auth = true;
                authorization.msg = "You are authorized to check grades for student id " + studentId + ".\nChecking grades.";
            }
        }
    } catch (err) {
        console.log("Error querying DB:\n" + err);
        authorization.err = true;
        authorization.msg = "Sorry, we had some trouble on our end. Please try again later. Error #67."
    } finally {
        return authorization;
    }
}

// Returns recent grades on assignments for the specified student id
async function recentGrades(studentId) {
    var grades = {
        err: false,
        msg: 'It seems there are no recent grades for the student with id ' + studentId
    };

    // Try connecting to the database
    try {
        var con = await mysql.createConnection(config.connection);
    } catch (err) {
        console.log("Error connecting to DB:\n" + err);
        grades.err = true;
        grades.msg("Sorry, we had some trouble on our end. Please try again later. Error #68.");
    }

    // Try getting the recent grades for the studentId, if any
    try {
        const [rows, fields] = await con.execute(
            `SELECT assignments.name AS assignment, grades.points, assignments.maxpoints, subjects.name AS subject
            FROM grades
            JOIN assignments
            ON grades.assignment = assignments.id
            JOIN subjects
            ON assignments.subject = subjects.id
            WHERE grades.student = ${studentId};`
        );

        // If rows is greater than zero, then we have have some grades for the studentId
        if (rows.length > 0) {
            grades.msg = 'Recent grades for student with id ' + studentId + ' are:\n';
            for (let i = 0; i < rows.length; i++) {
                grades.msg += (rows[0].subject + ": " + rows[0].assignment + " - " + rows[0].points + "/" + rows[0].maxpoints + "\n");
            }
        }
    } catch (err) {
        console.log("Error querying DB:\n" + err);
        grades.err = true;
        grades.msg = "Sorry, we had some trouble on our end. Please try again later. Error #69."
    } finally {
        return grades;
    }
}

// Returns current class grades for the specified student id 
async function currentGrades() {

}

var port = process.env.PORT || '3000';

http.createServer(app).listen(port, () => {
    console.log('Express server listening on port ' + port);
});