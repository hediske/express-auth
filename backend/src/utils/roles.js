export const roles = ['student', 'teacher', 'admin'];
export const NoAdminRoles = 
roles.filter(role => role !== 'admin');