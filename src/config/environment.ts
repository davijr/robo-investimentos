import dotenv from 'dotenv'

(() => {
  const env = ''.concat(process.env.NODE_ENV as string).trim()
  if (env) {
    dotenv.config({ path: `.env-${env}` })
  }
})()

export default {}
