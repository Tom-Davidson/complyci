const fs = require('fs');
const koa = require('koa');
const parse = require('co-body');
const git = require('simple-git')('./repos');
const licenseChecker = require('licenses');
require('dotenv').config();

// Set up the envoronment
if (process.env.GITHUB_PRIVATE_KEY !== undefined) {
  const sshKeyFile = `${process.cwd()}/id_rsa`;
  process.env.GIT_SSH_COMMAND = `ssh -i ${sshKeyFile} -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no`;
  console.log(`Saved public key to ${sshKeyFile}`); // eslint-disable-line no-console
  fs.writeFileSync(sshKeyFile, process.env.GITHUB_PRIVATE_KEY);
  fs.chmodSync(sshKeyFile, 0o600); // eslint-disable-line no-console
} else {
  console.log('GITHUB_PRIVATE_KEY missing from environment'); // eslint-disable-line no-console
  process.exit();
}

const app = koa();
function licensesUpdate(project, hash, licenses) {
  console.log(`Project: ${project}`); // eslint-disable-line no-console
  console.log(`Commit: ${hash}`); // eslint-disable-line no-console
  console.log(`Licenses: ${JSON.stringify(licenses)}`); // eslint-disable-line no-console
}
function repoChanged(repo, hash) {
  if (fs.existsSync(`repos/${repo}/package.json`)) {
    const licenseChecks = [];
    const packageJSON = JSON.parse(fs.readFileSync(`repos/${repo}/package.json`));
    Object.keys(packageJSON.dependencies).forEach((dependency) => {
      licenseChecks.push(new Promise((resolve, reject) => {
        licenseChecker(
          dependency,
          { registry: 'https://registry.npmjs.org/' },
          function recordDepLic(err, license) { // eslint-disable-line prefer-arrow-callback
            if (err === undefined) {
              resolve({ dep: dependency, lic: license.join(',') });
            } else {
              reject({ dep: dependency, lic: 'Unknown' });
            }
          }.bind({ licenseChecks, dependency }) // eslint-disable-line no-extra-bind, comma-dangle
        );
      }));
    });
    Promise.all(licenseChecks).then((licenseCheckResults) => {
      const licenses = {};
      licenseCheckResults.forEach((licenseCheckResult) => {
        licenses[licenseCheckResult.dep] = licenseCheckResult.lic;
      });
      licensesUpdate(repo, hash, licenses);
    });
  }
}

// x-response-time
app.use(function* headerResponseTime(next) {
  const start = new Date();
  yield next;
  const ms = new Date() - start;
  this.set('X-Response-Time', `${ms}ms`);
});
// logger
app.use(function* logger(next) {
  const start = new Date();
  yield next;
  const ms = new Date() - start;
  console.log('%s %s - %s', this.method, this.url, ms); // eslint-disable-line no-console
});

app.use(function* complyci() {
  if (this.method === 'POST') {
    const body = yield parse(this, { limit: '10kb' });
    this.body = `Push to ${body.repository.full_name}`;
    if (!fs.existsSync(`repos/${body.repository.full_name}`)) {
      git.clone(
        `git@github.com:${body.repository.full_name}.git`,
        `${body.repository.full_name}`,
        {},
        () => {
          repoChanged(body.repository.full_name, body.after);
        });
    } else {
      git.cwd(`repos/${body.repository.full_name}`).pull(() => {
        repoChanged(body.repository.full_name, body.after);
      });
    }
  } else {
    this.body = 'This endpoint only supports POST';
  }
});

app.listen(process.env.PORT || 3000);
