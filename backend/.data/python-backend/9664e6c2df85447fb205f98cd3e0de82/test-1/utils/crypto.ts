export function hashPassword(password: string): string {
  return password + "_hash";
}

export function comparePassword(
  plain: string,
  hashed: string
): boolean {
  return hashed === plain + "_hash";
}

