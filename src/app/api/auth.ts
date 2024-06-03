const m: Record<string, string> = {
  owHWR5GIZbAx54ONDqljAL0QZ2o8: 'y2ijo1pir5',
}
export const auth = async (req: Request) => {
  const token = req.headers.get('Authorization')

  if (!token) {
    throw new Error('Unauthorized')
  }
  const userId = m[token]
  return { userId }
}
