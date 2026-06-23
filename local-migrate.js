const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:Powerdz123up1@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&options=project%3Duagjlhguhasssqnobaaw",
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log("Connecting...");
    await client.connect();
    console.log("Connected!");
    
    // Add columns
    console.log("Adding columns...");
    await client.query(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryProvider" TEXT;`);
    await client.query(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "trackingId" TEXT;`);
    await client.query(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "bordereauUrl" TEXT;`);
    await client.query(`ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "deliveryConfig" JSONB;`);
    console.log("Migration complete!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

main();
