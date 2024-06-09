async function consulta() {
    const asyncRedis = require("async-redis");
    const redis = asyncRedis.createClient();
    const pg = require("pg-promise")();
    const queryTime = 1000;

    const db = pg("postgres://postgres:919110@localhost:5432/redis");
    const idClient = 20;

    console.time("Redis");

    for (let i = 0; i < queryTime; i++) {
        redis.get(`${idClient}`);
    }

    let clientCache = await Promise.all(Array.from({ length: queryTime }, async () => {
        return redis.get(`${idClient}`);
    }));

    for (let i = 0; i < queryTime; i++) {
        if (!clientCache[i]) {
            const client = await db.query(
                "SELECT * from clients where id=20 limit 1"
            );
            redis.set(`${idClient}`, JSON.stringify(client[0]));
            clientCache[i] = JSON.stringify(client[0]);
        }
    }

    console.timeEnd("Redis");
    console.time("Postgresql");

    for (let i = 0; i < queryTime; i++) {
        const client = await db.query(
            "SELECT * from clients where id=20 limit 1"
        );
    }

    console.timeEnd("Postgresql");

    await db.$pool.end();
    await redis.quit();
}
consulta();
