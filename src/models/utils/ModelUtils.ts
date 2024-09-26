
export class ModelUtils {
  public static transformModel (modelName: string, modelObject: any) {
    const fieldsObject = Object.assign({}, modelObject.getAttributes())
    const rawAttributes = Object.assign({}, modelObject.rawAttributes)
    const fields: any[] = []
    Object.keys(fieldsObject).forEach((fieldName: string) => {
      if (!this.getExcludedAttributes(modelName).includes(fieldName)) {
        fields.push({
          name: fieldsObject[fieldName].fieldName,
          label: this.convertCaseModel(fieldsObject[fieldName].fieldName, 'p', true),
          length: this.getLength(rawAttributes[fieldName]),
          type: this.getType(rawAttributes[fieldName], fieldsObject[fieldName].references),
          required: this.isRequired(fieldsObject[fieldName].allowNull),
          relationship: this.getReferences(fieldsObject[fieldName])
        })
      }
    })
    return {
      modelName,
      idField: modelObject.primaryKeyAttribute,
      fields
    }
  }

  private static getExcludedAttributes (modelName: string) {
    // defining exceptions
    if (['Audit'].includes(modelName)) {
      return ['id', 'deletedAt', 'updatedAt']
    }
    return ['id', 'createdAt', 'updatedAt', 'deletedAt']
  }

  private static getReferences (fieldObject: any) {
    return !fieldObject.references
      ? null
      : {
          name: this.convertCaseModel(fieldObject.references.model, 'p', false),
          showFields: [this.convertCaseModel(fieldObject.references.key, 'c', false)],
          idAttribute: fieldObject.references.key,
          data: []
        }
  }

  private static getLength (field: any) {
    return field.type?._length
  }

  private static getType (field: any, isRelationship = false): ('text' | 'number' | 'date' | 'json' | 'relationship') {
    const rawType = field.type?.key
    if (isRelationship) return 'relationship'
    if (['STRING', 'VARCHAR'].includes(rawType)) return 'text'
    if (['INTEGER'].includes(rawType)) return 'number'
    if (['DATE', 'DATEONLY'].includes(rawType)) return 'date'
    if (['JSONB'].includes(rawType)) return 'json'
    return 'text'
  }

  private static isRequired (allowNull: boolean) {
    if (allowNull === false) {
      return true
    }
    return false
  }

  /**
   * @param name .
   * @param type of c = camelCase, l = lower_case, o = original (default), p = PascalCase, u = UPPER_CASE
   * @returns name converted
   */
  private static convertCaseModel (name: string, type: ('c' | 'p' | 'l' | 'u'), withSpace = false) {
    const space = withSpace ? ' ' : ''
    if (type === 'c') {
      const words: string[] = name.split('_')
      let transformed = words[0]
      words.shift()
      words.forEach(w => {
        transformed += space + w.charAt(0).toUpperCase() + w.slice(1)
      })
      return transformed
    } else if (type === 'p') {
      return name.replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(' ')
        .map((word) => { return word[0].toUpperCase() + word.substring(1) })
        .join(space)
    } else if (type === 'l') {
      return name?.replace(/([A-Z])/g, space + '$1').trim() ?? ''
    } else if (type === 'u') {
      return name?.replace(/([A-Z])/g, space + '$1').trim().toUpperCase() ?? ''
    }
    return name
  }

  public static beautifyName (name: string) {
    return name?.replace(/([A-Z])/g, ' $1').trim().toUpperCase() ?? ''
  }

  public static sort (items: any, sortBy: string) {
    items.sort(function (a: any, b: any) {
      const valueA = a[sortBy].toUpperCase()
      const valueB = b[sortBy].toUpperCase()
      if (valueA < valueB) {
        return -1
      }
      if (valueA > valueB) {
        return 1
      }
      return 0
    })
  }

  public static getMenuItemName (item: any) {
    let itemName: string = item.replace(/([a-z])([A-Z])/g, '$1 $2')
    const words = itemName.split(' ')
    if (words.length > 1) {
      itemName = itemName.replace(words[0], '').trim()
    }
    return itemName
  }

  public static buildSearchOptions (modelObject: any) {
    const { searchOptions } = modelObject
    if (!searchOptions) {
      return {}
    } else if (!searchOptions.orderBy) {
      searchOptions.orderBy = modelObject.model.primaryKeyAttribute
    }
    return {
      order: [
        [searchOptions?.orderBy, searchOptions?.order || 'ASC'],
        ['createdAt', 'DESC']
      ],
      limit: searchOptions?.limit,
      offset: searchOptions?.page
    }
  }
}
