import jwt from 'jsonwebtoken'

export default function() {
    const { sub } = jwt.decode(this.__token__)
    
    return sub
}