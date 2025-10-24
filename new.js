// updatePlacesWithDestinationName.js

const { MongoClient, ObjectId } = require('mongodb');

async function updatePlaces() {
  const uri = 'mongodb+srv://travella:travella@prasanth.kxcqdtd.mongodb.net/travella?retryWrites=true&w=majority'; // Replace with your MongoDB connection string
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('travella'); // Replace with your DB name
    const places = db.collection('places');
    const destinations = db.collection('destinations');

    // Cursor to iterate all places
    const cursor = places.find();

    while (await cursor.hasNext()) {
      const place = await cursor.next();

      const dest = await destinations.findOne({ _id: new ObjectId(place.destination) });
      if (dest) {
        await places.updateOne(
          { _id: place._id },
          { $set: { destination_name: dest.name } }
        );
        console.log(`Updated place ${place._id} with destination name ${dest.name}`);
      } else {
        console.warn(`Destination not found for place ${place._id}, destination id: ${place.destination}`);
      }
    }

    console.log('All places updated successfully.');
  } catch (err) {
    console.error('Error updating places:', err);
  } finally {
    await client.close();
  }
}

updatePlaces();
