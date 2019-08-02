import localizationService from './../defaultLocalizationConfig';

// Choosing a late time so that the UTC date will fall on the next day in ET and PT
const dateTimeObject = new Date(2019, 2, 5, 22, 3, 43, 8); // Mar 05 2019 22:03:43.008 (local timezone)

// We cannot control the timezone offset of Dates in jest unless we mock the whole Date object.
const isUTCDateAhead = date => {
    return date.getDate() < date.getUTCDate();
};
const isUTCDateBehind = date => {
    return date.getDate() > date.getUTCDate();
};

const dateString = '2019-03-05';
const timeString = '02:23:53.453';
const dateTimeString = '2019-03-06T02:03:43.008Z';

describe('When using the localization service for formatting', () => {
    describe('with formatDate', () => {
        const format = {
            short: 'M/d/yyyy',
            medium: 'MMM d, yyyy',
            long: 'MMMM d, yyyy',
            iso: 'YYYY-MM-DD',
        };

        it('should correctly format dates', () => {
            expect(localizationService.formatDate(dateTimeObject)).toBe(
                'Mar 5, 2019'
            );
            expect(
                localizationService.formatDate(dateTimeObject, format.short)
            ).toBe('3/5/2019');
            expect(
                localizationService.formatDate(dateTimeObject, format.medium)
            ).toBe('Mar 5, 2019');
            expect(
                localizationService.formatDate(dateTimeObject, format.long)
            ).toBe('March 5, 2019');
            expect(
                localizationService.formatDate(dateTimeObject, format.iso)
            ).toBe('2019-03-05');
        });

        it('should correctly format ISO date strings', () => {
            expect(localizationService.formatDate(dateString)).toBe(
                'Mar 5, 2019'
            );
            expect(localizationService.formatDate(dateString, format.iso)).toBe(
                '2019-03-05'
            );

            expect(localizationService.formatDate(dateTimeString)).toBe(
                'Mar 6, 2019'
            );
            expect(
                localizationService.formatDate(dateTimeString, format.iso)
            ).toBe('2019-03-06');
        });

        it('should return invalid date for falsy values', () => {
            expect(localizationService.formatDate(null).toString()).toBe(
                'Invalid Date'
            );
            expect(localizationService.formatDate(undefined).toString()).toBe(
                'Invalid Date'
            );
            expect(localizationService.formatDate('').toString()).toBe(
                'Invalid Date'
            );
        });
    });

    describe('with formatDateUTC', () => {
        it('should correctly format dates', () => {
            // Since it gets the corresponding UTC date, it could be one day off.
            const expectedOutput = isUTCDateAhead(dateTimeObject)
                ? 'Mar 6, 2019'
                : isUTCDateBehind(dateTimeObject)
                    ? 'Mar 4, 2019'
                    : 'Mar 5, 2019';
            expect(localizationService.formatDateUTC(dateTimeObject)).toBe(
                expectedOutput
            );
        });

        it('should correctly format dates to ISO strings', () => {
            const expectedOutput = isUTCDateAhead(dateTimeObject)
                ? '2019-03-06'
                : isUTCDateBehind(dateTimeObject) ? '2019-03-04' : '2019-03-05';
            expect(
                localizationService.formatDateUTC(dateTimeObject, 'YYYY-MM-DD')
            ).toBe(expectedOutput);
        });

        it('should return invalid date for falsy values', () => {
            expect(localizationService.formatDateUTC(null).toString()).toBe(
                'Invalid Date'
            );
            expect(
                localizationService.formatDateUTC(undefined).toString()
            ).toBe('Invalid Date');
            expect(localizationService.formatDateUTC('').toString()).toBe(
                'Invalid Date'
            );
        });
    });

    describe('with formatTime', () => {
        const format = {
            short: 'h:mm a',
            medium: 'h:mm:ss a',
            iso: 'HH:mm:ss.SSS',
        };

        it('should correctly format time', () => {
            expect(localizationService.formatTime(dateTimeObject)).toBe(
                '10:03:43 PM'
            );
            expect(
                localizationService.formatTime(dateTimeObject, format.short)
            ).toBe('10:03 PM');
            expect(
                localizationService.formatTime(dateTimeObject, format.medium)
            ).toBe('10:03:43 PM');
            expect(
                localizationService.formatTime(dateTimeObject, format.iso)
            ).toBe('22:03:43.008');
        });

        it('should return invalid date for falsy values', () => {
            expect(localizationService.formatTime(null).toString()).toBe(
                'Invalid Date'
            );
            expect(localizationService.formatTime(undefined).toString()).toBe(
                'Invalid Date'
            );
            expect(localizationService.formatTime('').toString()).toBe(
                'Invalid Date'
            );
        });
    });

    describe('with formatDateTimeUTC', () => {
        it('should correctly format datetime', () => {
            // 2019-03-06T02:03:43.008Z
            const date = new Date(dateTimeString);
            expect(localizationService.formatDateTimeUTC(date)).toBe(
                'Mar 6, 2019, 2:03:43 AM'
            );
        });

        it('should return invalid date for falsy values', () => {
            expect(localizationService.formatDateTimeUTC(null).toString()).toBe(
                'Invalid Date'
            );
            expect(
                localizationService.formatDateTimeUTC(undefined).toString()
            ).toBe('Invalid Date');
            expect(localizationService.formatDateTimeUTC('').toString()).toBe(
                'Invalid Date'
            );
        });
    });

    describe('with parseDateTimeISO8601', () => {
        it('should correctly parse ISO date string', () => {
            // 2019-03-05 -> Mar 5 2019 00:00:00
            const parsedDate = localizationService.parseDateTimeISO8601(
                dateString
            );
            expect(parsedDate.getDate()).toBe(5);
            expect(parsedDate.getHours()).toBe(0);
        });

        it('should correctly parse ISO time string', () => {
            // 02:23:53.453 -> (current date) 02:23:53
            const parsedDate = localizationService.parseDateTimeISO8601(
                timeString
            );
            expect(parsedDate.getHours()).toBe(2);
        });

        it('should correctly parse ISO datetime string', () => {
            // 2019-03-06T02:03:43.008Z
            const parsedDate = localizationService.parseDateTimeISO8601(
                dateTimeString
            );
            // Since getDate and getHours will depend on the system timezone, we'll check the UTC value instead
            expect(parsedDate.getUTCDate()).toBe(6);
            expect(parsedDate.getUTCHours()).toBe(2);
        });

        it('should return invalid date for falsy values', () => {
            expect(localizationService.parseDateTimeISO8601(null)).toBeNull();
            expect(
                localizationService.parseDateTimeISO8601(undefined)
            ).toBeNull();
            expect(localizationService.parseDateTimeISO8601('')).toBeNull();
        });
    });

    describe('with parseDateTime', () => {
        it('should correctly parse ISO date string', () => {
            // 2019-03-05 -> Mar 5 2019 00:00:00
            const parsedDate = localizationService.parseDateTime(
                dateString,
                'YYYY-MM-DD'
            );
            expect(parsedDate.getDate()).toBe(5);
            expect(parsedDate.getHours()).toBe(0);
        });

        it('should correctly parse formatted date string', () => {
            // 2019-03-05 -> Mar 5 2019 00:00:00
            const parsedDate = localizationService.parseDateTime(
                'Mar 5, 2019',
                'MMM d, yyyy'
            );
            expect(parsedDate.getFullYear()).toBe(2019);
            expect(parsedDate.getMonth()).toBe(2);
            expect(parsedDate.getDate()).toBe(5);
            expect(parsedDate.getHours()).toBe(0);
        });

        it('should correctly parse formatted date string in short style', () => {
            // 2019-03-05 -> Mar 5 2019 00:00:00
            const parsedDate = localizationService.parseDateTime(
                '3/5/2019',
                'M/d/yyyy'
            );
            expect(parsedDate.getFullYear()).toBe(2019);
            expect(parsedDate.getMonth()).toBe(2);
            expect(parsedDate.getDate()).toBe(5);
            expect(parsedDate.getHours()).toBe(0);
        });

        it('should correctly parse formatted date string in long style', () => {
            // 2019-03-05 -> Mar 5 2019 00:00:00
            const parsedDate = localizationService.parseDateTime(
                'March 5, 2019',
                'MMMM d, yyyy'
            );
            expect(parsedDate.getFullYear()).toBe(2019);
            expect(parsedDate.getMonth()).toBe(2);
            expect(parsedDate.getDate()).toBe(5);
            expect(parsedDate.getHours()).toBe(0);
        });

        it('should return null when value does not match the format', () => {
            // 2019-03-05 -> Mar 5 2019 00:00:00
            const parsedDate = localizationService.parseDateTime(
                '3/5/2019',
                'MMM d, yyyy'
            );
            expect(parsedDate).toBeNull();
        });

        it('should return null when value is invalid', () => {
            // 2019-03-05 -> Mar 5 2019 00:00:00
            const parsedDate = localizationService.parseDateTime(
                'ABCD',
                'MMM d, yyyy'
            );
            expect(parsedDate).toBeNull();
        });

        it('should correctly parse formatted time string', () => {
            // 2019-03-05 -> Mar 5 2019 00:00:00
            const parsedDate = localizationService.parseDateTime(
                '2:23:45 PM',
                'h:m:s a'
            );
            expect(parsedDate.getHours()).toBe(14);
            expect(parsedDate.getMinutes()).toBe(23);
            expect(parsedDate.getSeconds()).toBe(45);
            expect(parsedDate.getMilliseconds()).toBe(0);
        });

        it('should correctly parse formatted time string with milliseconds', () => {
            // 2019-03-05 -> Mar 5 2019 00:00:00
            const parsedDate = localizationService.parseDateTime(
                '2:23:45.243 PM',
                'h:m:s a'
            );
            expect(parsedDate.getHours()).toBe(14);
            expect(parsedDate.getMinutes()).toBe(23);
            expect(parsedDate.getSeconds()).toBe(45);
            expect(parsedDate.getMilliseconds()).toBe(243);
        });

        it('should correctly parse formatted time string with only hours and minutes', () => {
            // 2019-03-05 -> Mar 5 2019 00:00:00
            const parsedDate = localizationService.parseDateTime(
                '2:23 PM',
                'h:m:s a'
            );
            expect(parsedDate.getHours()).toBe(14);
            expect(parsedDate.getMinutes()).toBe(23);
            expect(parsedDate.getSeconds()).toBe(0);
            expect(parsedDate.getMilliseconds()).toBe(0);
        });

        it('should return null when time value is invalid', () => {
            // 2019-03-05 -> Mar 5 2019 00:00:00
            const parsedDate = localizationService.parseDateTime(
                'ABCD',
                'h:m:s a'
            );
            expect(parsedDate).toBeNull();
        });

        it('should return invalid date for falsy values', () => {
            expect(localizationService.parseDateTime(null)).toBeNull();
            expect(localizationService.parseDateTime(undefined)).toBeNull();
            expect(localizationService.parseDateTime('')).toBeNull();
        });
    });

    describe('with isBefore and isAfter', () => {
        const date = new Date(dateTimeObject.getTime());
        const millisecondsLater = new Date(dateTimeObject.getTime() + 20);
        const minutesLater = new Date(dateTimeObject.getTime()).setMinutes(
            dateTimeObject.getMinutes() + 3
        );
        const daysLater = new Date(dateTimeObject.getTime()).setDate(
            dateTimeObject.getDate() + 3
        );
        const monthsLater = new Date(dateTimeObject.getTime()).setMonth(
            dateTimeObject.getMonth() + 3
        );

        it('should correctly compare without unit', () => {
            expect(
                localizationService.isBefore(date, millisecondsLater)
            ).toBeTruthy();
            expect(localizationService.isBefore(date, daysLater)).toBeTruthy();
            expect(
                localizationService.isAfter(date, millisecondsLater)
            ).toBeFalsy();
            expect(localizationService.isAfter(date, daysLater)).toBeFalsy();
        });

        it('should correctly compare when either date is null', () => {
            expect(localizationService.isBefore(date, null)).toBeFalsy();
            expect(localizationService.isAfter(null, date)).toBeFalsy();
        });

        it('should correctly compare when unit is minute', () => {
            expect(
                localizationService.isBefore(date, millisecondsLater, 'minute')
            ).toBeFalsy();
            expect(
                localizationService.isAfter(date, millisecondsLater, 'minute')
            ).toBeFalsy();

            expect(
                localizationService.isBefore(date, minutesLater, 'minute')
            ).toBeTruthy();
            expect(
                localizationService.isAfter(date, minutesLater, 'minute')
            ).toBeFalsy();

            expect(
                localizationService.isBefore(date, daysLater, 'minute')
            ).toBeTruthy();
            expect(
                localizationService.isAfter(date, daysLater, 'minute')
            ).toBeFalsy();
        });

        it('should correctly compare when unit is day', () => {
            expect(
                localizationService.isBefore(date, millisecondsLater, 'day')
            ).toBeFalsy();
            expect(
                localizationService.isAfter(date, millisecondsLater, 'day')
            ).toBeFalsy();

            expect(
                localizationService.isBefore(date, minutesLater, 'day')
            ).toBeFalsy();
            expect(
                localizationService.isAfter(date, minutesLater, 'day')
            ).toBeFalsy();

            expect(
                localizationService.isBefore(date, daysLater, 'day')
            ).toBeTruthy();
            expect(
                localizationService.isAfter(date, daysLater, 'day')
            ).toBeFalsy();

            expect(
                localizationService.isBefore(date, monthsLater, 'day')
            ).toBeTruthy();
            expect(
                localizationService.isAfter(date, monthsLater, 'day')
            ).toBeFalsy();
        });
    });
});
