const Chance = require('chance');
const moment = require('moment');

const chance = new Chance();

class GeneratedValues {
  constructor() {
    this.storedValues = {};
  }
  
  randomize(string) {
    let newString = string;
    if (/%([^%]*)%/.test(string)) {
      // console.log(string);
      const exampleReplacements = string.match(/%([^%]*)%/g);
      for (let i = 0; i < exampleReplacements.length; i++) {
        const replacement = exampleReplacements[i];
        const functionToCall = replacement.substring(1,replacement.length-1);
        let functionResult;
        if (functionToCall.match(/between([0-9]{2})and([0-9]{2})/)) {
          const min = functionToCall.match(/between([0-9]{2})and([0-9]{2})/)[1];
          const max = functionToCall.match(/between([0-9]{2})and([0-9]{2})/)[2];
          functionResult = this.randomBirthdayWithinRange(min, max);
        } else { functionResult = this[functionToCall]()}
        newString = newString.replace(replacement,functionResult);
        // console.log(newString);
      }

    }
    return newString;
  }

  getRandomValues(string) {
    let newString = string;
    if (/\*([^*]*)\*/.test(string)) {
      const exampleReplacements = string.match(/\*([^*]*)\*/g);
      for (let i = 0; i < exampleReplacements.length; i++) {
        const replacement = exampleReplacements[i];
        newString = newString.replace(replacement,this.storedValues[replacement.substring(1,replacement.length-1)]);
      }

    }
    return newString;
  }

  /**
   * returns a random string of characters and numbers.
   * @returns {string} val - A random string of letters.
   */
  randomString(num) {
    const val = chance.word({ length: 7 }) + Math.floor(Math.random() * 10000);
    let storageString = 'randomString';
    if(num) storageString = storageString + num;
    this.storedValues[storageString] = val;
    return val;
  }

  /**
   * returns a random string of numbers and upper case letters.
   * @returns {string} val - A random string of letters.
   */
  randomCode(num) {
    const val = (chance.word({ length: 6 }) + Math.floor(Math.random() * 10000)).toUpperCase();
    let storageString = 'randomCode';
    if(num) storageString = storageString + num;
    this.storedValues[storageString] = val;
    return val;
  }

  /**
   * returns a random string representing a drivers license.
   * @returns {string} dl - A random string of letters and numbers.
   */
  randomDl(num) {
    const dl = (chance.character({ alpha: true, casing: 'upper' }) +
    chance.natural({
      min: Math.pow(10, 13),  // eslint-disable-line no-restricted-properties
      max: Math.pow(10, 14) - 1  // eslint-disable-line no-restricted-properties
    }));
    let storageString = 'randomDl';
    if(num) storageString = storageString + num;
    this.storedValues[storageString] = dl;
    return dl;
  }

  /**
   * returns a random string representing an email.
   * @returns {string} email - A random string in the format ____@____.com.
   */
  randomEmailAddress(num) {
    const email = chance.email();
    let storageString = 'randomEmailAddress';
    if(num) storageString = storageString + num;
    this.storedValues[storageString] = email;
    return email;
  }

  /**
   * returns a random string representing a first name.
   * @returns {string} firstName - A string resembling a first name.
   */
  randomFirstName(num) {
    const firstName = chance.first();
    let storageString = 'randomFirstName';
    if(num) storageString = storageString + num;
    this.storedValues[storageString] = firstName;
    return firstName;
  }

  /**
   * returns a random string representing a first name.
   * @returns {string} lastName - A string resembling a last name.
   */
  randomLastName(num) {
    const lastName = chance.last();
    let storageString = 'randomLastName';
    if(num) storageString = storageString + num;
    this.storedValues[storageString] = lastName;
    return lastName;
  }

  /**
   * returns a random NVRA code number from the given array.
   * @returns {string} nvra - A string representing a random NVRA code.
   */
  randomNvra(num) {
    const nvraArray = ['24', '33', '49', '54', '76', '82', '99', 'P', 'FP'];
    const nvra = nvraArray[Math.floor(Math.random() * nvraArray.length)];
    let storageString = 'randomNvra';
    if(num) storageString = storageString + num;
    this.storedValues[storageString] = nvra;
    return nvra;
  }

  /**
   * returns a random party affiliation from the given array.
   * @returns {string} party - A string representing a random party.
   */
  randomParty(num) {
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
    let storageString = 'randomParty';
    if(num) storageString = storageString + num;
    this.storedValues[storageString] = party;
    return party;
  }

  /**
   * returns a random 9 digit string representing a social security number.
   * @returns {string} ssn - A 9 digit string representing a social security number.
   */
  randomSsn(num) {
    const ssn = chance.ssn();
    let storageString = 'randomSsn';
    if(num) storageString = storageString + num;
    this.storedValues[storageString] = ssn;
    return ssn;
  }

  /**
   * returns a random 4 digit string representing a social security number.
   * @returns {string} ssn - A 4 digit string representing a social security number.
   */
  randomLastFourSsn(num) {
    const ssn = chance.ssn({ ssnFour: true });
    let storageString = 'randomLastFourSsn';
    if(num) storageString = storageString + num;
    this.storedValues[storageString] = ssn;
    return ssn;
  }

  /**
   * returns a random binary gender.
   * @returns {string} gender - either male or female.
   */
  randomGender(num) {
    let gender = 'Female';
    if (chance.bool())      {
      gender = 'Male';
    }
    let storageString = 'randomGender';
    if(num) storageString = storageString + num;
    this.storedValues[storageString] = gender;
    return gender;
  }

  /**
   * returns a random date of birth where the age is currently over 18.
   * @returns {string} dob - the date of birth of the format __/__/____.
   */
  dobOver18(num) {
    const date = new Date();
    const yearToday = date.getFullYear();
    const randYear = chance.integer({ min: yearToday - 100, max: yearToday - 18 });
    const dob = chance.date({ string: true, year: randYear });
    let storageString = 'dobOver18';
    if(num) storageString = storageString + num;
    this.storedValues[storageString] = dob;
    return dob;
  }

  /**
   * returns a random date of birth where the age will be 18 within 21 days of today.
   * @returns {string} dob - the date of birth of the format __/__/____.
   */
  dob18Within21Days(num) {
    const birthday = moment().subtract(18, 'years');
    birthday.add(chance.integer({ min: 1, max: 21 }), 'days');
    const dob = birthday.format('L');
    let storageString = 'dob18Within21Days';
    if(num) storageString = storageString + num;
    this.storedValues[storageString] = dob;
    return dob;
  }

  /**
   * returns a random date of birth where the age will be 18 after at least 21 days from now.
   * @returns {string} dob - the date of birth of the format __/__/____.
   */
  dob18After21Days(num) {
    const birthday = moment().subtract(17, 'years');
    birthday.subtract(chance.integer({ min: 0, max: 344 }), 'days');
    const dob = birthday.format('L');
    let storageString = 'dob18After21Days';
    if(num) storageString = storageString + num;
    this.storedValues[storageString] = dob;
    return dob;
  }

  /**
   * returns a random date of birth whose age is within the supplied range.
   * @param {int} min - the minimum expected age to generate
   * @param {int} max - the maximum expected age to generate
   * @returns {string} dob - the date of birth of the format __/__/____.
   */
  dobWithinRange(min, max, num) {
    const birthday = moment().subtract(min, 'years');
    birthday.subtract(chance.integer({ min: 0, max: (365 * (max - min)) - 1 }), 'days');
    const dob = birthday.format('L');
    let storageString = 'dobWithinRange';
    if(num) storageString = storageString + num;
    this.storedValues[storageString] = dob;
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
    let storageString = 'dateToday';
    this.storedValues[storageString] = date;
    return date;
  }

  /**
   * returns a random date in the future.
   * @returns {string} date - today's date in the format __/__/____.
   */
  randomFutureDate(num) {
    const date = new Date();
    const yearToday = date.getFullYear();
    const randYear = chance.integer({ min: yearToday + 1, max: yearToday + 100 });
    const futureDate = chance.date({ string: true, year: randYear });
    let storageString = 'randomFutureDate';
    if(num) storageString = storageString + num;
    this.storedValues[storageString] = futureDate;
    return futureDate;
  }

}

module.exports = GeneratedValues;
