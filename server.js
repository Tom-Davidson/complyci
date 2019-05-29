const fs = require("fs");
const koa = require("koa");
const parse = require("co-body");
const git = require("./lib/git");
const licenses = require("./lib/licenses");
const reporter = require("./lib/reporters").stdout;
require("dotenv").config();

// Set up the envoronment
if (process.env.GITHUB_PRIVATE_KEY !== undefined) {
  const sshKeyFile = `${process.cwd()}/id_rsa`;
  process.env.GIT_SSH_COMMAND = `ssh -i ${sshKeyFile} -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no`;
  console.log(`Saved public key to ${sshKeyFile}`); // eslint-disable-line no-console
  fs.writeFileSync(sshKeyFile, process.env.GITHUB_PRIVATE_KEY);
  fs.chmodSync(sshKeyFile, 0o600); // eslint-disable-line no-console
} else {
  console.log("GITHUB_PRIVATE_KEY missing from environment"); // eslint-disable-line no-console
  process.exit();
}

const app = koa();

// x-response-time
app.use(function* headerResponseTime(next) {
  const start = new Date();
  yield next;
  const ms = new Date() - start;
  this.set("X-Response-Time", `${ms}ms`);
});
// logger
app.use(function* logger(next) {
  const start = new Date();
  yield next;
  const ms = new Date() - start;
  console.log("%s %s - %s", this.method, this.url, ms); // eslint-disable-line no-console
});

app.use(function* complyci() {
  if (this.method === "POST") {
    const body = yield parse(this, { limit: "10kb" });
    this.body = `Push to ${body.repository.full_name}\n`;
    git.fetch(
      body.repository.full_name,
      body.after,
      licenses.discover,
      reporter
    );
  } else {
    this.body = "This endpoint only supports POST\n";
  }
});

app.listen(process.env.PORT || 3000);
