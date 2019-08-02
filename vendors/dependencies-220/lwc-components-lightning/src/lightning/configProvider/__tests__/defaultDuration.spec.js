import Duration from './../defaultDurationConfig';

const SECOND_TO_MILLISECONDS = 1000;
const MINUTE_TO_MILLISECONDS = 6e4; // 60 * SECOND_TO_MILLISECONDS;
const HOUR_TO_MILLISECONDS = 36e5; // 60 * MINUTE_TO_MILLISECONDS
const DAY_TO_MILLISECONDS = 864e5; // 24 * HOUR_TO_MILLISECONDS;
const MONTH_TO_MILLISECONDS = 2592e6; // 30 * DAY_TO_MILLISECONDS;

describe('When using the Duration formatter for future values', () => {
    it('should correctly format values a few seconds later', () => {
        const duration = new Duration(23 * SECOND_TO_MILLISECONDS); // 23 seconds
        expect(duration.humanize()).toBe('in a few seconds');
    });
    it('should correctly format values after the threshold for seconds->minutes (45 sec)', () => {
        const duration = new Duration(52 * SECOND_TO_MILLISECONDS); // 52 seconds
        expect(duration.humanize()).toBe('in 1 minute');
    });
    it('should correctly format values a minute later', () => {
        const duration = new Duration(63 * SECOND_TO_MILLISECONDS); // 1 minute and 3 seconds
        expect(duration.humanize()).toBe('in 1 minute');
    });
    it('should correctly format values a few minutes later', () => {
        const duration = new Duration(23.8 * MINUTE_TO_MILLISECONDS); // 23 minutes and 48 seconds
        expect(duration.humanize()).toBe('in 24 minutes');
    });
    it('should correctly format values after the threshold for minutes->hour (45 min)', () => {
        const duration = new Duration(52 * MINUTE_TO_MILLISECONDS); // 23 minutes and 48 seconds
        expect(duration.humanize()).toBe('in 1 hour');
    });
    it('should correctly format values a few hours later', () => {
        const duration = new Duration(8.39 * HOUR_TO_MILLISECONDS); // 8 hours, 23 minutes and 24 seconds
        expect(duration.humanize()).toBe('in 8 hours');
    });
    it('should correctly format values after the threshold for hour->day (22 hrs)', () => {
        const duration = new Duration(23 * HOUR_TO_MILLISECONDS); // 23 hours
        expect(duration.humanize()).toBe('in 1 day');
    });
    it('should correctly format values a few days later', () => {
        const duration = new Duration(11.63 * DAY_TO_MILLISECONDS); // 11 days, 15 hours and 12 minutes
        expect(duration.humanize()).toBe('in 12 days');
    });
    it('should correctly format values after the threshold for day->month (26 days)', () => {
        const duration = new Duration(27 * DAY_TO_MILLISECONDS); // 27 days
        expect(duration.humanize()).toBe('in 1 month');
    });
    it('should correctly format values a few months later', () => {
        const duration = new Duration(3 * 30 * DAY_TO_MILLISECONDS); // 3 months later
        expect(duration.humanize()).toBe('in 3 months');
    });
    it('should correctly format values after the threshold for month->year (26 days)', () => {
        const duration = new Duration(11.2 * MONTH_TO_MILLISECONDS); // 11 months 6 days later
        expect(duration.humanize()).toBe('in 1 year');
    });
    it('should correctly format values a few years later', () => {
        const duration = new Duration(12 * 12 * MONTH_TO_MILLISECONDS); // 12 years later
        expect(duration.humanize()).toBe('in 12 years');
    });
});
describe('When using the Duration formatter for past values', () => {
    it('should correctly format values a few seconds before', () => {
        const duration = new Duration(-23 * SECOND_TO_MILLISECONDS); // 23 seconds
        expect(duration.humanize()).toBe('a few seconds ago');
    });
    it('should correctly format values before the threshold for seconds->minutes (45 sec)', () => {
        const duration = new Duration(-52 * SECOND_TO_MILLISECONDS); // 52 seconds
        expect(duration.humanize()).toBe('1 minute ago');
    });
    it('should correctly format values a minute before', () => {
        const duration = new Duration(-63 * SECOND_TO_MILLISECONDS); // 1 minute and 3 seconds
        expect(duration.humanize()).toBe('1 minute ago');
    });
    it('should correctly format values a few minutes before', () => {
        const duration = new Duration(-23.8 * MINUTE_TO_MILLISECONDS); // 23 minutes and 48 seconds
        expect(duration.humanize()).toBe('24 minutes ago');
    });
    it('should correctly format values before the threshold for minutes->hour (45 min)', () => {
        const duration = new Duration(-52 * MINUTE_TO_MILLISECONDS); // 23 minutes and 48 seconds
        expect(duration.humanize()).toBe('1 hour ago');
    });
    it('should correctly format values a few hours before', () => {
        const duration = new Duration(-8.39 * HOUR_TO_MILLISECONDS); // 8 hours, 23 minutes and 24 seconds
        expect(duration.humanize()).toBe('8 hours ago');
    });
    it('should correctly format values before the threshold for hour->day (22 hrs)', () => {
        const duration = new Duration(-23 * HOUR_TO_MILLISECONDS); // 23 hours
        expect(duration.humanize()).toBe('1 day ago');
    });
    it('should correctly format values a few days before', () => {
        const duration = new Duration(-11.63 * DAY_TO_MILLISECONDS); // 11 days, 15 hours and 12 minutes
        expect(duration.humanize()).toBe('12 days ago');
    });
    it('should correctly format values before the threshold for day->month (26 days)', () => {
        const duration = new Duration(-27 * DAY_TO_MILLISECONDS); // 27 days
        expect(duration.humanize()).toBe('1 month ago');
    });
    it('should correctly format values a few months before', () => {
        const duration = new Duration(-3 * MONTH_TO_MILLISECONDS); // 3 months later
        expect(duration.humanize()).toBe('3 months ago');
    });
    it('should correctly format values before the threshold for month->year (26 days)', () => {
        const duration = new Duration(-11.2 * MONTH_TO_MILLISECONDS); // 11 months 6 days later
        expect(duration.humanize()).toBe('1 year ago');
    });
    it('should correctly format values a few years before', () => {
        const duration = new Duration(-12 * 12 * MONTH_TO_MILLISECONDS); // 12 years later
        expect(duration.humanize()).toBe('12 years ago');
    });
});
