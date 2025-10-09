import type { User as PrismaUser } from "@prisma/client"

export type Credentials = {
  name: string
  password: string
}

export type User = Omit<PrismaUser, 'password'>

export type LoginResponse = {
  user: User
  accessToken: string
  refreshToken: string
}
