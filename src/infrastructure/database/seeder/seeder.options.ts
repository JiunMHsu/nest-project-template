export interface IUserSeed {
    email: string;
    password: string;
}

export class SeedOptions {
    public shouldClear = false;
    public superuser?: IUserSeed;

    constructor(args: string[]) {
        this.shouldClear = args.includes('--clear');

        this.superuser = this.getValues<IUserSeed>(args, {
            email: 'superuser-email',
            password: 'superuser-password',
        });
    }

    private getArgValue(args: string[], key: string): string | undefined {
        const arg = args.find(a => a.startsWith(`--${key}=`));
        return arg ? arg.split('=')[1] : undefined;
    }

    private getValues<T extends { [K in keyof T]: string }>(args: string[], options: T): T | undefined {
        const result = Object.entries(options).map(
            ([key, argKey]) => [key, this.getArgValue(args, argKey as string)] as [string, string | undefined],
        );

        const missing = result.filter(([, v]) => v === undefined);
        if (missing.length === result.length) return undefined;
        if (missing.length > 0) {
            throw new Error(`Missing required arguments: ${missing.map(([k]) => k).join(', ')}`);
        }

        return Object.fromEntries(result) as T;
    }
}
