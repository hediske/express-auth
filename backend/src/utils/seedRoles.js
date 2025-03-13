import Role from '../models/Role.js'

const seedRoles = async () => {
    try {
        const roles = [
            { name: 'user' },
            { name: 'admin' }
        ]
        await Role.insertMany(roles)
        console.log('Roles seeded successfully');
    }
    catch (error) {
        console.error('Error seeding roles:', error);
    } 
}
export default seedRoles
