// Manual mock for axios — returns a persistent singleton so that
// jest.resetModules() does not break mock.post.mockResolvedValueOnce calls
// set up on the top-level require reference in tests.
// We store the singleton on the global object so it survives resetModules().
if (!global.__axiosMock) {
  global.__axiosMock = {
    post: jest.fn(),
    get: jest.fn(),
  };
  global.__axiosMock.default = global.__axiosMock;
}
module.exports = global.__axiosMock;
