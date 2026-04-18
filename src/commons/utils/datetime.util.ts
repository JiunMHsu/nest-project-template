import { DateTime } from 'luxon';
import { APP_TIMEZONE } from '@commons/constants/timezone';

export class DateConverter {
    public static toLocalISO(date: Date | null | undefined): string | undefined {
        if (!date) return undefined;
        return DateTime.fromJSDate(date, { zone: 'utc' }).setZone(APP_TIMEZONE).toISO();
    }
}
