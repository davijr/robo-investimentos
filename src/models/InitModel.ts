import User from '@models/User'

export class InitModel {
    private static readonly modelInstances: any = {
      User
    }

    public static getInstance (modelName: string) {
      return this.modelInstances[modelName]
    }
}
