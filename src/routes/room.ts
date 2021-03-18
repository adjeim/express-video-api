import config from '../config';
import { Router } from 'express';
import twilio from 'twilio';

interface Room {
  name: string;
  sid: string;
}

const roomsRouter = Router();
const twilioClient = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);


/**
 * Create a new room
 */

roomsRouter.post('/create', async (request, response, next) => {

  // Get the room name from the request body. If a room name wasn’t included in the request, default to an empty string to avoid throwing errors
  const roomName: string = request.body.roomName || '';

  try {
    // Call the Twilio video API to create the new room
    let room = await twilioClient.video.rooms.create({
        uniqueName: roomName,
        type: 'group'
      });

      // Return the room details in the response
      return response.status(200).send(room)

  } catch (error) {
    // If something went wrong, handle the error
    return response.status(400).send({
      message: `Unable to create new room with name=${roomName}`,
      error
    });
  }
});

/**
 * Get a specific room by its SID (unique identifier)
 *
 * (You can also get rooms by name, but this only works for in-progress rooms.)
 */

roomsRouter.get('/:sid', async (request, response, next) => {
  const sid: string = request.params.sid;

  try {
    // Call the Twilio video API to retrieve the room you created
    let room = await twilioClient.video.rooms(sid).fetch();

    return response.status(200).send({room});

  } catch (error) {
    return response.status(400).send({
      message: `Unable to get room with sid=${sid}`,
      error
    });
  }
});

/**
* List active rooms
* (You can also select other ways to filter/list! For the purposes of this tutorial though, just the in-progress rooms will be returned.)
*/
roomsRouter.get('/', async (request, response, next) => {
  try {
    // Get the last 20 rooms that are still currently in progress
    let rooms = await twilioClient.video.rooms.list({status: 'in-progress', limit: 20});

    // If there are no in-progress rooms, return this message response early
    if (!rooms.length) {
      return response.status(200).send({message: 'No active rooms found'});
    }

    // If there are active rooms, create a new array of `Room` objects that will hold this list
    let activeRooms: Room[] = [];

    // Then for each room, take only the data you need and push it into the activeRooms array
    rooms.forEach((room) => {
      const roomData: Room = {
        sid: room.sid,
        name: room.uniqueName
      }

      activeRooms.push(roomData);

      return response.status(200).send({activeRooms});
    });

  } catch (error) {
    return response.status(400).send({
      message: `Unable to list active rooms`,
      error
    });
  }
});

/**
* Complete a room (updates the status to "completed" with a request to end the room and disconnect the participants)
* This does not delete the room; it only updates the room’s status.
*/

roomsRouter.post('/complete/:sid', async (request, response, next) => {
  // Get the SID from the request parameters
  const sid: string = request.params.sid;

  try {
    // Update the status from ‘in-progress’ to ‘completed’
    let room = await twilioClient.video.rooms(sid).update({status: 'completed'})

    // Return the details about which room was closed, as a Room object
    const closedRoom: Room = {
      sid: room.sid,
      name: room.uniqueName,
    }

    return response.status(200).send({closedRoom});

  } catch (error) {
    return response.status(400).send({
      message: `Unable to complete room with sid=${sid}`,
      error
    });
  }
});

export default roomsRouter;
