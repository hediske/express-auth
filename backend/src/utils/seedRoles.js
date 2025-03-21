import Role from '../models/Role.js'
import { roles } from './roles.js'

const seedRoles = async () => {
    try {
        const roleList = roles.map(role => ({ name: role }))
        await Role.insertMany(roleList)
        console.log('Roles seeded successfully');
    }
    catch (error) {
        console.error('Error seeding roles:', error);
    } 
}

export default seedRoles 
