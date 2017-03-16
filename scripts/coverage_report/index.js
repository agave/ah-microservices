const fs = require('fs');
const path = require('path');

const SERVICES_APP_PATH_REGEX = /\/var\/lib\/app/g;
const SERVICES_ABSOLUTE_PATH = 'services';
const SERVICES_RELATIVE_PATH = 'services';
const excludedServices = [ 'core' ];

function getServices(srcpath, exclude) {
  return fs.readdirSync(srcpath)
    .filter(file =>
      fs.statSync(path.join(srcpath, file)).isDirectory() &&
      !exclude.includes(file)
    );
}

fs.mkdirSync('coverage');
fs.mkdirSync('coverage/unit');
fs.mkdirSync('coverage/functional');

getServices(SERVICES_RELATIVE_PATH, excludedServices).forEach(service => {
  const serviceRelativePath = `${SERVICES_RELATIVE_PATH}/${service}`;
  const unitCoverageFile = `${serviceRelativePath}/unit_coverage/lcov.info`;
  const functionalCoverageFile = `${serviceRelativePath}/functional_coverage/lcov.info`;
  const newAbsolutePath = `${SERVICES_ABSOLUTE_PATH}/${service}/src`;

  const hasUnitCoverage = fs.existsSync(unitCoverageFile);
  const hasFunctionalCoverage = fs.existsSync(functionalCoverageFile);

  if (hasUnitCoverage) {
    const file = fs.readFileSync(unitCoverageFile, 'utf8').replace(SERVICES_APP_PATH_REGEX, newAbsolutePath);

    fs.writeFileSync(`coverage/unit/${service}.info`, file);
  } else {
    console.log(`No unit coverage report found for ${service}`);
  }

  if (hasFunctionalCoverage) {
    const file = fs.readFileSync(functionalCoverageFile, 'utf8').replace(SERVICES_APP_PATH_REGEX, newAbsolutePath);

    fs.writeFileSync(`coverage/functional/${service}.info`, file);
  } else {
    console.log(`No functional coverage report found for ${service}`);
  }
});
