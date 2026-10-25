import "dotenv/config";

const PROD_HOST_SUBSTRING = "ep-jolly-river-as1chmyk";

function assertNotProd(): void {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error("❌ [GUARD ERROR] DATABASE_URL is not defined.");
    process.exit(1);
  }

  let host: string;
  try {
    const parsed = new URL(dbUrl);
    host = parsed.hostname;
  } catch {
    console.error("❌ [GUARD ERROR] DATABASE_URL is not a valid URL.");
    process.exit(1);
  }

  if (host.includes(PROD_HOST_SUBSTRING)) {
    console.error(
      `❌ [GUARD BLOCKED] DATABASE_URL points to the PRODUCTION database host (${host})! Operation aborted.`
    );
    process.exit(1);
  }

  console.log(`✅ [GUARD OK] Database host verified as non-production: ${host}`);
  process.exit(0);
}

assertNotProd();
