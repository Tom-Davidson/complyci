const git = require("../lib/git");

describe("git", () => {
  test("updates an existing repo", () => {
    const repo = "404-User/404-Project";
    const hash = "01234567890abcdefghijklmnopqrstuvwxyz";
    const callback = jest.fn(() => {
      null;
    });
    const deps = {
      fs: {
        existsSync: () => true
      },
      git: {
        cwd: () => {
          return { pull: fn => fn() };
        }
      }
    };

    git.fetch(repo, hash, callback, null, deps);

    expect(callback.mock.calls.length).toBe(1);
  });
});
