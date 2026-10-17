// Checks that CLOUDFLARE_API_TOKEN can do what the gallery sync needs, and
// writes nothing. The sync puts and deletes objects in the tuios-media
// bucket, which needs "Workers R2 Storage: Edit" on the account.
//
//   CLOUDFLARE_API_TOKEN=... bun scripts/gallery-token-check.ts
//
// A write cannot be tested without writing, so the last check asks to
// create a bucket with a name R2 refuses. A token with Edit gets the name
// error. A token without it gets an authorization error first.

export {};

const ACCOUNT = "b99b72423d8ff8a3a14afdee5589683f";
const BUCKET = "tuios-media";
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) {
  console.error("CLOUDFLARE_API_TOKEN is not set.");
  process.exit(2);
}

type CfAnswer = {
  success: boolean;
  errors?: { code: number; message: string }[];
};

async function call(method: string, path: string, body?: unknown) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30_000),
  });
  const json = (await response.json().catch(() => ({}))) as CfAnswer;
  const errors = (json.errors ?? [])
    .map((e) => `${e.code} ${e.message}`)
    .join("; ");
  return { status: response.status, ok: json.success === true, errors };
}

let failed = false;

const verify = await call("GET", "/user/tokens/verify");
console.log(`token: ${verify.ok ? "active" : `not active (${verify.errors})`}`);
failed ||= !verify.ok;

const read = await call("GET", `/accounts/${ACCOUNT}/r2/buckets/${BUCKET}`);
console.log(
  `R2 read: ${read.ok ? "yes" : `no (${read.status} ${read.errors})`}`,
);
failed ||= !read.ok;

const write = await call("POST", `/accounts/${ACCOUNT}/r2/buckets`, {
  name: "Not A Valid Bucket Name!",
});
const authError =
  write.status === 401 ||
  write.status === 403 ||
  /\b(?:10000|9109)\b|auth/i.test(write.errors);
if (write.ok) {
  console.log("R2 write: unexpected, the invalid bucket was made");
  failed = true;
} else if (authError) {
  console.log(
    `R2 write: no (${write.status} ${write.errors}). Give the token "Workers R2 Storage: Edit".`,
  );
  failed = true;
} else {
  console.log(`R2 write: yes (the name was refused: ${write.errors})`);
}

process.exit(failed ? 1 : 0);
