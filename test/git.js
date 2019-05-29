const assert = require("assert");
const sinon = require("sinon");
const git = require("../lib/git");

describe("git", () => {
  // it('fetches a fresh repo', () => {
  //   const repo = '404-User/404-Project';
  //   const hash = '01234567890abcdefghijklmnopqrstuvwxyz';
  //   const fsMock = sinon.mock(fs);
  //   const simplegitFake = sinon.mock(gitcli);
  //   fsMock.expects('existsSync').withArgs(`repos/${repo}`).returns(false);
  //   simplegitFake.expects('clone').returns(true);
  //
  //   git.fetch(
  //     repo,
  //     hash,
  //     null,
  //     null,
  //   );
  //
  //   fsMock.verify();
  //   simplegitFake.verify();
  //
  //   simplegitFake.restore();
  //   fsMock.restore();
  // });
  it("updates an existing repo", () => {
    const repo = "404-User/404-Project";
    const hash = "01234567890abcdefghijklmnopqrstuvwxyz";
    const callback = sinon.stub();
    const fsMock = {};
    fsMock.existsSync = sinon.stub().returns(true);
    const gitFake = {};
    gitFake.cwd = sinon.stub().returns(gitFake);
    gitFake.pull = sinon.stub().callsFake(fn => {
      fn();
    });
    const deps = {
      git: gitFake,
      fs: fsMock
    };

    git.fetch(repo, hash, callback, null, deps);

    assert(callback.callCount === 1, "callback called once");
  });
});
