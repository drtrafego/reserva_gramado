import 'server-only'
import { StackServerApp } from '@stackframe/stack'

const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID
const publishableKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
const secretKey = process.env.STACK_SECRET_SERVER_KEY

export const stackServerApp = projectId && publishableKey && secretKey
  ? new StackServerApp({ tokenStore: 'nextjs-cookie' })
  : null as unknown as StackServerApp
