import User from '#models/user'
import { login } from '#validators/auth/login'
import type { HttpContext } from '@adonisjs/core/http'
import type { User as UserType } from '@repo/types'

export default class LoginController {
  async login({ request, response, i18n }: HttpContext) {
    const { email, password } = await request.validateUsing(login)

    try {
      await User.findByOrFail({ email, isActive: true })
      const user = await User.verifyCredentials(email, password)
      const currentUser: UserType | null = null
      console.log(currentUser)
      return User.accessTokens.create(user, ['*'], {
        expiresIn: '1d',
      })
    } catch (error: any) {
      if (error.code === 'E_ROW_NOT_FOUND' || error.code === 'E_INVALID_CREDENTIALS') {
        return response.status(404).json({
          error: 'USER_NOT_FOUND',
          message: i18n.t('messages.user_not_found_auth'),
        })
      }
      return response.status(error?.status || 500).json({
        code: error?.code || 'SERVER_ERROR',
        message: error?.message || 'Une erreur est survenue, veuillez réessayer plus tard',
      })
    }
  }

  async me({ auth, response }: HttpContext) {
    const user: User = await auth.authenticate()
    return response.json(user)
  }
}
