'use client'

import { FormEvent, useState, useTransition } from 'react'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { signUp } from '~/actions/auth'

export function SignUpForm() {
  const [isPending, startTransition] = useTransition()
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(() => signUp(formData))
  }
  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your email and password below to create an account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required disabled={isPending} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isPending}>
            Sign up
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
