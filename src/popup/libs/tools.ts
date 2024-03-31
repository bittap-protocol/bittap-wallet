export function TestPassword(pwd) {
    return /^(?=.[a-z])(?=.[A-Z])(?=.*\d)[\s\S]{8,16}$/.test(pwd)
}