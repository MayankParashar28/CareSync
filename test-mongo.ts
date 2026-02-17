// Test MongoDB Atlas connection
import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('❌ MONGODB_URI not found in environment');
    process.exit(1);
}

// Hide password in log
const safeUri = uri.replace(/:([^@]+)@/, ':****@');
console.log('🔌 Testing connection to:', safeUri);

mongoose.connect(uri)
    .then(() => {
        console.log('✅ MongoDB Atlas connection successful!');
        console.log('📊 Database:', mongoose.connection.db.databaseName);
        console.log('🌐 Host:', mongoose.connection.host);
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    });
