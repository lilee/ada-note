"use server"

import { db } from "../db"
import { users } from "../db/schema"

export const getUsers = async () => {
  const users = await db().query.users.findMany()

  return users
}

export const createUser = async () => {
  const user = await db().insert(users).values({
    email: "laelli@foxmail.com",
    username: "laelli",
    nickname: "laelli",
    password:
      "345616f307c62eaf232f2d5e25c430958023c91436d2ef2caebb5b866b07ecd1",
    role: "admin",
  })
  return user
}
