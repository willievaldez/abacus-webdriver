const Chance = require('chance');
const moment = require('moment');

const chance = new Chance();

class GeneratedValues {
  /**
   * returns a random string representing an election name.
   * @returns {string} val - A random string of letters.
   */
  randomElectionName() {
    const val = chance.word({ length: 7 }) + Math.floor(Math.random() * 10000);
    global.localStorage.setItem('electionName', val);
    return val;
  }

  /**
   * returns a random string representing an election code.
   * @returns {string} val - A random string of letters.
   */
  randomCode() {
    const val = (chance.word({ length: 6 }) + Math.floor(Math.random() * 10000)).toUpperCase();
    global.localStorage.setItem('code', val);
    return val;
  }

  /**
   * returns a random string representing a drivers license.
   * @returns {string} dl - A random string of letters and numbers.
   */
  randomDl() {
    const dl = (chance.character({ alpha: true, casing: 'upper' }) +
    chance.natural({
      min: Math.pow(10, 13),  // eslint-disable-line no-restricted-properties
      max: Math.pow(10, 14) - 1  // eslint-disable-line no-restricted-properties
    }));
    global.localStorage.setItem('dl', dl);
    return dl;
  }

  /**
   * returns a random string representing an email.
   * @returns {string} email - A random string in the format ____@____.com.
   */
  randomEmailAddress() {
    const email = chance.email();
    global.localStorage.setItem('email', email);
    return email;
  }

  /**
   * returns a random string representing a first name.
   * @returns {string} firstName - A string resembling a first name.
   */
  randomFirstName() {
    const firstName = chance.first();
    global.localStorage.setItem('firstName', firstName);
    return firstName;
  }

  /**
   * returns a random string representing a first name.
   * @returns {string} lastName - A string resembling a last name.
   */
  randomLastName() {
    const lastName = chance.last();
    global.localStorage.setItem('lastName', lastName);
    return lastName;
  }

  /**
   * returns a random NVRA code number from the given array.
   * @returns {string} nvra - A string representing a random NVRA code.
   */
  randomNvra() {
    const nvraArray = ['24', '33', '49', '54', '76', '82', '99', 'P', 'FP'];
    const nvra = nvraArray[Math.floor(Math.random() * nvraArray.length)];
    global.localStorage.setItem('nvra', nvra);
    return nvra;
  }

  /**
   * returns a random party affiliation from the given array.
   * @returns {string} party - A string representing a random party.
   */
  randomParty() {
    const partyArray = [
      'Unaffiliated',
      'Democratic',
      'Republican',
      'Green Party',
      'Libertarian',
      'Reform Party',
      'U.S. Constitution Party',
      'Natural Law Party',
      'Conservative Party',
      'Socialist Party'
    ];
    const party = partyArray[Math.floor(Math.random() * partyArray.length)];
    global.localStorage.setItem('party', party);
    return party;
  }

  /**
   * returns a random 9 digit string representing a social security number.
   * @returns {string} ssn - A 9 digit string representing a social security number.
   */
  randomSsn() {
    const ssn = chance.ssn();
    global.localStorage.setItem('ssn', ssn);
    return ssn;
  }

  /**
   * returns a random 4 digit string representing a social security number.
   * @returns {string} ssn - A 4 digit string representing a social security number.
   */
  randomLastFourSsn() {
    const ssn = chance.ssn({ ssnFour: true });
    global.localStorage.setItem('ssn', ssn);
    return ssn;
  }

  /**
   * returns a random binary gender.
   * @returns {string} gender - either male or female.
   */
  randomGender() {
    let gender = 'Female';
    if (chance.bool())      {
      gender = 'Male';
    }
    global.localStorage.setItem('gender', gender);
    return gender;
  }

  /**
   * returns a random date of birth where the age is currently over 18.
   * @returns {string} dob - the date of birth of the format __/__/____.
   */
  dobOver18() {
    const date = new Date();
    const yearToday = date.getFullYear();
    const randYear = chance.integer({ min: yearToday - 100, max: yearToday - 18 });
    const dob = chance.date({ string: true, year: randYear });
    global.localStorage.setItem('voterDob', dob);
    return dob;
  }

  /**
   * returns a random date of birth where the age will be 18 within 21 days of today.
   * @returns {string} dob - the date of birth of the format __/__/____.
   */
  dob18Within21Days() {
    const birthday = moment().subtract(18, 'years');
    birthday.add(chance.integer({ min: 1, max: 21 }), 'days');
    const dob = birthday.format('L');
    global.localStorage.setItem('dob', dob);
    return dob;
  }

  /**
   * returns a random date of birth where the age will be 18 after at least 21 days from now.
   * @returns {string} dob - the date of birth of the format __/__/____.
   */
  dob18After21Days() {
    const birthday = moment().subtract(17, 'years');
    birthday.subtract(chance.integer({ min: 0, max: 344 }), 'days');
    const dob = birthday.format('L');
    global.localStorage.setItem('dob', dob);
    return dob;
  }

  /**
   * returns a random date of birth whose age is within the supplied range.
   * @param {int} min - the minimum expected age to generate
   * @param {int} max - the maximum expected age to generate
   * @returns {string} dob - the date of birth of the format __/__/____.
   */
  dobWithinRange(min, max) {
    const birthday = moment().subtract(min, 'years');
    birthday.subtract(chance.integer({ min: 0, max: (365 * (max - min)) - 1 }), 'days');
    const dob = birthday.format('L');
    global.localStorage.setItem('voterDob', dob);
    return dob;
  }

  /**
   * returns a string of today's date.
   * @returns {string} date - today's date in the format __/__/____.
   */
  dateToday() {
    const today = new Date();
    const month = (`0${today.getMonth() + 1}`).slice(-2);
    const day = (`0${today.getDate()}`).slice(-2);
    const year = today.getFullYear();
    const date = `${month}/${day}/${year}`;
    global.localStorage.setItem('date', date);
    return date;
  }

  /**
   * returns a random date in the future.
   * @returns {string} date - today's date in the format __/__/____.
   */
  randomFutureDate() {
    const date = new Date();
    const yearToday = date.getFullYear();
    const randYear = chance.integer({ min: yearToday + 1, max: yearToday + 100 });
    const futureDate = chance.date({ string: true, year: randYear });
    global.localStorage.setItem('date', futureDate);
    return futureDate;
  }

}

module.exports = GeneratedValues;
