
class ResponseModel {
    model?: string
    message: string
    data?: any

    constructor (model: string, message: string, data: any) {
      this.model = model
      this.message = message
      this.data = data
    }
}

export default ResponseModel
