const fs = require("fs");
const git = require("simple-git")("./repos");

const defaultdeps = { fs, git };
exports.fetch = function fetch(
  repo,
  hash,
  callback,
  reporter,
  deps = defaultdeps
) {
  if (!deps.fs.existsSync(`repos/${repo}`)) {
    deps.git.clone(`git@github.com:${repo}.git`, `${repo}`, {}, () => {
      callback(repo, hash);
    });
  } else {
    console.log("exists");
    deps.git.cwd(`repos/${repo}`).pull(() => {
      console.log("cdw+pull");
      callback(repo, hash, reporter);
    });
  }
};
