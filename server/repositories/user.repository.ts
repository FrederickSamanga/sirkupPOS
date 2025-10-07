import { User, Role } from '@prisma/client'
import { BaseRepository } from './base.repository'

export class UserRepository extends BaseRepository<User> {
  constructor(prisma: any) {
    super(prisma, 'user')
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.findFirst({
      where: { email },
    })
  }

  /**
   * Find active users
   */
  async findActive(): Promise<User[]> {
    return await this.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Find users by role
   */
  async findByRole(role: Role): Promise<User[]> {
    return await this.findMany({
      where: { role, active: true },
      orderBy: { name: 'asc' },
    })
  }

  /**
   * Check if email is taken
   */
  async isEmailTaken(email: string, excludeId?: string): Promise<boolean> {
    const where: any = { email }
    if (excludeId) {
      where.id = { not: excludeId }
    }

    const count = await this.count(where)
    return count > 0
  }

  /**
   * Get user with minimal data (for session)
   */
  async findForSession(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
      },
    })
  }

  /**
   * Update last login time
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.update(id, {
      lastLogin: new Date(),
    })
  }

  /**
   * Deactivate user
   */
  async deactivate(id: string): Promise<User> {
    return await this.update(id, { active: false })
  }

  /**
   * Activate user
   */
  async activate(id: string): Promise<User> {
    return await this.update(id, { active: true })
  }
}