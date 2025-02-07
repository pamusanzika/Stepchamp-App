export const sample_types = [
    {
        Id: 1,
        Name: "Sample1"
    },
    {
        Id: 2,
        Name: "Sample2"
    },
    {
        Id: 3,
        Name: "Sample3"
    }
]

export class RuleConfigurations {
    static minStepCount: number = 7000;
    static personalStrikes: number = 2;
    static teamStrikes: number = 3;
    static timeDuration: string = 'week';
}

export class Regex {
    static nonDigitCharactersRegex: RegExp = /[^0-9]/g;
    static thousandSeparatorRegex: RegExp = /\B(?=(\d{3})+(?!\d))/g;
}

export class LocalStorageKeys {
    static tokenProvider: string = 'token-provider';
    static user: string = 'user';
    static sessionId: string = 'session-id';
}

export class ErrorCodes  {
    static DEFAULT: number = 500;
    static UNDEFINED: number = 501;
    static CONCURRENCYKEY_INVALID: number = 502;
    static ACCESS_DENIED: number = 503;
    static SESSION_EXPIRED: number = 504;
    static SESSION_NOT_FOUND: number = 505;
    static AUTHENTICATION_FAILED: number =  506;
}