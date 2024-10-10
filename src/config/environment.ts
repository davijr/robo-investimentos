import dotenv from 'dotenv'

(() => {
  const env = ''.concat(process.env.NODE_ENV as string).trim()
  if (env && env !== 'prod') {
    dotenv.config({ path: `.env-${env}` })
  } else if (env === 'prod' || !env) {
    dotenv.config()
  }
  console.log(`NODE_ENV=${env}`)
})()

export default {}
