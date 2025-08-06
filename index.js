import express from "express";
import 'dotenv/config';
import Nylas from "nylas";

const nylasConfig = {
  clientId: process.env.NYLAS_CLIENT_ID,
  apiKey: process.env.NYLAS_API_KEY,
  apiUri: process.env.NYLAS_API_URI,
};

const nylas = new Nylas({
  apiKey: nylasConfig.apiKey,
  apiUri: nylasConfig.apiUri,
});


const app = express();

// Add the express.json() middleware to parse JSON request bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// This is the endpoint that Nylas will call to send webhook events
// It should respond with a 200 status code to acknowledge receipt of the event
// The event data will be in the request body, and you can process it as needed
app.post("/webhook/nylas", (req, res) => {
  const emailSubject = req.body.data.object.subject;
  if (emailSubject){
    console.log('email subject: ', emailSubject);
    if (emailSubject.toLowerCase().includes('inquiry') || emailSubject.toLowerCase().includes('inquiries')) {
      console.log("event from email inquiry: ", JSON.stringify(req.body.data));
    } else {
      console.log("The email does not contain inquiry or inquiries.");
    }
  }
  
  return res.status(200).end();
});

// Verify the webhook by responding to the challenge parameter
// This is the endpoint that Nylas will call to verify the webhook
// It should respond with the challenge code sent by Nylas
// This is typically used when you first set up the webhook
// and Nylas sends a challenge code to verify the endpoint.
app.get("/webhook/nylas", (req, res) => {
  if (req.query.challenge) {
    console.log(`Received challenge code! - ${req.query.challenge}`);

    return res.send(req.query.challenge);
  }
});


app.listen(process.env.APP_PORT, () => {
  console.log(`Server listening at http://localhost:${process.env.APP_PORT}`);
  console.log(`Webhook endpoint is available at http://localhost:${process.env.APP_PORT}/webhook/nylas`);
});