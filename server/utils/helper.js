import { compareSync, genSaltSync, hashSync } from "bcrypt";

export function HashedPassword(password)
{
    const salt=genSaltSync();
    return hashSync(password,salt);
}

export function ComparePassword(raw,hashedPassword){
    return compareSync(raw,hashedPassword)
}


export function VerificationCode()
{
    const salt=genSaltSync();
    return hashSync(password,salt);
}