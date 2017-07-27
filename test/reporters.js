const assert = require('assert');
const sinon = require('sinon');
const reporters = require('../lib/reporters');

describe('stdlib', function() {
  it('dumps data to the console', () => {
    const spy = sinon.spy(console, 'log');

    reporters.stdout(
      '404-User/404-Project',
      '01234567890abcdefghijklmnopqrstuvwxyz',
      {'libA': 'MIT', 'libB': 'BSD'}
    );

    assert(spy.callCount, 3);
    assert(spy.calledWith('Project: 404-User/404-Project'));
    assert(spy.calledWith('Commit: 01234567890abcdefghijklmnopqrstuvwxyz'));
    assert(spy.calledWith('Licenses: {"libA":"MIT","libB":"BSD"}'));

    spy.restore();
  });
});
