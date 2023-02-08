import robotJob from './robotJob'

class JobQueue {
    jobs: any

    constructor () {
      this.jobs = [
        robotJob
      ]
    }

    run () {}
}

export default new JobQueue()
