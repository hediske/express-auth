import 'bcrypt' from 'bcryptjs'


const hashPassword = async(next) => {
    const salt = await bcrypt.genSalt(10)
    if (this.isModified('password') || this.isNew) {
        this.password = await bcrypt.hash(this.password, salt)
    }
    next()
}

const comparePassword = async(candidatePassword) => {
    return bcrypt.compare(candidatePassword, this.password)
}

export {hashPassword, comparePassword}