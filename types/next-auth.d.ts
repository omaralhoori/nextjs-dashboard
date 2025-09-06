import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      accessToken?: string
      refreshToken?: string
      role?: string
      warehouseId?: string | null
      pharmacyId?: string | null
      enabled?: boolean
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    accessToken?: string
    refreshToken?: string
    role?: string
    warehouseId?: string | null
    pharmacyId?: string | null
    enabled?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    role?: string
    warehouseId?: string | null
    pharmacyId?: string | null
    enabled?: boolean
  }
}
