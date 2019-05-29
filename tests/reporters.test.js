const reporters = require("../lib/reporters");

describe("stdlib", () => {
  test("dumps data to the console", () => {
    const spy = jest.spyOn(console, "log");

    reporters.stdout(
      "404-User/404-Project",
      "01234567890abcdefghijklmnopqrstuvwxyz",
      { libA: "MIT", libB: "BSD" }
    );

    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls[0][0]).toEqual("Project: 404-User/404-Project");
    expect(spy.mock.calls[1][0]).toEqual(
      "Commit: 01234567890abcdefghijklmnopqrstuvwxyz"
    );
    expect(spy.mock.calls[2][0]).toEqual(
      'Licenses: {"libA":"MIT","libB":"BSD"}'
    );
    spy.mockRestore();
  });
});
