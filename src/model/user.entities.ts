export enum UserRole{
    User = 'user',
    Admin = 'admin',
    Instructor = 'instructor'
}

export class User{
    constructor(
        public readonly name:string,
        public readonly email:string,
        public readonly avatar:string,
        public readonly role:UserRole,
        public readonly isVerified:boolean,
        public readonly courses?:Array<{courseId:String}>,
        public password ?: string,
        public readonly _id?:string
    ){}
}