const fs = require("fs");
const licenseChecker = require("licenses");

exports.discover = function discover(repo, hash, reporter) {
  if (fs.existsSync(`repos/${repo}/package.json`)) {
    const licenseChecks = [];
    const packageJSON = JSON.parse(
      fs.readFileSync(`repos/${repo}/package.json`)
    );
    Object.keys(packageJSON.dependencies).forEach(dependency => {
      licenseChecks.push(
        new Promise((resolve, reject) => {
          licenseChecker(
            dependency,
            { registry: "https://registry.npmjs.org/" },
            function recordDepLic(err, license) {
              // eslint-disable-line prefer-arrow-callback
              if (err === undefined) {
                resolve({ dep: dependency, lic: license.join(",") });
              } else {
                reject({ dep: dependency, lic: "Unknown" }); // eslint-disable-line prefer-promise-reject-errors
              }
            }.bind({ licenseChecks, dependency }) // eslint-disable-line no-extra-bind, comma-dangle
          );
        }).catch(error => {
          console.log(error); // eslint-disable-line no-console
        })
      );
    });
    Promise.all(licenseChecks).then(licenseCheckResults => {
      const licenses = {};
      licenseCheckResults.forEach(licenseCheckResult => {
        licenses[licenseCheckResult.dep] = licenseCheckResult.lic;
      });
      reporter(repo, hash, licenses);
    });
  }
};
