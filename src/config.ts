import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN
};

export default config;
