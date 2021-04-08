import express from 'express';
import cors from 'cors';
import config from './config';
import roomsRouter from './routes/room';
import authRouter from './routes/auth';
import { Twilio } from 'twilio';

// Initialize Twilio client
const getTwilioClient = () => {
  if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_API_KEY || !config.TWILIO_API_SECRET) {
    throw new Error(`Unable to initialize Twilio client`);
  }
  return new Twilio(config.TWILIO_API_KEY, config.TWILIO_API_SECRET, { accountSid: config.TWILIO_ACCOUNT_SID })
}

export const twilioClient = getTwilioClient();

const app = express();

// Add a list of allowed origins.
// If you have more origins you would like to add, you can add them to the array below.
const allowedOrigins = ['http://localhost:3000'];

const options: cors.CorsOptions = {
  origin: allowedOrigins
};

// Then pass these options to cors:
app.use(cors(options));

app.use(express.json());

// Forward requests for the /auth URI to our auth router
app.use('/auth', authRouter);

// Forward requests for the /rooms URI to our rooms router
app.use('/rooms', roomsRouter);

app.listen(5000, () => {
  console.log('Express server listening on port 5000');
});
