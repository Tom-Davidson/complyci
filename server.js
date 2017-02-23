const fs = require('fs');
const koa = require('koa');
const parse = require('co-body');
const git = require('simple-git')('./repos');

const app = koa();
function repoChanged(repo) {
  console.log(`repoChanged: ${repo}`); // eslint-disable-line no-console
  if (fs.existsSync(`repos/${repo}/package.json`)) {
    console.log('  has a package.json'); // eslint-disable-line no-console
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
          repoChanged(body.repository.full_name);
        });
    } else {
      git.cwd(`repos/${body.repository.full_name}`).pull(() => {
        repoChanged(body.repository.full_name);
      });
    }
  } else {
    this.body = 'This endpoint only supports POST';
  }
});

app.listen(3000);
