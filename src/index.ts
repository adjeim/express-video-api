import express from 'express';
import roomsRouter from './routes/room';

const app = express();

app.use(express.json());

// Forward requests for the /rooms URI to our rooms router
app.use('/rooms', roomsRouter);

app.listen(5000, () => {
  console.log('Express server listening on port 5000');
});
