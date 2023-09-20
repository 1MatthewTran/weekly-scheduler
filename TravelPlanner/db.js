import { MongoClient } from 'mongodb';

let dbConnection;

const connectToDb = async (cb) => {
  try {
    const client = await MongoClient.connect('mongodb://localhost:27017/schedulerdb');
    dbConnection = client.db();
    return cb();
  } catch (err) {
    console.log(err);
    return cb(err);
  }
};

const getDb = () => dbConnection;

export { connectToDb, getDb };