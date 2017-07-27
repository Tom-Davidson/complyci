exports.stdout = function stdout(project, hash, licenses) {
  console.log(`Project: ${project}`); // eslint-disable-line no-console
  console.log(`Commit: ${hash}`); // eslint-disable-line no-console
  console.log(`Licenses: ${JSON.stringify(licenses)}`); // eslint-disable-line no-console
};
