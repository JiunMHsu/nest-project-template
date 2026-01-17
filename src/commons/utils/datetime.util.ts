import { DateTime } from 'luxon';
import { APP_TIMEZONE } from '@commons/constants/timezone';

export class DateConverter {
    public static toLocalISO(date: Date): string {
        return DateTime.fromJSDate(date, { zone: 'utc' }).setZone(APP_TIMEZONE).toISO();
    }
}
