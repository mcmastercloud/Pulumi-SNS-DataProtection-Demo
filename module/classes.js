export class Attributes {
    name = "";
    main;
    dataProtection = false;
    dataProtectionIdentifiers = [];
    constructor(init) {
        Object.assign(this, init);
        this.main = {};
    }
}
export class PolicyArgs {
    name = "";
    account = "";
    region = "";
}
export class Response {
    topic;
    constructor(init) {
        Object.assign(this, init);
    }
}
//# sourceMappingURL=classes.js.map