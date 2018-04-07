const Chance = require('chance');
const moment = require('moment');

const chance = new Chance();

module.exports = (rvg) => {
    /**
     * returns a random string of characters and numbers.
     * @returns {string} val - A random string of letters.
     */
    rvg(/^randomString$/, () => {
        return `${chance.word({length: 7})}${Math.floor(Math.random() * 10000)}`;
    });

    /**
     * returns a random date of birth whose age is within the supplied range.
     * @param {int} min - the minimum expected age to generate
     * @param {int} max - the maximum expected age to generate
     * @returns {string} dob - the date of birth of the format __/__/____.
     */
    rvg(/^between([0-9]{2})and([0-9]{2})$/, (min, max) => {
        const birthday = moment().subtract(min, 'years');
        birthday.subtract(chance.integer({min: 0, max: (365 * (max - min)) - 1}), 'days');
        return birthday.format('L');
    });

    /**
     * returns a random string representing a drivers license.
     * @returns {string} dl - A random string of letters and numbers.
     */
    rvg(/^randomDl$/, () => {
        return `${chance.character({alpha: true, casing: 'upper'})}${chance.natural({
            min: Math.pow(10, 13),  // eslint-disable-line no-restricted-properties
            max: Math.pow(10, 14) - 1  // eslint-disable-line no-restricted-properties
        })}`;
    });

    /**
     * returns a random string representing an email.
     * @returns {string} email - A random string in the format ____@____.com.
     */
    rvg(/^randomEmailAddress$/, () => {
        return chance.email();
    });

    /**
     * returns a random string representing a first name.
     * @returns {string} firstName - A string resembling a first name.
     */
    rvg(/^randomFirstName$/, () => {
        return chance.first();
    });

    /**
     * returns a random string representing a first name.
     * @returns {string} lastName - A string resembling a last name.
     */
    rvg(/^randomLastName$/, () => {
        return chance.last();

    });

    /**
     * returns a random 9 digit string representing a social security number.
     * @returns {string} ssn - A 9 digit string representing a social security number.
     */
    rvg(/^randomSsn$/, () => {
        return chance.ssn();
    });

    /**
     * returns a random 4 digit string representing a social security number.
     * @returns {string} ssn - A 4 digit string representing a social security number.
     */
    rvg(/^randomLastFourSsn$/, () => {
        return chance.ssn({ssnFour: true});

    });

    /**
     * returns a random binary gender.
     * @returns {string} gender - either male or female.
     */
    rvg(/^randomGender$/, () => {
        let gender = 'Female';
        if (chance.bool()) {
            gender = 'Male';
        }
        return gender;
    });

    /**
     * returns a random date of birth where the age is currently over 18.
     * @returns {string} dob - the date of birth of the format __/__/____.
     */
    rvg(/^dobOver18$/, () => {
        const date = new Date();
        const yearToday = date.getFullYear();
        const randYear = chance.integer({min: yearToday - 100, max: yearToday - 18});
        return chance.date({string: true, year: randYear});
    });

    /**
     * returns a random date of birth where the age is currently over 18.
     * @returns {string} dob - the date of birth of the format __/__/____.
     */
    rvg(/^dobOver18\((.*)\)$/, (modifier) => {
        const date = new Date();
        const yearToday = date.getFullYear();
        const randYear = chance.integer({min: yearToday - 100, max: yearToday - 18});
        const dob = chance.date({year: randYear});

        const dateFormat = modifier.split('/');
        let finalDate = '';
        for (let i = 0; i < dateFormat.length; i++) {
            if (i !== 0) finalDate += '/';
            switch(dateFormat[i]) {
                case 'MM':
                    finalDate += `0${dob.getMonth() + 1}`.slice(-2);
                    break;
                case 'M':
                    finalDate += `${dob.getMonth() + 1}`;
                    break;
                case 'DD':
                    finalDate += `0${dob.getDate()}`.slice(-2);
                    break;
                case 'D':
                    finalDate += `${dob.getDate()}`;
                    break;
                case 'YY':
                    finalDate += `${dob.getFullYear()}`.slice(-2);
                    break;
                case 'YYYY':
                    finalDate += `${dob.getFullYear()}`;
                    break;
            }
        }
        return finalDate;
    });

    /**
     * returns a string of today's date.
     * @returns {string} date - today's date in the format __/__/____.
     */
    rvg(/^dateToday$/, () => {
        const today = new Date();
        const month = (`0${today.getMonth() + 1}`).slice(-2);
        const day = (`0${today.getDate()}`).slice(-2);
        const year = today.getFullYear();
        return `${month}/${day}/${year}`;
    });

    /**
     * returns a string of today's date.
     * @returns {string} date - today's date in the format __/__/____.
     */
    rvg(/^dateToday\((.*)\)$/, (modifier) => {
        const today = new Date();

        const dateFormat = modifier.split('/');
        let finalDate = '';
        for (let i = 0; i < dateFormat.length; i++) {
            if (i !== 0) finalDate += '/';
            switch(dateFormat[i]) {
                case 'MM':
                    finalDate += `0${today.getMonth() + 1}`.slice(-2);
                    break;
                case 'M':
                    finalDate += `${today.getMonth() + 1}`;
                    break;
                case 'DD':
                    finalDate += `0${today.getDate()}`.slice(-2);
                    break;
                case 'D':
                    finalDate += `${today.getDate()}`;
                    break;
                case 'YY':
                    finalDate += `${today.getFullYear()}`.slice(-2);
                    break;
                case 'YYYY':
                    finalDate += `${today.getFullYear()}`;
                    break;
            }
        }
        return finalDate;

    });

    /**
     * returns a random date in the future.
     * @returns {string} date - today's date in the format __/__/____.
     */
    rvg(/^randomFutureDate$/, () => {
        const date = new Date();
        const yearToday = date.getFullYear();
        const randYear = chance.integer({min: yearToday + 1, max: yearToday + 100});
        return moment(chance.date({string: true, year: randYear}), 'MM/DD/YYYY').format('MM/DD/YYYY');
    });

    /**
     * returns a random date in the past.
     * @returns {string} date - today’s date in the format __/__/____.
     */
    rvg(/^randomPastDate$/, () => {
        const date = new Date();
        const yearToday = date.getFullYear();
        const randYear = chance.integer({min: yearToday - 6, max: yearToday - 1});
        return moment(chance.date({string: true, year: randYear}), 'MM/DD/YYYY').format('MM/DD/YYYY');
    });

};
