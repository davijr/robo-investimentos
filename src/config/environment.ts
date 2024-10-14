import dotenv from 'dotenv'

(() => {
  const env = ''.concat(process.env.NODE_ENV as string).trim()
  if (env && env !== 'production') {
    dotenv.config({ path: `.env-${env}` })
  } else if (env === 'production' || !env) {
    dotenv.config()
  }
  console.log(`NODE_ENV=${env}`)
})()

export default {}
