import User from '@models/User'

export class UserService {
  get (user: any) {
    if (!user) { return User.findAll() }
    return User.create(user)
  }

  create (user: any) {
    return User.create(user)
  }
}
