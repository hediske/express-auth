import {session} from express-session
import {config} from dotenv



const session = session({
    secret: config.get('SESSION_SECRET'),
    resave: false,
    saveUninitialized: false,
})

export default session