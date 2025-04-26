import * as userSchema from '../users/schema';


export type Schema = typeof userSchema;
export const schema = {
    ...userSchema,

};