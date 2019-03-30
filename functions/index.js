const functions = require('firebase-functions');
const sendgrid = require('sendgrid');
const cors = require('cors')({
    origin: true
});
const client = sendgrid(functions.config().sendgrid.apikey);

function parseBody(body) {
    var helper = sendgrid.mail;
    var fromEmail = new helper.Email("no-reply@tobiak.com");
    var toEmail = new helper.Email("contact@tobiak.com");
    var subject = `tobiak.com - Contact info - ${body.subject}`;
    var message = `Name: <strong>${body.name}</strong><br>Email: <strong>${body.email}</strong><br><br> Message:<br><strong>${body.message}<strong>`
    var content = new helper.Content('text/html', message);
    var mail = new helper.Mail(fromEmail, subject, toEmail, content);
    return mail.toJSON();
}

exports.httpEmail = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        return Promise.resolve().then(() => {
            if (req.method !== 'POST') {
                const error = new Error('Only POST requests are accepted');
                error.code = 405;
                throw error;
            }

            const request = client.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: parseBody(req.body)
            });

            return client.API(request)
        }).then((response) => {
            if (response.body) {
                res.send(response.body);
            } else {
                res.end();
            }
        }).catch((err) => {
            console.error(err);
            return Promise.reject(err);
        });
    });
});