import bcrypt from 'bcrypt';

export async function hashPassword(plain:string) {
    return await bcrypt.hash(plain,12);
}

export async function verifyPassword(plani: string, hash:string){
    return bcrypt.compare(plani, hash);
}