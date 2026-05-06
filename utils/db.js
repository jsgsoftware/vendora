async function connectDb() {
    return true;
}

async function disconnectDb() {
    return true;
}

const db = { connectDb, disconnectDb };

export default db;
