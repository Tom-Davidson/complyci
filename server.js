const fs = require('fs');
const koa = require('koa');
const parse = require('co-body');
const simpleGit = require('simple-git')('./repos');

const app = koa();

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
      simpleGit.clone(
        `git@github.com:${body.repository.full_name}.git`,
        `${body.repository.full_name}`,
        {},
        () => {
          console.log('Checkout complete'); // eslint-disable-line no-console
        });
    } else {
      simpleGit.cwd(`repos/${body.repository.full_name}`).pull(() => {
        console.log('Pull complete'); // eslint-disable-line no-console
      });
    }
  } else {
    this.body = 'This endpoint only supports POST';
  }
});

app.listen(3000);
