import { RequestModel } from "./RequestModel";

export class ModelUtils {

    public static parseToRequest(modelName: string, data: any): RequestModel {
        return {
            model: modelName,
            data: data
        }
    }

    public static parseModel(modelRef: any, modelFrom: any) {
      const newModel: any = Object.assign({}, modelFrom);
      Object.keys(modelRef).forEach((keyName: any) => {
        newModel[keyName] = modelRef[keyName];
      });
      return newModel;
    }
}