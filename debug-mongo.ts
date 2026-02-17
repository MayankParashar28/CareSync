import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('❌ MONGODB_URI not found');
    process.exit(1);
}

console.log('Testing connection options...');



async function run() {
    // Test 1: Force IPv4
    await testConnection('Force IPv4', { family: 4 });

    // Test 2: TLS True
    await testConnection('Explicit TLS', { tls: true });

    // Test 3: TLS Insecure
    await testConnection('TLS Insecure', { tlsInsecure: true });

    // Test 5: Standard Connection String (Bypass SRV)
    // Test 5: Standard Connection String (Bypass SRV)
    const standardUri = process.env.MONGODB_STANDARD_URI;
    if (standardUri) {
        await testConnection('Standard URI (Bypass SRV)', { uri: standardUri, family: 4, tlsInsecure: true });
    } else {
        console.log('\n⚠️  Skipping: Standard URI (Bypass SRV) - MONGODB_STANDARD_URI not set');
    }

    process.exit(0);
}

async function testConnection(name: string, opts: any) {
    console.log(`\n🧪 Testing: ${name}`);
    const connectionUri = opts.uri || uri;
    // Remove uri from opts to avoid conflict if passed
    const { uri: _, ...connectOpts } = opts;

    try {
        await mongoose.disconnect();
        await mongoose.connect(connectionUri!, {
            serverSelectionTimeoutMS: 5000,
            ...connectOpts
        });
        console.log(`✅ SUCCESS: ${name}`);
        await mongoose.disconnect();
        return true;
    } catch (error: any) {
        console.log(`❌ FAILED: ${name}`);
        console.dir(error, { depth: null });
        return false;
    }
}

run();
