import { Router } from 'express';
import config from '../config';
import twilio from 'twilio';

const authRouter = Router();

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

// Maximum number of seconds that a participant's video room session can last (4 hours)
const MAXIMUM_SESSION_DURATION = 14400;

/**
 * Get a token for a user for a video room
 */
authRouter.post('/token', async (request, response, next) => {

  // Get the userId and roomName from the request.
  const userId: string  = request.body.userId;
  const roomSid: string = request.body.roomSid;

  // Handle case where environment variables could be missing.
  if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_API_KEY || !config.TWILIO_API_SECRET) {
    return response.status(400).send({
      message: 'Unable to create access token'
    });
  }

  // Create an access token.
  const token = new AccessToken(
    config.TWILIO_ACCOUNT_SID,
    config.TWILIO_API_KEY,
    config.TWILIO_API_SECRET,
    { ttl: MAXIMUM_SESSION_DURATION }
  );

  // Associate this token with the user from the request.
  token.identity = userId;

  // Grant the access token Twilio Video capabilities.
  const grant = new VideoGrant({ room: roomSid });
  token.addGrant(grant);

  // Serialize the token to a JWT and include it in the JSON response.
  return response.status(200).send({
    userId: userId,
    roomSid: roomSid,
    token: token.toJwt(),
  });
});

export default authRouter;
