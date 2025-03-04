import mongoose from 'mongoose';

// Replace the below URI with your MongoDB connection string
const uri = 'mongodb+srv://geniusgateway182847:Genius182847@genius.tgdax.mongodb.net/?retryWrites=true&w=majority&appName=genius';

const connectdb=async()=>{
    try {
  await mongoose.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  });
  console.log('MongoDB connected successfully');
} catch (error) {
  console.error('Error connecting to MongoDB:', error);
}
}
export default connectdb;
