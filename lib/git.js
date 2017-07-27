const fs = require('fs');
const git = require('simple-git')('./repos');

exports.fetch = function fetch(repo, hash, callback, reporter) {
  if (!fs.existsSync(`repos/${repo}`)) {
    git.clone(
      `git@github.com:${repo}.git`,
      `${repo}`,
      {},
      () => {
        callback(repo, hash);
      });
  } else {
    git.cwd(`repos/${repo}`).pull(() => {
      callback(repo, hash, reporter);
    });
  }
};
